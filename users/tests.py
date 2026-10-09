import json
from datetime import date

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from reflections.models import DailyReflection
from users.models import EmailVerification


class MobileAccountDeletionTests(TestCase):
    def setUp(self):
        self.password = 'DeletionTestPassword-829!'
        self.user = User.objects.create_user('delete-me', 'delete@example.com', self.password)
        self.other = User.objects.create_user('keep-me', 'keep@example.com', self.password)
        self.url = reverse('mobile_delete_account')
        self.body = {'user_id': self.user.pk, 'username': self.user.username, 'password': self.password}

    def post(self, body):
        return self.client.post(self.url, json.dumps(body), content_type='application/json')

    def test_password_confirmation_deletes_account_and_related_data_without_cookie(self):
        EmailVerification.objects.create(user=self.user)
        DailyReflection.objects.create(user=self.user, date=date.today(), goal='Test reflection')
        response = self.post(self.body)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['ok'])
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())
        self.assertFalse(EmailVerification.objects.filter(user_id=self.user.pk).exists())
        self.assertFalse(DailyReflection.objects.filter(user_id=self.user.pk).exists())
        self.assertTrue(User.objects.filter(pk=self.other.pk).exists())
        self.assertFalse(self.client.login(username=self.user.username, password=self.password))

    def test_details_without_password_cannot_delete(self):
        body = {k: v for k, v in self.body.items() if k != 'password'}
        body['email'] = self.user.email
        self.assertEqual(self.post(body).status_code, 400)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_wrong_password_preserves_account(self):
        self.assertEqual(self.post({**self.body, 'password': 'incorrect'}).status_code, 401)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_credentials_cannot_delete_a_different_account(self):
        body = {**self.body, 'user_id': self.other.pk}
        self.assertEqual(self.post(body).status_code, 403)
        self.assertEqual(User.objects.count(), 2)

    def test_logged_in_session_does_not_bypass_password(self):
        self.client.force_login(self.user)
        self.assertEqual(self.post({**self.body, 'password': ''}).status_code, 400)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_success_ends_existing_session(self):
        self.client.force_login(self.user)
        self.assertEqual(self.post(self.body).status_code, 200)
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_invalid_payloads_do_not_delete(self):
        for body in (None, [], 'bad', {'username': 12, 'password': 'value'}, {**self.body, 'password': ['bad']}):
            with self.subTest(body=body):
                self.assertEqual(self.post(body).status_code, 400)
        response = self.client.post(self.url, '{', content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 2)

    def test_get_never_deletes(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())
