
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_profile_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='level',
            name='total_time_seconds',
            field=models.IntegerField(default=0),
        ),
    ]
