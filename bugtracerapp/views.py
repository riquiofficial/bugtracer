# generic views
from django.http.response import JsonResponse
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView

# authentication
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required

# front end responses
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse, reverse_lazy

# models and forms
from django.db.models import Q
from .models import *
from .forms import *

# REST framework
from .serializers import *
from rest_framework import viewsets, permissions
import json


@login_required(login_url='login')
def index(request):
    bug_form = BugForm
    project_form = ProjectForm
    update_project_form = UpdateProjectForm

    if request.method == "POST":
        data = request.POST

        # check all fields filled out
        for key, value in data.items():
            if value == "":
                return JsonResponse({"error": f"Please fill all fields, {key} was missing"}, status=401)

        # New Bug Form Submission. if data contains priority field it is bug form
        if "priority" in data:
            # check if bug already exists
            try:
                Bug.objects.get(title=data['title'])
                return JsonResponse({'error': 'Bug title already exists!'}, status=406)
            except Bug.DoesNotExist:
                # if does not exist, attempt to create bug
                try:
                    project = Project.objects.get(pk=data['project'])
                    bug = Bug.objects.create(title=data['title'], author=request.user,
                                             content=data['content'], priority=data['priority'], project=project)
                    bug.save()
                    return JsonResponse({"message": "Bug successfully added!"}, status=201)
                except ValueError:
                    return JsonResponse({"error": "Please fill all fields correctly"}, status=400)
                except:
                    JsonResponse(
                        {"error": "Something else went wrong"}, status=404)

        # if contributors field exists it is project form
        elif "contributors" in data:

            # check if project already exists
            try:
                Project.objects.get(title=data['title'])
                return JsonResponse({'error': 'Project title already exists!'}, status=406)
            # attempt adding new project
            except Project.DoesNotExist:
                new_project = Project.objects.create(
                    title=data['title'], description=data['description'], logo=request.FILES['logo'])

                # add multiple contributors
                all_contributors = [data['contributors'].split(',')]
                for num in all_contributors[0]:
                    new_project.contributors.add(num)

                new_project.save()

                return JsonResponse({"message": "Project successfully created!"}, status=201)

            except ValueError:
                return JsonResponse({"error": "Please fill all fields correctly"}, status=400)
            except:
                JsonResponse(
                    {"error": "Something else went wrong"}, status=404)

    return render(request, 'bugtracerapp/layout.html', {"bug_form": bug_form, "project_form": project_form, 'update_project_form': update_project_form})


class ActiveBugs(LoginRequiredMixin, viewsets.ModelViewSet):
    login_url = 'login'
    queryset = Bug.objects.filter(solved=False).order_by('priority', '-date')
    paginate_by = 10
    serializer_class = BugSerializer
    permission_classes = [permissions.IsAuthenticated]


class Solved(LoginRequiredMixin, viewsets.ModelViewSet):
    login_url = 'login'
    queryset = Bug.objects.filter(solved=True)
    ordering = ['-date']
    paginate_by = 10
    serializer_class = BugSerializer
    permission_classes = [permissions.IsAuthenticated]


class Projects(LoginRequiredMixin, viewsets.ModelViewSet):
    login_url = 'login'
    queryset = Project.objects.all()
    ordering = ['title']
    paginate_by = 10
    serializer_class = ProjectDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProjectDetail(LoginRequiredMixin, DetailView):
    login_url = 'login'
    model = Project

    # get and show bugs for this project
    def get_context_data(self, **kwargs):
        context = super(ProjectDetail, self).get_context_data(**kwargs)
        context['bug_list'] = Bug.objects.filter(
            project=context['object'], solved=False).order_by('priority')
        return context


class UpdateProject(LoginRequiredMixin, UpdateView):
    login_url = 'login'
    model = Project
    success_url = reverse_lazy('index')
    form_class = UpdateProjectForm

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)


class Profile(LoginRequiredMixin, DetailView):
    login_url = 'login'
    model = User
    slug_field = 'username'
    template_name = 'bugtracerapp/profile.html'


class EditProfile(LoginRequiredMixin, UpdateView):
    login_url = 'login'
    model = User
    slug_field = 'username'
    form_class = EditProfileForm
    template_name = 'bugtracerapp/edit_profile.html'

    def form_valid(self, form):
        form.instance.id = self.request.user.id
        return super().form_valid(form)


def login_view(request):
    if request.method == "POST":

        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "bugtracerapp/login.html", {
                "message": "Invalid username and/or password."})

    else:
        return render(request, "bugtracerapp/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


class Register(CreateView):
    model = User
    template_name = 'bugtracerapp/register.html'
    success_url = reverse_lazy('login')
    form_class = CreateUserForm


class Alerts(viewsets.ModelViewSet):
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user).order_by('-timestamp')


class Messages(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(receiver=self.request.user).order_by('-timestamp')


def search(request):
    if request.method == 'GET' and 'q' in request.GET:
        q = request.GET['q']
        # return 10 matches ordered by priority and solved
        bugs = Bug.objects.filter(Q(title__contains=q) | Q(
            content__contains=q)).order_by('priority', 'solved')[:10]
        projects = Project.objects.filter(
            Q(title__contains=q) | Q(description__contains=q))[:10]

        return render(request, 'bugtracerapp/searched.html', {'bug_list': bugs, 'project_list': projects})
    else:
        return render(request, '404.html')
