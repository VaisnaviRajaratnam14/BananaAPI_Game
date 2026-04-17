
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Level',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level_number', models.IntegerField()),
                ('is_unlocked', models.BooleanField(default=False)),
                ('stars_earned', models.FloatField(default=0)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='levels', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'level_number')},
            },
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nickname', models.CharField(blank=True, max_length=100)),
                ('diamonds', models.IntegerField(default=500)),
                ('energy', models.IntegerField(default=10)),
                ('streak', models.IntegerField(default=0)),
                ('gifts', models.IntegerField(default=0)),
                ('total_marks', models.IntegerField(default=0)),
                ('rank', models.CharField(default='Novice', max_length=50)),
                ('current_level', models.IntegerField(default=1)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PuzzleHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('puzzle_id', models.CharField(max_length=100)),
                ('attempts', models.IntegerField(default=0)),
                ('score', models.IntegerField(default=0)),
                ('completed_at', models.DateTimeField(auto_now_add=True)),
                ('level', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game.level')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
