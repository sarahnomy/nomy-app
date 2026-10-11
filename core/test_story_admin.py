import uuid

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from .models import Story


class StoryAdminTests(TestCase):
    def setUp(self):
        admin = User.objects.create_superuser('moderator', 'admin@example.com', 'Test-admin-password')
        self.author = User.objects.create_user('story-author')
        self.client.force_login(admin)

    def payload(self, **changes):
        return {'author': self.author.pk, 'title': 'Moderation test', 'body': 'Sample story',
                'appearance': 'display-name', 'display_name': 'Test author',
                'status': 'published', **changes}

    def test_add_requires_author_and_creates_story_for_selected_account(self):
        url = reverse('admin:core_story_add')
        form = self.client.get(url).context['adminform'].form
        self.assertIn('author', form.fields)
        missing = self.client.post(url, self.payload(author=''))
        self.assertEqual(missing.status_code, 200)
        self.assertIn('author', missing.context['adminform'].form.errors)
        self.assertFalse(Story.objects.exists())
        saved = self.client.post(url, self.payload())
        self.assertEqual(saved.status_code, 302)
        story = Story.objects.get()
        self.assertEqual(story.author, self.author)
        self.assertEqual(story.status, 'published')
        self.assertIsInstance(story.client_id, uuid.UUID)

    def test_existing_story_author_cannot_be_changed(self):
        story = Story.objects.create(author=self.author, title='Original', body='Story', appearance='anonymous')
        other = User.objects.create_user('other-author')
        url = reverse('admin:core_story_change', args=[story.pk])
        self.assertNotIn('author', self.client.get(url).context['adminform'].form.fields)
        self.assertEqual(self.client.post(url, self.payload(author=other.pk)).status_code, 302)
        story.refresh_from_db()
        self.assertEqual(story.author, self.author)
