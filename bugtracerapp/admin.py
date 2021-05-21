from django.contrib import admin

from .models import User, Bug, Project, Alert, Message

# Register your models here.

admin.site.register(User)
admin.site.register(Bug)
admin.site.register(Project)
admin.site.register(Alert)
admin.site.register(Message)
