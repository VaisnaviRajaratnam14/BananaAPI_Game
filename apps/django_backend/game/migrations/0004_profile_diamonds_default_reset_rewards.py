from django.db import migrations, models


def reset_unplayed_profiles(apps, schema_editor):
    Profile = apps.get_model('game', 'Profile')
    Profile.objects.filter(current_level=1, total_marks=0).update(diamonds=0, gifts=0)


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_level_total_time_seconds'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='diamonds',
            field=models.IntegerField(default=0),
        ),
        migrations.RunPython(reset_unplayed_profiles, migrations.RunPython.noop),
    ]
