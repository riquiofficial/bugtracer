# Generated by Django 2.2.5 on 2021-04-11 17:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bugtracerapp', '0004_auto_20210318_2102'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
    ]
