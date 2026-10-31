import hashlib
import json
from datetime import timedelta

from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.utils import timezone

from users.mobile_auth import mobile_user
from users.models import MobileSession
from django.test import RequestFactory


class MobileLoginTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('reader', 'reader@example.com', 'LoginTest-938!')
        self.client = Client(enforce_csrf_checks=True)

    def post(self, body):
        return self.client.post('/api/mobile/login/', json.dumps(body), content_type='application/json')

    def test_username_and_email_login_without_csrf_or_previous_session(self):
        for identifier in ('reader', ' READER@EXAMPLE.COM '):
            self.client = Client(enforce_csrf_checks=True)
            response = self.post({'username': identifier, 'password': 'LoginTest-938!'})
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data['ok'])
            self.assertEqual(data['user']['id'], self.user.pk)
            token = data['user']['session_token']
            session = MobileSession.objects.get(token_hash=hashlib.sha256(token.encode()).hexdigest())
            self.assertGreater(session.expires_at, timezone.now())
            self.assertNotEqual(session.token_hash, token)

    def test_invalid_credentials(self):
        for name in ('reader', 'missing', 'reader@example.com'):
            self.assertEqual(self.post({'username': name, 'password': 'incorrect'}).status_code, 401)
        self.assertEqual(MobileSession.objects.count(), 0)

    def test_invalid_input(self):
        for body in (None, [], 'bad', {}, {'username': 123}, {'username': 'reader', 'password': []},
                     {'username': ' ', 'password': 'x'}, {'username': 'reader', 'password': ''}):
            with self.subTest(body=body):
                self.assertEqual(self.post(body).status_code, 400)
        self.assertEqual(self.client.post('/api/mobile/login/', '{', content_type='application/json').status_code, 400)

    def test_inactive_account_stays_blocked(self):
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.post({'username': self.user.email, 'password': 'LoginTest-938!'}).status_code, 403)

    def test_duplicate_email_is_not_arbitrarily_selected(self):
        User.objects.create_user('other', self.user.email, 'LoginTest-938!')
        self.assertEqual(self.post({'username': self.user.email, 'password': 'LoginTest-938!'}).status_code, 401)
        self.assertEqual(self.post({'username': 'reader', 'password': 'LoginTest-938!'}).status_code, 200)

    def test_exact_username_takes_priority_over_email(self):
        User.objects.create_user(self.user.email, 'other@example.com', 'OtherTest-938!')
        self.assertEqual(self.post({'username': self.user.email, 'password': 'LoginTest-938!'}).status_code, 401)

    def test_logout_revokes_token_and_login_issues_fresh_token(self):
        body = {'username': 'reader', 'password': 'LoginTest-938!'}
        token = self.post(body).json()['user']['session_token']
        self.assertEqual(self.client.post('/api/mobile/logout/', HTTP_AUTHORIZATION=f'Bearer {token}').status_code, 200)
        self.assertFalse(MobileSession.objects.exists())
        self.assertNotEqual(self.post(body).json()['user']['session_token'], token)

    def test_invalid_expired_and_missing_tokens_rejected(self):
        token = self.post({'username': 'reader', 'password': 'LoginTest-938!'}).json()['user']['session_token']
        MobileSession.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        for value in ('', 'Bearer invalid', f'Bearer {token}'):
            request = RequestFactory().get('/', HTTP_AUTHORIZATION=value)
            self.assertIsNone(mobile_user(request))
