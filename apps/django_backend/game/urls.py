from django.urls import path
from .views import (
    RegisterView, UserStatsView, UpdateProfileView, 
    CollectRewardsView, LeaderboardView, ChangePasswordView,
    PuzzleView, CustomLoginView, GoogleAuthView, ForgotPasswordView,
    SaveBananaView,
    ResetPasswordConfirmView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('auth/google/', GoogleAuthView.as_view(), name='google_auth'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/password/forgot/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('auth/password/reset/', ResetPasswordConfirmView.as_view(), name='reset_password_confirm'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password_alias'),
    path('reset-password/', ResetPasswordConfirmView.as_view(), name='reset_password_alias'),
    path('user/stats/', UserStatsView.as_view(), name='user_stats'),
    path('user/update/', UpdateProfileView.as_view(), name='user_update'),
    path('game/puzzle/', PuzzleView.as_view(), name='game_puzzle'),
    path('game/collect/', CollectRewardsView.as_view(), name='game_collect'),
    path('game/save-banana/', SaveBananaView.as_view(), name='game_save_banana'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
