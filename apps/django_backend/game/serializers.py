from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Level, PuzzleHistory
import re

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['diamonds', 'energy', 'streak', 'gifts', 'total_marks', 'rank', 'current_level']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        if re.search(r'123456|password|qwerty', value, re.I):
            raise serializers.ValidationError("Avoid common password patterns.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', '').lower(),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['level_number', 'is_unlocked', 'stars_earned']

class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    score = serializers.IntegerField(source='total_marks')
    
    class Meta:
        model = Profile
        fields = ['username', 'score', 'rank', 'current_level']
