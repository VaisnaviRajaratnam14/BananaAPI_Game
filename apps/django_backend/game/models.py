from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    diamonds = models.IntegerField(default=500)
    energy = models.IntegerField(default=10)
    streak = models.IntegerField(default=0)
    gifts = models.IntegerField(default=0)
    total_marks = models.IntegerField(default=0)
    rank = models.CharField(max_length=50, default="Novice")
    current_level = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Level(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='levels')
    level_number = models.IntegerField()
    is_unlocked = models.BooleanField(default=False)
    stars_earned = models.FloatField(default=0) # 0, 1, 2, 2.5, 3

    class Meta:
        unique_together = ('user', 'level_number')

    def __str__(self):
        return f"Level {self.level_number} - {self.user.username}"

class PuzzleHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    puzzle_id = models.CharField(max_length=100)
    attempts = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.puzzle_id}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        # Initialize level 1 as unlocked for new users
        Level.objects.create(user=instance, level_number=1, is_unlocked=True)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
