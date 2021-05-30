
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'messages', views.Messages, 'Message')
router.register(r'alerts', views.Alerts, 'Alert'),
router.register(r'solved', views.Solved, 'Solved'),
router.register(r"active", views.ActiveBugs, 'Bugs'),
router.register(r'projects', views.Projects, 'Projects')

urlpatterns = [
    path('', views.index, name='index'),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path("editproject/<int:pk>", views.UpdateProject.as_view(), name="edit_project"),
    path("search", views.search, name="search_view"),
    path("profile/<str:slug>", views.Profile.as_view(), name="profile"),
    path('profile/edit/<str:slug>',
         views.EditProfile.as_view(), name='edit_profile'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path('register', views.Register.as_view(), name='register'),
]
