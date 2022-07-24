from .models import *
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ['username', 'profile_picture']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    users = serializers.SerializerMethodField('get_users')

    class Meta:
        model = Group
        fields = ['id', 'name', 'users']

    def get_users(self, obj):
        """get all users in requested team."""
        user_list = []
        for user in User.objects.filter(groups=obj):
            user_list.append(user.username)
        return user_list


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'logo']


class ProjectDetailSerializer(serializers.HyperlinkedModelSerializer):
    contributors = UserSerializer(source='get_user_profiles', many=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'logo', 'contributors',
                  'description', 'date']


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    groups = serializers.SerializerMethodField('get_groups')

    class Meta:
        model = User
        fields = ['username', 'profile_picture',
                  'bio', 'date_joined', 'groups']

    def get_groups(self, obj):
        groups = {}
        for group in obj.groups.all():
            groups[group.name] = {"id": Group.objects.get(
                name=group).id, "users": User.objects.filter(groups=group).count()}
        return groups


class MessageSerializer(serializers.HyperlinkedModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer(
        source='get_user_received_profiles', many=True)
    read = serializers.SerializerMethodField('check_user_read')

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content',
                  'timestamp', 'read', 'receiver']

    def check_user_read(self, obj):
        request = self.context.get('request', None)
        if request.user in obj.read.all():
            return True
        else:
            return False

    def update(self, instance, validated_data):
        instance.read.add(self.context['request'].user)
        instance.save()
        return instance


class AlertSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Alert
        fields = ['id', 'content', 'timestamp', 'read']


class BugSerializer(serializers.HyperlinkedModelSerializer):
    author = UserSerializer()
    project = ProjectSerializer()
    closed_by = UserSerializer()

    class Meta:
        model = Bug
        fields = ['id', 'title', 'author', 'content', 'date',
                  'priority', 'project', 'last_modified', 'solved', 'solved_text', 'closed_by']

    def update(self, instance, validated_data):
        instance.solved = validated_data.get('solved', instance.solved)
        instance.solved_text = validated_data.get(
            'solved_text', instance.solved_text)
        instance.closed_by = self.context['request'].user
        instance.save()
        return instance
