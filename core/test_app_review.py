import json
import uuid
from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from core.models import Story, StoryReport, UserBlock
from users.mobile_auth import issue_mobile_session
from users.models import AccountCleanupTask, AccountProfile, MobileSession, SubscriptionEntitlement, AppleSubscription
from reflections.models import EmotionReflection, ExpressReflection, DailyReflection


class CommunityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('reader', 'reader@example.com', 'ReaderPassword-123!')
        self.author = User.objects.create_user('author', 'author@example.com', 'AuthorPassword-123!')
        self.token = issue_mobile_session(self.user)
        self.headers = {'HTTP_AUTHORIZATION': 'Bearer ' + self.token}
        self.author_profile = AccountProfile.objects.create(user=self.author)
        self.story = Story.objects.create(author=self.author, title='Published experience', body='A thoughtful story',
                                          appearance='anonymous', status='published')

    def post(self, name, body, args=None, headers=None):
        return self.client.post(reverse(name, args=args), json.dumps(body), content_type='application/json',
                                **(self.headers if headers is None else headers))

    def test_story_submission_persists_and_retries_do_not_duplicate(self):
        body = {'title': 'My experience', 'story': 'An honest story', 'appearance': 'anonymous',
                'client_id': str(uuid.uuid4()), 'accept_guidelines': True}
        self.assertEqual(self.post('mobile_story_submit', body).status_code, 201)
        self.assertEqual(self.post('mobile_story_submit', body).status_code, 200)
        story = Story.objects.get(author=self.user)
        self.assertEqual(story.status, 'pending')
        self.assertEqual(story.body, body['story'])
        public = self.client.get(reverse('mobile_stories')).json()['stories']
        self.assertNotIn(str(story.pk), [entry['id'] for entry in public])
        own = self.client.get(reverse('mobile_stories') + '?mine=1', **self.headers).json()['stories']
        self.assertEqual(own[0]['id'], str(story.pk))

    def test_submission_requires_valid_bearer_and_guidelines(self):
        body = {'title': 'Title', 'story': 'Body', 'appearance': 'anonymous', 'client_id': str(uuid.uuid4())}
        self.assertEqual(self.post('mobile_story_submit', body, headers={}).status_code, 401)
        self.assertEqual(self.post('mobile_story_submit', body).status_code, 400)
        self.assertEqual(self.post('mobile_story_submit', {**body, 'accept_guidelines': True, 'title': 'x' * 161}).status_code, 400)

    def test_report_is_stored_once_and_reporter_cannot_be_forged(self):
        data = {'reason': 'harassment', 'details': 'Review this', 'user_id': self.author.pk}
        first = self.post('mobile_story_report', data, [self.story.pk])
        second = self.post('mobile_story_report', data, [self.story.pk])
        self.assertFalse(first.json()['already_reported'])
        self.assertTrue(second.json()['already_reported'])
        report = StoryReport.objects.get()
        self.assertEqual(report.reporter, self.user)
        self.assertEqual(report.reason, 'harassment')
        self.assertEqual(report.details, 'Review this')
        self.assertFalse(report.reviewed)

    def test_report_requires_auth_and_valid_reason(self):
        self.assertEqual(self.post('mobile_story_report', {'reason': 'spam'}, [self.story.pk], headers={}).status_code, 401)
        self.assertEqual(self.post('mobile_story_report', {'reason': 'invalid'}, [self.story.pk]).status_code, 400)
        self.assertFalse(StoryReport.objects.exists())

    def test_block_filters_feed_detail_author_and_unblock_restores(self):
        payload = {'author_id': str(self.author_profile.public_id), 'action': 'block'}
        self.assertEqual(self.post('mobile_blocks', payload).status_code, 200)
        self.assertEqual(self.post('mobile_blocks', payload).status_code, 200)
        self.assertEqual(UserBlock.objects.count(), 1)
        self.assertEqual(self.client.get(reverse('mobile_stories'), **self.headers).json()['stories'], [])
        self.assertEqual(self.client.get(reverse('mobile_story_detail', args=[self.story.pk]), **self.headers).status_code, 404)
        self.assertEqual(self.client.get(reverse('mobile_stories') + '?author=' + str(self.author_profile.public_id), **self.headers).json()['stories'], [])
        listing = self.client.get(reverse('mobile_blocks'), **self.headers).json()['blocked_accounts']
        self.assertEqual(listing, [{'authorId': str(self.author_profile.public_id), 'label': 'Anonymous author'}])
        # A separate author session receives no information about who blocked them.
        author_headers = {'HTTP_AUTHORIZATION': 'Bearer ' + issue_mobile_session(self.author)}
        self.assertEqual(self.client.get(reverse('mobile_blocks'), **author_headers).json()['blocked_accounts'], [])
        self.assertEqual(self.post('mobile_blocks', {**payload, 'action': 'unblock'}).status_code, 200)
        self.assertEqual(len(self.client.get(reverse('mobile_stories'), **self.headers).json()['stories']), 1)

    def test_self_block_and_expired_sessions_are_rejected(self):
        profile = AccountProfile.objects.create(user=self.user)
        self.assertEqual(self.post('mobile_blocks', {'author_id': str(profile.public_id), 'action': 'block'}).status_code, 400)
        MobileSession.objects.filter(user=self.user).update(expires_at=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.client.get(reverse('mobile_stories'), **self.headers).status_code, 401)
        self.assertEqual(self.post('mobile_blocks', {'author_id': str(self.author_profile.public_id), 'action': 'block'}).status_code, 401)

    def test_another_users_pending_content_cannot_be_reported_or_read(self):
        self.story.status = 'pending'; self.story.save()
        self.assertEqual(self.client.get(reverse('mobile_story_detail', args=[self.story.pk]), **self.headers).status_code, 404)
        self.assertEqual(self.post('mobile_story_report', {'reason': 'spam'}, [self.story.pk]).status_code, 404)

    def test_mobile_reflections_are_bound_to_session_not_payload(self):
        self.client.post('/reflections/mobile/save/emotion/', json.dumps({'user_id': self.author.pk, 'emotion': 'calm', 'text': 'Private'}),
                         content_type='application/json', **self.headers)
        reflection = EmotionReflection.objects.get()
        self.assertEqual(reflection.user_id, self.user.pk)
        result = self.client.get('/reflections/mobile/get/emotion/?user_id=' + str(self.author.pk), **self.headers)
        self.assertEqual(result.json()['reflections'][0]['reflection'], 'Private')
        self.assertEqual(self.client.get('/reflections/mobile/get/emotion/?user_id=' + str(self.user.pk)).status_code, 401)


