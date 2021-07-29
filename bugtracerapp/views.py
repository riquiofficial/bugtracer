# generic views
from django.http.response import JsonResponse
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
from rest_framework import viewsets, permissions, filters
import datetime


@login_required(login_url='login')
def index(request, slug=""):

    # pass request object in to forms to access user data
    bug_form = BugForm(request=request)
    project_form = ProjectForm(request=request)
    message_form = MessageForm(request=request)

    group_form = GroupForm

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

        # if contributors field exists, new project form has been posted
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

                # check group exists. if user in group add to project
                group = Group.objects.get(pk=data['group'])
                if group in request.user.groups.all():
                    new_project.group = group
                new_project.save()

                return JsonResponse({"message": "Project successfully created!"}, status=201)

            except ValueError:
                return JsonResponse({"error": "Please fill all fields correctly"}, status=400)
            except:
                JsonResponse(
                    {"error": "Something else went wrong"}, status=404)

        # if receiver in data, it is message form
        elif "receiver" in data:
            new_message = Message.objects.create(
                sender=request.user, content=data['content'])

            # multiple receivers
            all_receivers = list(data['receiver'].split(','))
            for receiver in all_receivers:
                # new message form submits user pks
                try:
                    new_message.receiver.add(receiver)
                # reply messages submits usernames
                except ValueError:
                    recipient = User.objects.get(username=receiver)
                    new_message.receiver.add(recipient)

            return JsonResponse({'message': 'successfully sent'})

        elif "group_name" in data:
            try:
                Group.objects.get(name=data['group_name'])
                return JsonResponse({'error': 'Team title already exists!'}, status=406)

            except Group.DoesNotExist:
                new_group = Group.objects.create(name=data['group_name'])
                new_group.save()
                request.user.groups.add(new_group)
                return JsonResponse({'message': 'Team successfully created!'}, status=201)

        elif "invite_group_name" in data:
            try:

                invited_user = User.objects.get(username=data["username"])
                invited_group = Group.objects.get(
                    name=data["invite_group_name"])
                if invited_group in invited_user.groups.all():
                    return JsonResponse({"error": f"{invited_user} is already a member of {invited_group}"}, status=409)

                else:
                    Alert.objects.create(
                        user=invited_user, content=f'{request.user.username} has invited you to join {invited_group}!<br /><button class="btn btn-success mr-2 btn-sm" data-user="{invited_user.username}" data-title="{invited_group.name}" name="accept_invite">Accept</button><button class="btn btn-secondary btn-sm" data-user="{invited_user.username}" data-title="{invited_group.name}" name="decline_invite">Decline</button>')
                    return JsonResponse({"message": "invitation successful"}, status=201)

            except User.DoesNotExist:
                return JsonResponse({'error': 'User does not exist'}, status=404)

            except Group.DoesNotExist:
                return JsonResponse({'error': 'Team does not exist'}, status=404)

        elif "invited_user" in data:
            try:
                invited_user = User.objects.get(username=data['invited_user'])
                invited_group = Group.objects.get(name=data['invite_to_team'])
                invited_user.groups.add(invited_group)
                nav_alert = Alert.objects.filter(pk=data['alert_id'])
                nav_alert.delete()
                return JsonResponse({'message': f'successfully joined {invited_group}'}, status=200)

            except:
                return JsonResponse({'error': 'There was a problem with your invitation'}, status=404)

        elif "declined_alert_id" in data:
            try:
                Alert.objects.filter(pk=data['declined_alert_id']).delete()
            except:
                return JsonResponse({'error': 'There was a problem declining your invitation'}, status=404)

        else:
            return JsonResponse({'error': 'not a valid form'}, status=403)

    # dashboard data

    groups = request.user.groups.all()

    active_bugs = []
    solved_bugs = []
    this_months_bugs = []
    all_projects = []

    # for each group user is in, add active, solved, this months bugs and projects
    for group in groups:
        active_bugs.append(Bug.objects.filter(
            project__group=group, solved=False).order_by('priority', '-date'))
        solved_bugs.append(Bug.objects.filter(
            project__group=group, solved=True).order_by('priority', '-date'))
        this_months_bugs.append(Bug.objects.filter(
            project__group=group, date__month=datetime.datetime.now().month))
        all_projects.append(Project.objects.filter(group=group))

    total_bugs = 0
    solved_bugs_percentage = 0

    if len(active_bugs):
        total_bugs += active_bugs[0].count()

    if len(solved_bugs):
        total_bugs += solved_bugs[0].count()
        if solved_bugs[0].count() > 0:
            solved_bugs_percentage = int(
                round(solved_bugs[0].count() / total_bugs * 100))
            

    if len(this_months_bugs):
        this_months_bugs = this_months_bugs[0].count()
    else:
        this_months_bugs = 0

    unread_messages = Message.objects.filter(
        receiver=request.user).exclude(read=request.user).count()

    total_projects = Project.objects.filter(contributors=request.user).count()

    bugs_per_project = {}
    if len(all_projects):
        for project in all_projects[0]:
            bugs_per_project[project.title] = Bug.objects.filter(
                project=project).count()


    return render(request, 'bugtracerapp/layout.html', {"bug_form": bug_form,
                                                        "project_form": project_form, "message_form": message_form,
                                                        "total_active_bugs": total_bugs, "solved_bugs": solved_bugs_percentage,
                                                        "unread_messages": unread_messages, "total_projects": total_projects,
                                                        'this_months_bugs': this_months_bugs, 'bugs_per_project': bugs_per_project, "groups": groups, 'group_form': group_form})

