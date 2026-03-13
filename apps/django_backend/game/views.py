from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
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

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PuzzleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Banana API endpoint
            api_url = "https://marcconrad.com/uob/banana/api.php?out=json"
            response = requests.get(api_url, timeout=15)
            data = response.json()
            
            # Format response for frontend
            return Response({
                "id": f"banana-{random.randint(1000, 9999)}",
                "question": data.get('question'),
                "solution": data.get('solution'),
                "type": "external"
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

    def _unique_username(self, email, given_name):
        base = (given_name or email.split('@')[0] or "player").strip().lower()
        base = re.sub(r'[^a-z0-9_]', '', base) or "player"
        base = base[:20]

        candidate = base
        i = 1
        while User.objects.filter(username__iexact=candidate).exists():
            candidate = f"{base}{i}"
            i += 1
        return candidate

    def post(self, request):
        id_token = request.data.get('id_token')
        if not id_token:
            return Response({"error": "id_token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_info = requests.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
                timeout=10,
            )
            if token_info.status_code != 200:
                return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

            payload = token_info.json()
            google_client_id = (getattr(settings, "GOOGLE_CLIENT_ID", "") or "").strip()
            if google_client_id and payload.get("aud") != google_client_id:
                return Response({"error": "Google token audience mismatch"}, status=status.HTTP_400_BAD_REQUEST)

            email = (payload.get("email") or "").strip().lower()
            email_verified = str(payload.get("email_verified", "")).lower() == "true"
            if not email or not email_verified:
                return Response({"error": "Verified Google email is required"}, status=status.HTTP_400_BAD_REQUEST)

            first_name = (payload.get("given_name") or "").strip()
            last_name = (payload.get("family_name") or "").strip()

            user = User.objects.filter(email__iexact=email).first()
            if user is None:
                username = self._unique_username(email, first_name)
                user = User.objects.create(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                )
                user.set_unusable_password()
                user.save()

                if hasattr(user, 'profile') and not user.profile.nickname:
                    user.profile.nickname = first_name or username
                    user.profile.save()
            else:
                updated = False
                if first_name and not user.first_name:
                    user.first_name = first_name
                    updated = True
                if last_name and not user.last_name:
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
        except requests.RequestException:
            return Response({"error": "Failed to validate Google token"}, status=status.HTTP_502_BAD_GATEWAY)
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
