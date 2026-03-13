from django.urls import path
from .views import (
    RegisterView, UserStatsView, UpdateProfileView, 
    CollectRewardsView, LeaderboardView, ChangePasswordView,
    PuzzleView, CustomLoginView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/password/', ChangePasswordView.as_view(), name='change_password'),
    path('user/stats/', UserStatsView.as_view(), name='user_stats'),
    path('user/update/', UpdateProfileView.as_view(), name='user_update'),
    path('game/puzzle/', PuzzleView.as_view(), name='game_puzzle'),
    path('game/collect/', CollectRewardsView.as_view(), name='game_collect'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