# REST FRAMEWORK CLASSES


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


class Teams(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    queryset = Group.objects.all()


class ActiveBugs(LoginRequiredMixin, viewsets.ModelViewSet):
    login_url = 'login'
    paginate_by = 10
    serializer_class = BugSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'author__username']
    lookup_field = 'id'

    # only get bugs in users team which have not been solved
    def get_queryset(self):
        queryset = Bug.objects.filter(
            project__group__in=self.request.user.groups.all()).exclude(solved=True).order_by('priority', '-date')
        return queryset


class Solved(LoginRequiredMixin, viewsets.ModelViewSet):
    login_url = 'login'
    ordering = ['-date']
    paginate_by = 10
    serializer_class = BugSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'author__username']

    # only get bugs in users team which have been solved
    def get_queryset(self):
        queryset = Bug.objects.filter(
            project__group__in=self.request.user.groups.all()).exclude(solved=False).order_by('-last_modified')
        return queryset


class Projects(LoginRequiredMixin, viewsets.ModelViewSet):
    login_url = 'login'
    ordering = ['title']
    paginate_by = 10
    serializer_class = ProjectDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'contributors__username']

    def get_queryset(self):
        groups = self.request.user.groups.all()
        queryset = []
        for group in groups:
            queryset.append(Project.objects.filter(group=group))
        return queryset[0]


class Profile(LoginRequiredMixin, viewsets.ModelViewSet):
    login_url = 'login'
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'username'

# EDIT VIEWS


class UpdateProject(LoginRequiredMixin, UpdateView):
    login_url = 'login'
    model = Project
    success_url = reverse_lazy('index')
    form_class = UpdateProjectForm

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def get_form_kwargs(self):
        kwargs = super(UpdateProject, self).get_form_kwargs()
        kwargs.update({'request': self.request})
        return kwargs


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

    def form_valid(self, form):
        self.object = form.save()
        Alert.objects.create(user=self.object,
                             content=f"Welcome to BugTracer, {self.object.username}! Get started by editing your profile or adding some projects and bugs. We have created a default team where you can add users to join you and create projects!")
        new_group = Group.objects.create(name=f"{self.object.username}'s Team")
        self.object.groups.add(new_group)
        return HttpResponseRedirect(self.get_success_url())
