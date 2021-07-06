
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'messages', views.Messages, 'Message')
router.register(r'alerts', views.Alerts, 'Alert'),
router.register(r'solved', views.Solved, 'Solved'),
router.register(r"active", views.ActiveBugs, 'Bugs'),
router.register(r'projects', views.Projects, 'Projects')
router.register(r'profile', views.Profile, 'Profile')
router.register(r'teams', views.Teams, 'Teams'),

urlpatterns = [
    path('', views.index, name='index'),

    # dynamic javascript pages
    path('activeBugs', views.index, name="active_bugs"),
    path('resolvedBugs', views.index, name="resolved_bugs"),
    path('registerBug', views.index, name="register_bug"),
    path('allProjects', views.index, name="projects"),
    path('registerProject', views.index, name="register_project"),
    path('search', views.index, name="search"),
    path('messages', views.index, name="messages"),
    path('alerts', views.index, name='alerts'),
    path('newMessage', views.index, name='new_message'),
    path("profile/<str:slug>", views.index, name="profile"),
    path('myTeams', views.index, name="my_teams"),
    path('team/<str:slug>', views.index, name='team'),
    path('newTeam', views.index, name="new_team"),

    # django rest framework
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # generic django views
    path("editproject/<int:pk>", views.UpdateProject.as_view(), name="edit_project"),
    # path("profile/<str:slug>", views.Profile.as_view(), name="profile"),
    path('profile/edit/<str:slug>',
         views.EditProfile.as_view(), name='edit_profile'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path('register', views.Register.as_view(), name='register'),
]
