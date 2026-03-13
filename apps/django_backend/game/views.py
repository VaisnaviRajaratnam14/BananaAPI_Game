from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Profile, Level
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileSerializer, 
    LevelSerializer, LeaderboardSerializer, CustomTokenObtainPairSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
import math
import requests
import random
import re
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token as google_id_token

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PuzzleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _difficulty_multiplier(self, level):
        mapping = {
            1: 1.0,
            2: 1.0,
            3: 1.0,
            4: 1.0,
            5: 1.0,
            6: 1.2,
            7: 1.35,
            8: 1.5,
            9: 1.7,
            10: 2.0,
        }
        return mapping.get(level, 2.0)

    def _arithmetic_challenge(self):
        a = random.randint(12, 65)
        b = random.randint(3, 12)
        c = random.randint(2, 10)
        mode = random.randint(0, 2)

        if mode == 0:
            question_text = f"{a} + {b} * {c}"
            correct_answer = a + (b * c)
        elif mode == 1:
            left = a * b
            question_text = f"{left} - {c} + {b}"
            correct_answer = left - c + b
        else:
            question_text = f"({a} - {b}) * {c}"
            correct_answer = (a - b) * c

        return question_text, str(correct_answer)

    def _sequence_challenge(self):
        sequence = []
        if random.random() < 0.5:
            start = random.randint(2, 12)
            diff = random.randint(2, 9)
            sequence = [start + (i * diff) for i in range(5)]
        else:
            start = random.randint(1, 5)
            ratio = random.choice([2, 3])
            sequence = [start * (ratio ** i) for i in range(5)]

        missing_index = random.choice([2, 3])
        missing_value = sequence[missing_index]
        display = [str(n) for n in sequence]
        display[missing_index] = "[?]"

        return ", ".join(display), str(missing_value)

    def _boss_algebra_challenge(self):
        x = random.randint(2, 12)
        a = random.randint(2, 9)
        b = random.randint(3, 18)
        c = a * x + b
        question_text = f"Solve for x: {a}x + {b} = {c}"
        return question_text, str(x)

    def get(self, request):
        raw_level = request.query_params.get("level") or getattr(request.user.profile, "current_level", 1)
        try:
            level = int(raw_level)
        except (TypeError, ValueError):
            level = 1

        try:
            if level <= 5:
                api_url = "https://marcconrad.com/uob/banana/api.php?out=json"
                response = requests.get(api_url, timeout=15)
                data = response.json()
                answer = str(data.get("solution"))
                return Response({
                    "id": f"banana-{random.randint(1000, 9999)}",
                    "question": data.get("question"),
                    "solution": answer,
                    "question_text": "Solve the banana puzzle",
                    "correct_answer": answer,
                    "difficulty_multiplier": self._difficulty_multiplier(level),
                    "type": "external",
                })

            if level in (6, 7):
                question_text, correct_answer = self._arithmetic_challenge()
                puzzle_type = "math-arithmetic"
            elif level in (8, 9):
                question_text, correct_answer = self._sequence_challenge()
                puzzle_type = "math-sequence"
            else:
                question_text, correct_answer = self._boss_algebra_challenge()
                puzzle_type = "math-boss"

            return Response({
                "id": f"math-{level}-{random.randint(1000, 9999)}",
                "question": question_text,
                "solution": correct_answer,
                "question_text": question_text,
                "correct_answer": correct_answer,
                "difficulty_multiplier": self._difficulty_multiplier(level),
                "type": puzzle_type,
            })
        except Exception as e:
            import traceback
            print(f"Error fetching puzzle: {str(e)}")
            traceback.print_exc()
            return Response({"error": f"Failed to fetch external puzzle: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def _unique_username(self, user_model, email, given_name):
        base = (given_name or email.split('@')[0] or "player").strip().lower()
        base = re.sub(r'[^a-z0-9_]', '', base) or "player"
        base = base[:20]

        username_field = getattr(user_model, "USERNAME_FIELD", "username")
        candidate = base
        i = 1
        while user_model.objects.filter(**{f"{username_field}__iexact": candidate}).exists():
            candidate = f"{base}{i}"
            i += 1
        return candidate

    def post(self, request):
        token = request.data.get('id_token')
        if not token:
            return Response({"error": "id_token is required"}, status=status.HTTP_400_BAD_REQUEST)

        google_client_id = (getattr(settings, "GOOGLE_CLIENT_ID", "") or "").strip()
        if not google_client_id:
            return Response({"error": "Google login is not configured on server"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            payload = google_id_token.verify_oauth2_token(
                token,
                GoogleRequest(),
                google_client_id,
            )

            if payload.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
                return Response({"error": "Google token audience mismatch"}, status=status.HTTP_400_BAD_REQUEST)

            email = (payload.get("email") or "").strip().lower()
            email_verified = str(payload.get("email_verified", "")).lower() == "true"
            if not email or not email_verified:
                return Response({"error": "Verified Google email is required"}, status=status.HTTP_400_BAD_REQUEST)

            first_name = (payload.get("given_name") or "").strip()
            last_name = (payload.get("family_name") or "").strip()

            user_model = get_user_model()
            user = user_model.objects.filter(email__iexact=email).first()
            if user is None:
                username = self._unique_username(user_model, email, first_name)
                create_data = {
                    user_model.USERNAME_FIELD: username,
                    "email": email,
                }
                if hasattr(user_model, "first_name"):
                    create_data["first_name"] = first_name
                if hasattr(user_model, "last_name"):
                    create_data["last_name"] = last_name

                user = user_model.objects.create(**create_data)
                user.set_unusable_password()
                user.save()

                if hasattr(user, 'profile') and not user.profile.nickname:
                    user.profile.nickname = first_name or username
                    user.profile.save()
            else:
                updated = False
                if first_name and hasattr(user, "first_name") and not user.first_name:
                    user.first_name = first_name
                    updated = True
                if last_name and hasattr(user, "last_name") and not user.last_name:
                    user.last_name = last_name
                    updated = True
                if updated:
                    user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            })
        except ValueError:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Google auth failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('currentPassword')
        new_password = request.data.get('newPassword')

        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate new password complexity
        serializer = RegisterSerializer()
        try:
            serializer.validate_password(new_password)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"})

class CollectRewardsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = user.profile
        diamonds_earned = request.data.get('diamonds', 0)
        gifts_earned = request.data.get('gifts', 0)
        level_num = request.data.get('level', 1)
        stars = request.data.get('stars', 0)
        raw_time_taken = request.data.get('time', 0)

        try:
            time_taken = int(raw_time_taken)
        except (TypeError, ValueError):
            time_taken = 0

        # Update Profile stats
        profile.diamonds += diamonds_earned
        profile.gifts += gifts_earned
        profile.total_marks += diamonds_earned # Assuming total marks correlates with diamonds earned
        
        # Track stars per level
        level_obj, created = Level.objects.get_or_create(user=user, level_number=level_num)
        if stars > level_obj.stars_earned:
            level_obj.stars_earned = stars
        
        # Update time only when client sends a valid positive duration.
        if time_taken > 0 and (level_obj.total_time_seconds == 0 or time_taken < level_obj.total_time_seconds):
            level_obj.total_time_seconds = time_taken
            
        level_obj.is_unlocked = True
        level_obj.save()

        # Advance current level if needed
        if level_num == profile.current_level:
            profile.current_level += 1
            # Unlock next level
            next_level, _ = Level.objects.get_or_create(user=user, level_number=profile.current_level)
            next_level.is_unlocked = True
            next_level.save()

        profile.save()
        
        return Response(UserSerializer(user).data)

class LeaderboardView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LeaderboardSerializer

    def get_queryset(self):
        return Profile.objects.order_by('-total_marks')[:10]
