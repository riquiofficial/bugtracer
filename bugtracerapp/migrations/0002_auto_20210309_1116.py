# Generated by Django 2.2.5 on 2021-03-09 11:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bugtracerapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='bug',
            name='Solved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='bug',
            name='last_modified',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='bug',
            name='priority',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='bug',
            name='title',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
