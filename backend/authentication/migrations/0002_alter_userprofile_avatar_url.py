from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='avatar_url',
            field=models.ImageField(
                blank=True,
                default='',
                upload_to='profile-avatars/',
            ),
        ),
    ]
