from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Level, PuzzleHistory
import re

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework.exceptions import AuthenticationFailed

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get("username")
        password = attrs.get("password")

        candidates = User.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        )

        matched_user = None
        found_any = candidates.exists()

        for candidate in candidates:
            if candidate.check_password(password):
                matched_user = candidate
                break

        if matched_user:
            attrs["username"] = matched_user.username
            return super().validate(attrs)
        elif found_any:
            raise AuthenticationFailed("Incorrect password")
        else:
            raise AuthenticationFailed("No account found with this username or email")

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['nickname', 'diamonds', 'energy', 'streak', 'gifts', 'total_marks', 'rank', 'current_level', 'avatar']

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['level_number', 'is_unlocked', 'stars_earned', 'total_time_seconds']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    levels = LevelSerializer(many=True, read_only=True)
    total_stars = serializers.SerializerMethodField()
    nickname = serializers.CharField(write_only=True, required=False)
    avatar = serializers.CharField(source='profile.avatar', write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'levels', 'total_stars', 'nickname', 'avatar']

    def get_total_stars(self, obj):
        total = 0.0
        for level in obj.levels.all():
            try:
                total += float(level.stars_earned or 0)
            except (TypeError, ValueError):
                continue
        return total

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        avatar = profile_data.get('avatar', None)

        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        
        profile = instance.profile
        profile.nickname = profile_data.get('nickname', profile.nickname)
        if avatar is not None:
            profile.avatar = avatar
        profile.save()
            
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    nickname = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'nickname']

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        return value

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate_password(self, value):
        if len(value) < 4:
            raise serializers.ValidationError("Password must be at least 4 characters.")
        return value

    def create(self, validated_data):
        nickname = validated_data.pop('nickname', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', '').lower(),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        if nickname:
            user.profile.nickname = nickname
            user.profile.save()
        return user

class LeaderboardSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id')
    username = serializers.CharField(source='user.username')
    score = serializers.IntegerField(source='total_marks')
    
    class Meta:
        model = Profile
        fields = ['id', 'username', 'score', 'rank', 'current_level']
