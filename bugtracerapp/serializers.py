from .models import *
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ['username', 'profile_picture']


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'logo']


class MessageSerializer(serializers.HyperlinkedModelSerializer):
    sender = UserSerializer()

    class Meta:
        model = Message
        fields = ['sender', 'content', 'timestamp', 'read']


class AlertSerializer(serializers.HyperlinkedModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Alert
        fields = ['user', 'content', 'timestamp', 'read']


class BugSerializer(serializers.HyperlinkedModelSerializer):
    author = UserSerializer()
    project = ProjectSerializer()

    class Meta:
        model = Bug
        fields = ['id', 'title', 'author', 'content', 'date',
                  'priority', 'project', 'last_modified', 'solved']
