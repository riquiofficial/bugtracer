from django.test import TestCase, Client
from .models import User, Bug


class Tests(TestCase):

    def setUp(self):
        # Users

        user1 = User.objects.create(
            username="riqui", password="testpass1", email="test@example.com")

        user2 = User.objects.create(
            username="trucis", password="testpass1", email="example@test.com")

        # Bugs

        bug1 = Bug.objects.create(
            title="Does Not Work", author=user1, content="fix my printer", priority=1)
        bug2 = Bug.objects.create(
            title="Test Bug", author=user2, content="bugged out today", priority=2)

    # SERVER TESTS
    # bug properties
    def test_solved_as_default(self):
        user1 = User.objects.get(pk=1)
        user2 = User.objects.get(pk=2)

        bug1 = Bug.objects.get(author=user1)
        bug2 = Bug.objects.get(author=user2)

        self.assertEqual(bug1.solved, False)
        self.assertNotEqual(bug1.priority, 3)

        self.assertEqual(bug2.solved, False)
        self.assertNotEqual(bug2.priority, 1)

    def test_total_bugs(self):
        bugs = Bug.objects.all()

        self.assertEqual(bugs.count(), 2)

    # CLIENT TESTS

    def test_index_redirect_if_not_logged_in(self):
        c = Client()
        # store client request and context
        response = c.get("")
        # bugs = response.context["bug_list"]

        # test redirect to login page
        self.assertEqual(response.status_code, 302)
        # self.assertEqual(len(bugs), 2)

    def test_login(self):
        c = Client()
