# Generated by Django 2.2.5 on 2021-06-03 08:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bugtracerapp', '0008_auto_20210512_1145'),
    ]

    operations = [
        migrations.AddField(
            model_name='bug',
            name='closed_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='closed_by', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='bug',
            name='solved_text',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='project',
            name='contributors',
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
        ),
    ]