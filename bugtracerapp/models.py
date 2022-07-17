from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from django.core.validators import MaxValueValidator, MinValueValidator
from django.urls import reverse


class User(AbstractUser):
    """User extended from Django's defualt AbstractUser."""
    profile_picture = models.ImageField(
        upload_to="profile-pics/", null=True, blank=True, default="profile-pics/undraw_profile.svg")
    bio = models.CharField(max_length=200, null=True, blank=True)

    def get_absolute_url(self):
        """Get correct profile page on edit profile form submission."""
        return reverse('profile', kwargs={'slug': self.username})


class Message(models.Model):
    """Messages users send to each other."""
    sender = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="sent_messages")
    receiver = models.ManyToManyField(User, related_name="received_messages")
    content = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.ManyToManyField(User, related_name="read")

    # for use by message serializer to get multiple received messages
    def get_user_received_profiles(self):
        """Users who the message was sent to."""
        user_list = []
        for user in self.receiver.all():
            user_list.append(user)
        return user_list

    def __str__(self):
        return f"{self.id}: message sent by {self.sender} to {[receiver.username for receiver in self.receiver.all()]} on {self.timestamp.strftime('%d %B, %Y, %H:%M')}"


class Alert(models.Model):
    """Alerts sent to users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Alert to {self.user}: {self.content[0:20]}... on {self.timestamp}"


class Bug(models.Model):
    """Bug in a project."""
    title = models.CharField(max_length=50, blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=500)
    date = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    priority = models.IntegerField(
        default=3, validators=[MaxValueValidator(3), MinValueValidator(1)])
    solved = models.BooleanField(default=False)
    solved_text = models.CharField(max_length=500, blank=True, null=True)
    closed_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="closed_by", blank=True, null=True)
    project = models.ForeignKey(
        "Project", on_delete=models.CASCADE, blank=True, null=True)

    class Meta:
        ordering = ['-date', 'solved']

    def __str__(self):
        return f"{self.title} (reported on {self.date} by {self.author})"


class Project(models.Model):
    """Project being worked on."""
    title = models.CharField(max_length=50, blank=True, null=True)
    contributors = models.ManyToManyField(User, blank=True)
    description = models.CharField(max_length=500)
    date = models.DateTimeField(auto_now_add=True)
    logo = models.ImageField(upload_to="logos/", null=True, blank=True)
    group = models.ForeignKey(
        Group, blank=True, null=True, on_delete=models.CASCADE)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title.__str__()

    # get contributors for a project
    def get_user_profiles(self):
        """Get all users who are contributors of the project."""
        user_list = []
        for user in self.contributors.all():
            user_list.append(user)
        return user_list
