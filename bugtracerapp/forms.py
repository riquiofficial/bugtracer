from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User, Bug, Project, Message, Group


class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'id': 'group_name'})
        }


class BugForm(forms.ModelForm):

    class Meta:
        CHOICES = (('1', 'High Priority'),
                   ('2', 'Medium Priority'),
                   ('3', 'Low Priority'))

        model = Bug
        fields = ['title', 'content', 'priority', 'project']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control mb-2'}),
            'content': forms.Textarea(attrs={'class': 'form-control mb-2'}),
            'priority': forms.Select(attrs={'class': 'form-control mb-2'}, choices=CHOICES),
            'project': forms.Select(attrs={'class': 'form-control mb-2'}),
        }

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(BugForm, self).__init__(*args, **kwargs)
        self.fields['project'].queryset = Project.objects.filter(
            contributors=self.request.user)


class ProjectForm(forms.ModelForm):

    # only get users from same team/group as user
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(ProjectForm, self).__init__(*args, **kwargs)
        queryset = User.objects.filter(groups__in=self.request.user.groups.all())
        # do not return duplicate users: call distinct method.
        self.fields['contributors'].queryset = queryset.distinct()
        self.fields['group'].queryset = self.request.user.groups.all()

    class Meta:
        model = Project
        fields = ['title', 'contributors', 'description', 'logo', 'group']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control mb-2', 'id': 'project_name'}),
            'contributors': forms.SelectMultiple(attrs={'class': 'form-control mb-2'}),
            'description': forms.Textarea(attrs={'class': 'form-control mb-2'}),
            'logo': forms.ClearableFileInput(attrs={'class': 'custom-file mb-2'}),
            'group': forms.Select(attrs={'class': 'form-control mb-2'})

        }


class UpdateProjectForm(forms.ModelForm):

    # only get users from same team/group as project
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(UpdateProjectForm, self).__init__(*args, **kwargs)
        self.fields['contributors'].queryset = User.objects.filter(
            groups=self.instance.group)
        self.fields['group'].queryset = self.request.user.groups.all()

    class Meta:
        model = Project
        fields = ['title', 'contributors', 'description', 'logo', 'group']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control mb-2', 'id': 'update-project-name'}),
            'contributors': forms.SelectMultiple(attrs={'class': 'form-control mb-2', 'id': 'update-contributors'}),
            'description': forms.Textarea(attrs={'class': 'form-control mb-2', 'id': 'update-description'}),
            'logo': forms.ClearableFileInput(attrs={'class': 'custom-file mb-2', 'id': 'update-logo'}),
            'group': forms.Select(attrs={'class': 'form-control mb-2', 'id': 'update-group'})
        }


class CreateUserForm(UserCreationForm):

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update(
                {'class': 'form-control form-control-user', 'placeholder': self.fields[field].label})


class EditProfileForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ['profile_picture', 'bio']
        widgets = {
            'profile_picture': forms.ClearableFileInput(attrs={'class': 'custom-file mb-2'}),
            'bio': forms.Textarea(attrs={'class': 'form-control mb-2'})
        }


class MessageForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(MessageForm, self).__init__(*args, **kwargs)
        queryset = User.objects.filter(groups__in=self.request.user.groups.all())
        # do not return duplicate users: call distinct method.
        self.fields['receiver'].queryset = queryset.distinct()

    class Meta:
        model = Message
        fields = ['content', 'receiver']
        widgets = {
            'content': forms.Textarea(attrs={'class': 'form-control', 'id': 'messageContent'}),
            'receiver': forms.SelectMultiple(attrs={'class': 'form-control'})
        }
