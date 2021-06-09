from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User, Bug, Project


class BugForm(forms.ModelForm):

    class Meta:
        model = Bug
        fields = ['title', 'content', 'priority', 'project']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control mb-2'}),
            'content': forms.Textarea(attrs={'class': 'form-control mb-2'}),
            'priority': forms.TextInput(attrs={'class': 'form-control mb-2'}),
            'project': forms.Select(attrs={'class': 'form-control mb-2'}),
        }


class ProjectForm(forms.ModelForm):

    class Meta:
        model = Project
        fields = ['title', 'contributors', 'description', 'logo']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control mb-2', 'id': 'project_name'}),
            'contributors': forms.SelectMultiple(attrs={'class': 'form-control mb-2'}),
            'description': forms.Textarea(attrs={'class': 'form-control mb-2'}),
            'logo': forms.ClearableFileInput(attrs={'class': 'custom-file mb-2'})
        }


class UpdateProjectForm(forms.ModelForm):

    class Meta:
        model = Project
        fields = ['title', 'contributors', 'description', 'logo']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control mb-2', 'id': 'update-project-name'}),
            'contributors': forms.SelectMultiple(attrs={'class': 'form-control mb-2', 'id': 'update-contributors'}),
            'description': forms.Textarea(attrs={'class': 'form-control mb-2', 'id': 'update-description'}),
            'logo': forms.ClearableFileInput(attrs={'class': 'custom-file mb-2', 'id': 'update-logo'})
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
