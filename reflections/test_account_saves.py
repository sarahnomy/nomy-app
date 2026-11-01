import base64
import json
from datetime import timedelta
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from users.mobile_auth import issue_mobile_session
from users.models import MobileSession
from .models import AccountSave, EmotionReflection

class AccountSaveTests(TestCase):
    def setUp(self):
        self.a = User.objects.create_user('reader-a', password='test-password')
        self.b = User.objects.create_user('reader-b', password='test-password')
        self.headers = {'HTTP_AUTHORIZATION': 'Bearer ' + issue_mobile_session(self.a)}
        self.other = {'HTTP_AUTHORIZATION': 'Bearer ' + issue_mobile_session(self.b)}
        self.url = reverse('mobile_account_saves')
        self.body = {'kind': 'check-in', 'data': {'period': 'morning', 'reflection': 'Private note'}}
    def save(self, body=None, headers=None):
        return self.client.post(self.url, json.dumps(body or self.body), content_type='application/json', **(self.headers if headers is None else headers))
    def test_all_saves_require_a_valid_bearer_session(self):
        self.assertEqual(self.save(headers={}).status_code, 401)
        self.assertEqual(self.save(headers={'HTTP_AUTHORIZATION': 'Bearer invalid'}).status_code, 401)
        MobileSession.objects.filter(user=self.a).update(expires_at=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.save().status_code, 401)
        self.assertEqual(AccountSave.objects.count(), 0)
    def test_account_isolation_and_owner_comes_from_token_not_body(self):
        self.assertEqual(self.save({**self.body, 'user_id': self.b.id}).status_code, 201)
        self.assertEqual(AccountSave.objects.get().user_id, self.a.id)
        self.assertEqual(len(self.client.get(self.url, {'kind': 'check-in'}, **self.headers).json()['items']), 1)
        self.assertEqual(self.client.get(self.url, {'kind': 'check-in'}, **self.other).json()['items'], [])
        self.assertEqual(self.client.get(self.url, {'kind': 'check-in'}).status_code, 401)
    def test_idempotent_reflection_and_story_add_remove(self):
        body = {**self.body, 'key': 'same-draft'}
        self.save(body); self.save(body)
        self.assertEqual(AccountSave.objects.count(), 1)
        story = {'kind': 'story-saved', 'data': {'storyId': 'masking'}, 'selected': True}
        self.save(story); self.save(story)
        self.assertEqual(AccountSave.objects.filter(kind='story-saved').count(), 1)
        self.save({**story, 'selected': False}, headers=self.other)
        self.assertEqual(AccountSave.objects.filter(kind='story-saved').count(), 1)
        self.save({**story, 'selected': False})
        self.assertEqual(AccountSave.objects.filter(kind='story-saved').count(), 0)
    def test_express_text_and_voice_are_stored_in_database_not_device_paths(self):
        data = {'style': 'direct', 'mode': 'text', 'scenario': 'A conversation', 'suggestedResponse': 'Hello', 'reflection': 'My words'}
        self.assertEqual(self.save({'kind': 'express', 'data': data}).status_code, 201)
        audio = b'private-audio'
        voice = {**data, 'mode': 'voice', 'audioBase64': base64.b64encode(audio).decode(), 'audioDurationMillis': 1000, 'audioUri': 'file:///private/device.m4a'}
        response = self.save({'kind': 'express', 'data': voice})
        self.assertEqual(response.status_code, 201)
        saved = AccountSave.objects.get(pk=response.json()['item']['id'])
        self.assertEqual(bytes(saved.audio), audio)
        self.assertNotIn('audioUri', saved.data)
        self.assertNotIn('audioBase64', response.json()['item'])
    def test_invalid_inputs_never_create_saves(self):
        for body in [[], {'kind': []}, {'kind': 'unknown'}, {**self.body, 'data': {}}, {**self.body, 'data': {'period': 'other', 'reflection': 'hello'}}, {**self.body, 'data': {'period': 'morning', 'reflection': ''}}, {'kind': 'story-saved', 'data': {'storyId': 'masking'}, 'selected': 'yes'}]:
            with self.subTest(body=body):
                response = self.client.post(self.url, json.dumps(body), content_type='application/json', **self.headers)
                self.assertEqual(response.status_code, 400)
        self.assertEqual(AccountSave.objects.count(), 0)
    def test_emotionize_save_and_fetch_are_owned_by_authenticated_account(self):
        response = self.client.post(reverse('mobile_save_emotion'), json.dumps({'user_id': self.b.id, 'emotion': 'Calm', 'text': 'Private reflection'}), content_type='application/json', **self.headers)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(EmotionReflection.objects.get().user_id, self.a.id)
        self.assertEqual(self.client.get(reverse('mobile_get_emotion'), {'user_id': self.a.id}, **self.other).json()['reflections'], [])

    def test_invalid_or_oversized_voice_is_rejected_without_saving(self):
        data = {'style': 'direct', 'mode': 'voice', 'scenario': '', 'suggestedResponse': '', 'reflection': 'Voice note', 'audioDurationMillis': 1000}
        for encoded in ['invalid base64!', '', 'A' * 1400004]:
            with self.subTest(size=len(encoded)):
                self.assertEqual(self.save({'kind': 'express', 'data': {**data, 'audioBase64': encoded}}).status_code, 400)
        self.assertEqual(AccountSave.objects.count(), 0)