class CompleteBackendFlowTests(TestCase):
    def post(self, name, body, token=None, args=None):
        return self.client.post(reverse(name, args=args), json.dumps(body), content_type='application/json',
                                **({'HTTP_AUTHORIZATION': 'Bearer ' + token} if token else {}))

    @override_settings(APPLE_IAP_KEY_ID='key', APPLE_IAP_ISSUER_ID='issuer', APPLE_IAP_PRIVATE_KEY='private')
    @patch('users.subscriptions._apple_status')
    @patch('users.subscriptions.decode_signed')
    def test_register_login_story_report_block_purchase_restore_delete(self, decode, status):
        # Purchase completion itself is tested through the SDK adapter and must also be checked on an iPhone.
        credentials = {'username': 'review-flow', 'email': 'review@example.com', 'password1': 'ReviewFlow-123!Password', 'password2': 'ReviewFlow-123!Password'}
        registered = self.post('mobile_register', credentials)
        self.assertEqual(registered.status_code, 201)
        token = registered.json()['user']['session_token']
        user_id = registered.json()['user']['id']
        session = self.client.session
        self.assertEqual(session['_auth_user_id'], str(user_id))
        logged_in = self.post('mobile_login', {'username': credentials['username'], 'password': credentials['password1']})
        token2 = logged_in.json()['user']['session_token']
        author = User.objects.create_user('community-author')
        profile = AccountProfile.objects.create(user=author)
        published = Story.objects.create(author=author, title='A community experience', body='A story.', appearance='anonymous', status='published')
        own = self.post('mobile_story_submit', {'title': 'My story', 'story': 'My account of today.', 'appearance': 'anonymous', 'client_id': str(uuid.uuid4()), 'accept_guidelines': True}, token2)
        self.assertEqual(own.status_code, 201)
        self.assertEqual(self.post('mobile_story_report', {'reason': 'spam'}, token2, [published.pk]).status_code, 200)
        self.assertEqual(self.post('mobile_blocks', {'author_id': str(profile.public_id), 'action': 'block'}, token2).status_code, 200)
        EmotionReflection.objects.create(user_id=user_id, date=timezone.now().date(), emotion='Calm', text='Private')
        DailyReflection.objects.create(user_id=user_id, date=timezone.now().date(), goal='Private goal')
        ExpressReflection.objects.create(user_id=user_id, date=timezone.now().date(), text='Private response')
        product = 'com.nomyminds.nomy.plus.monthly'
        from appstoreserverlibrary.models.Environment import Environment
        profile = AccountProfile.objects.get(user_id=user_id)
        decode.return_value = (SimpleNamespace(bundleId='com.nomyminds.nomy', environment=Environment.SANDBOX,
            productId=product, type='Auto-Renewable Subscription', appAccountToken=str(profile.purchases_id),
            originalTransactionId='123456'), Environment.SANDBOX)
        status.return_value = [(timezone.now() + timedelta(days=30), product)]
        self.assertTrue(self.post('mobile_subscription', {'signed_transaction': 'signed-apple-purchase'}, token2).json()['active'])
        self.assertTrue(self.post('mobile_subscription', {}, token2).json()['active'])
        deleted = self.post('mobile_delete_account', {'user_id': user_id, 'username': credentials['username'], 'password': credentials['password1']}, token2)
        self.assertEqual(deleted.status_code, 200)
        self.assertFalse(User.objects.filter(pk=user_id).exists())
        self.assertFalse(Story.objects.filter(author_id=user_id).exists())
        self.assertFalse(StoryReport.objects.exists())
        self.assertFalse(UserBlock.objects.exists())
        self.assertFalse(MobileSession.objects.filter(user_id=user_id).exists())
        self.assertFalse(SubscriptionEntitlement.objects.filter(user_id=user_id).exists())
        self.assertFalse(AccountProfile.objects.filter(user_id=user_id).exists())
        self.assertFalse(AppleSubscription.objects.filter(user_id=user_id).exists())
        self.assertFalse(EmotionReflection.objects.filter(user_id=user_id).exists())
        self.assertFalse(DailyReflection.objects.filter(user_id=user_id).exists())
        self.assertFalse(ExpressReflection.objects.filter(user_id=user_id).exists())
        self.assertNotIn('_auth_user_id', self.client.session)
        self.assertEqual(self.client.get(reverse('mobile_blocks'), HTTP_AUTHORIZATION='Bearer ' + token).status_code, 401)
        self.assertEqual(self.client.get(reverse('mobile_blocks'), HTTP_AUTHORIZATION='Bearer ' + token2).status_code, 401)
        self.assertEqual(self.post('mobile_login', {'username': credentials['username'], 'password': credentials['password1']}).status_code, 401)

    @patch('users.views.delete_account_data', side_effect=RuntimeError('database unavailable'))
    def test_failed_deletion_preserves_account_and_session(self, delete):
        user = User.objects.create_user('keep-account', password='DeletionPassword-123!')
        token = issue_mobile_session(user)
        with self.assertLogs('users.views', level='ERROR'):
            result = self.post('mobile_delete_account', {'user_id': user.pk, 'username': user.username, 'password': 'DeletionPassword-123!'}, token)
        self.assertEqual(result.status_code, 503)
        self.assertTrue(User.objects.filter(pk=user.pk).exists())
        self.assertTrue(MobileSession.objects.filter(user=user).exists())
        self.assertIn('could not be deleted', result.json()['error'])

    def test_deletion_invalidates_all_devices_and_web_sessions(self):
        from django.test import Client
        user = User.objects.create_user('all-devices', password='DevicePassword-123!')
        other_device = Client(); other_device.force_login(user)
        other_key = other_device.session.session_key
        tokens = [issue_mobile_session(user), issue_mobile_session(user)]
        self.assertEqual(self.post('mobile_delete_account', {'user_id': user.pk, 'username': user.username, 'password': 'DevicePassword-123!'}, tokens[0]).status_code, 200)
        self.assertFalse(Session.objects.filter(session_key=other_key).exists())
        self.assertFalse(MobileSession.objects.filter(user_id=user.pk).exists())

    @patch('users.deletion.default_storage.delete', side_effect=OSError('storage unavailable'))
    def test_audio_cleanup_failure_is_queued_without_false_deletion_failure(self, remove):
        user = User.objects.create_user('audio-account', password='AudioPassword-123!')
        ExpressReflection.objects.create(user=user, date=timezone.now().date(), text='Private', audio='express/private.wav')
        with self.assertLogs('users.deletion', level='ERROR'):
            with self.captureOnCommitCallbacks(execute=True):
                result = self.post('mobile_delete_account', {'user_id': user.pk, 'username': user.username, 'password': 'AudioPassword-123!'})
        self.assertEqual(result.status_code, 200)
        self.assertFalse(User.objects.filter(pk=user.pk).exists())
        task = AccountCleanupTask.objects.get()
        self.assertEqual(task.target, 'express/private.wav')
        self.assertEqual(task.attempts, 1)

    def test_apple_subscription_association_deleted_with_account(self):
        user = User.objects.create_user('purchase-account', password='PurchasePassword-123!')
        AppleSubscription.objects.create(user=user, environment='Sandbox', original_transaction_id='123456')
        self.assertEqual(self.post('mobile_delete_account', {'user_id': user.pk, 'username': user.username,
                         'password': 'PurchasePassword-123!'}).status_code, 200)
        self.assertFalse(AppleSubscription.objects.exists())
