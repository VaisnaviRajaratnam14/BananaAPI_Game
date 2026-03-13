from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Profile, Level
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileSerializer, 
    LevelSerializer, LeaderboardSerializer, CustomTokenObtainPairSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
import math
import requests
import random

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
        time_taken = request.data.get('time', 0)

        # Update Profile stats
        profile.diamonds += diamonds_earned
        profile.gifts += gifts_earned
        profile.total_marks += diamonds_earned # Assuming total marks correlates with diamonds earned
        
        # Track stars per level
        level_obj, created = Level.objects.get_or_create(user=user, level_number=level_num)
        if stars > level_obj.stars_earned:
            level_obj.stars_earned = stars
        
        # Update time only if it's a new record (or first time)
        if level_obj.total_time_seconds == 0 or time_taken < level_obj.total_time_seconds:
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
