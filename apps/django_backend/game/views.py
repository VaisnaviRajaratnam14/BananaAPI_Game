from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Profile, Level
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer, LevelSerializer, LeaderboardSerializer
import math

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

class CollectRewardsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = user.profile
        diamonds_earned = request.data.get('diamonds', 0)
        gifts_earned = request.data.get('gifts', 0)
        level_num = request.data.get('level', 1)
        stars = request.data.get('stars', 0)

        # Update Profile stats
        profile.diamonds += diamonds_earned
        profile.gifts += gifts_earned
        profile.total_marks += diamonds_earned # Assuming total marks correlates with diamonds earned
        
        # Track stars per level
        level_obj, created = Level.objects.get_or_create(user=user, level_number=level_num)
        if stars > level_obj.stars_earned:
            level_obj.stars_earned = stars
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
