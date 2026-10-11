import json
from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import Mock, patch

from appstoreserverlibrary.api_client import APIException
from appstoreserverlibrary.models.Environment import Environment
from appstoreserverlibrary.models.JWSTransactionDecodedPayload import JWSTransactionDecodedPayload
from appstoreserverlibrary.models.JWSRenewalInfoDecodedPayload import JWSRenewalInfoDecodedPayload
from appstoreserverlibrary.models.Status import Status
from appstoreserverlibrary.models.Type import Type
from appstoreserverlibrary.signed_data_verifier import VerificationException, VerificationStatus
from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .mobile_auth import issue_mobile_session
from .models import AccountProfile, AppleSubscription, SubscriptionEntitlement
from .subscriptions import (InvalidApplePurchase, PurchaseStatusClient, _cached_verifier,
                            attach_purchase, decode_signed, refresh_entitlement, verifier)


@override_settings(APPLE_IAP_KEY_ID='key', APPLE_IAP_ISSUER_ID='issuer', APPLE_IAP_PRIVATE_KEY='private')
class AppleSubscriptionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('subscriber')
        self.profile = AccountProfile.objects.create(user=self.user)
        self.headers = {'HTTP_AUTHORIZATION': 'Bearer ' + issue_mobile_session(self.user)}
        self.link = AppleSubscription.objects.create(user=self.user, environment='Sandbox', original_transaction_id='123456')
        self.product = 'com.nomyminds.nomy.plus.monthly'
        self.expires = timezone.now() + timedelta(days=30)
        self.check = Mock()
        self.check.verify_and_decode_signed_transaction.return_value = self.info()
        self.check.verify_and_decode_renewal_info.return_value = JWSRenewalInfoDecodedPayload(
            originalTransactionId='123456', environment=Environment.SANDBOX,
            gracePeriodExpiresDate=int(self.expires.timestamp() * 1000))
        self.client_mock = Mock()
        self.client_mock.get_all_subscription_statuses.return_value = self.response()
        production_check = Mock()
        production_check.verify_and_decode_signed_transaction.side_effect = VerificationException(VerificationStatus.INVALID_ENVIRONMENT)
        production_check.verify_and_decode_notification.side_effect = VerificationException(VerificationStatus.INVALID_ENVIRONMENT)
        self.verifier_patch = patch('users.subscriptions.verifier', side_effect=lambda environment:
                                   self.check if environment == Environment.SANDBOX else production_check)
        self.api_patch = patch('users.subscriptions.PurchaseStatusClient', return_value=self.client_mock)
        self.verifier_patch.start(); self.api_patch.start()
        self.addCleanup(self.verifier_patch.stop); self.addCleanup(self.api_patch.stop)

    def info(self, **changes):
        values = dict(originalTransactionId='123456', transactionId='123457', bundleId='com.nomyminds.nomy',
                      productId=self.product, appAccountToken=str(self.profile.purchases_id),
                      environment=Environment.SANDBOX, type=Type.AUTO_RENEWABLE_SUBSCRIPTION,
                      expiresDate=int(self.expires.timestamp() * 1000))
        values.update(changes)
        return JWSTransactionDecodedPayload(**values)

    def response(self, status=Status.ACTIVE):
        return SimpleNamespace(bundleId='com.nomyminds.nomy', environment=Environment.SANDBOX, data=[
            SimpleNamespace(lastTransactions=[SimpleNamespace(originalTransactionId='123456',
                signedTransactionInfo='transaction-jws', signedRenewalInfo='renewal-jws', status=status)])])

    def post(self, payload):
        return self.client.post(reverse('mobile_subscription'), json.dumps(payload), content_type='application/json', **self.headers)

    def test_preflight_does_not_contact_apple_even_if_apple_is_unavailable(self):
        self.client_mock.get_all_subscription_statuses.side_effect = TimeoutError('slow Apple')
        result = self.post({'preflight': True})
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json()['configured'])
        self.assertFalse(result.json()['active'])
        self.client_mock.get_all_subscription_statuses.assert_not_called()

    def test_preflight_does_not_unlock_expired_entitlement(self):
        SubscriptionEntitlement.objects.create(user=self.user, active=True,
            expires_at=timezone.now() - timedelta(seconds=1), product_id=self.product)
        self.assertFalse(self.post({'preflight': True}).json()['active'])
        self.client_mock.get_all_subscription_statuses.assert_not_called()

    def test_successful_apple_purchase_persists_verified_entitlement(self):
        result = self.post({'signed_transaction': 'transaction-jws'})
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json()['active'])
        self.assertEqual(result.json()['product_id'], self.product)
        self.assertTrue(SubscriptionEntitlement.objects.get(user=self.user).active)
        self.client_mock.get_all_subscription_statuses.assert_called_with('123456')
        self.assertTrue(refresh_entitlement(self.user)[0])
        self.assertEqual(self.client_mock.get_all_subscription_statuses.call_count, 1)

    def test_expired_refunded_retry_revoked_and_upgraded_do_not_grant(self):
        for status, changes in [
            (Status.EXPIRED, {}), (Status.BILLING_RETRY, {}), (Status.REVOKED, {}),
            (Status.ACTIVE, {'expiresDate': int((timezone.now() - timedelta(seconds=1)).timestamp()*1000)}),
            (Status.ACTIVE, {'revocationDate': int(timezone.now().timestamp()*1000)}),
            (Status.ACTIVE, {'isUpgraded': True}),
        ]:
            with self.subTest(status=status, changes=changes):
                self.client_mock.get_all_subscription_statuses.return_value = self.response(status)
                self.check.verify_and_decode_signed_transaction.return_value = self.info(**changes)
                self.assertFalse(refresh_entitlement(self.user, force=True)[0])

    def test_billing_grace_uses_verified_renewal_expiration(self):
        self.client_mock.get_all_subscription_statuses.return_value = self.response(Status.BILLING_GRACE_PERIOD)
        self.check.verify_and_decode_signed_transaction.return_value = self.info(expiresDate=1)
        self.assertTrue(refresh_entitlement(self.user, force=True)[0])
        self.check.verify_and_decode_renewal_info.return_value.gracePeriodExpiresDate = 1
        self.assertFalse(refresh_entitlement(self.user, force=True)[0])

    def test_grace_for_another_chain_cannot_grant(self):
        self.client_mock.get_all_subscription_statuses.return_value = self.response(Status.BILLING_GRACE_PERIOD)
        self.check.verify_and_decode_renewal_info.return_value.originalTransactionId = 'different'
        self.assertEqual(self.post({}).status_code, 503)

    def test_wrong_product_bundle_environment_type_or_account_rejected(self):
        for changes in [{'productId': 'other-product'}, {'bundleId': 'other-app'},
                        {'environment': Environment.PRODUCTION}, {'type': Type.CONSUMABLE},
                        {'appAccountToken': str(__import__('uuid').uuid4())}, {'appAccountToken': None}]:
            self.check.verify_and_decode_signed_transaction.return_value = self.info(**changes)
            self.assertEqual(self.post({'signed_transaction': 'transaction-jws'}).status_code, 400)
            self.assertFalse(SubscriptionEntitlement.objects.filter(user=self.user, active=True).exists())

    def test_same_purchase_cannot_be_claimed_by_another_account(self):
        other = User.objects.create_user('other-subscriber')
        AccountProfile.objects.create(user=other)
        with self.assertRaises(InvalidApplePurchase):
            attach_purchase(other, 'transaction-jws')
        self.assertEqual(AppleSubscription.objects.get().user_id, self.user.pk)

    def test_unique_association_remains_authoritative_even_with_matching_token(self):
        other = User.objects.create_user('other-subscriber')
        other_profile = AccountProfile.objects.create(user=other)
        self.check.verify_and_decode_signed_transaction.return_value = self.info(appAccountToken=str(other_profile.purchases_id))
        with self.assertRaises(InvalidApplePurchase):
            attach_purchase(other, 'transaction-jws')

    def test_client_flags_and_transaction_ids_alone_cannot_grant(self):
        self.link.delete()
        result = self.post({'active': True, 'user_id': self.user.pk, 'transaction_id': '123456'})
        self.assertFalse(result.json()['active'])
        self.client_mock.get_all_subscription_statuses.assert_not_called()

    @override_settings(APPLE_IAP_PRIVATE_KEY='')
    def test_missing_configuration_prevents_purchase(self):
        self.assertFalse(self.post({}).json()['configured'])
        self.assertEqual(self.post({'signed_transaction': 'transaction-jws'}).status_code, 503)

    def test_apple_failure_preserves_last_record_but_returns_safe_error(self):
        self.client_mock.get_all_subscription_statuses.side_effect = APIException(503)
        self.assertEqual(self.post({}).status_code, 503)
        self.assertFalse(SubscriptionEntitlement.objects.get(user=self.user).active)

    def test_latest_apple_status_overrides_old_signed_purchase(self):
        self.client_mock.get_all_subscription_statuses.return_value = self.response(Status.REVOKED)
        self.assertFalse(self.post({'signed_transaction': 'old-signed-purchase'}).json()['active'])

    def test_wrong_apple_response_identity_returns_safe_error(self):
        self.client_mock.get_all_subscription_statuses.return_value.bundleId = 'different'
        self.assertEqual(self.post({}).status_code, 503)

    def test_restore_same_account_is_idempotent(self):
        for _ in range(2):
            self.assertTrue(self.post({'signed_transaction': 'transaction-jws'}).json()['active'])
        self.assertEqual(AppleSubscription.objects.count(), 1)

    def test_notifications_verify_signature_and_refresh_current_status_on_repeats(self):
        self.check.verify_and_decode_notification.return_value = SimpleNamespace(data=SimpleNamespace(signedTransactionInfo='transaction-jws'))
        url = reverse('mobile_subscription_webhook')
        for _ in range(2):
            self.assertEqual(self.client.post(url, json.dumps({'signedPayload': 'notification-jws'}), content_type='application/json').status_code, 200)
        self.assertTrue(SubscriptionEntitlement.objects.get(user=self.user).active)
        self.client_mock.get_all_subscription_statuses.return_value = self.response(Status.REVOKED)
        self.client.post(url, json.dumps({'signedPayload': 'old-notification-jws'}), content_type='application/json')
        self.assertFalse(SubscriptionEntitlement.objects.get(user=self.user).active)

    def test_invalid_notification_signature_cannot_update_access(self):
        self.check.verify_and_decode_notification.side_effect = VerificationException(VerificationStatus.VERIFICATION_FAILURE)
        result = self.client.post(reverse('mobile_subscription_webhook'), json.dumps({'signedPayload': 'forged'}), content_type='application/json')
        self.assertEqual(result.status_code, 400)
        self.client_mock.get_all_subscription_statuses.assert_not_called()

    def test_notification_after_deletion_does_not_recreate_account(self):
        self.check.verify_and_decode_notification.return_value = SimpleNamespace(data=SimpleNamespace(signedTransactionInfo='transaction-jws'))
        self.user.delete()
        result = self.client.post(reverse('mobile_subscription_webhook'), json.dumps({'signedPayload': 'notification-jws'}), content_type='application/json')
        self.assertEqual(result.status_code, 200)
        self.assertFalse(User.objects.exists())
        self.assertFalse(AppleSubscription.objects.exists())
        self.client_mock.get_all_subscription_statuses.assert_not_called()

    def test_express_unlimited_requires_authenticated_server_verified_identity(self):
        from express.views import user_has_unlimited_express_ai
        self.assertFalse(user_has_unlimited_express_ai(self.user))
        self.user._mobile_verified = True
        self.assertTrue(user_has_unlimited_express_ai(self.user))

    @override_settings(APPLE_IAP_ALLOW_SANDBOX=False)
    def test_sandbox_disabled_never_tries_sandbox_verifier(self):
        with patch('users.subscriptions.verifier') as factory:
            factory.return_value.verify_and_decode_signed_transaction.side_effect = VerificationException(VerificationStatus.INVALID_ENVIRONMENT)
            with self.assertRaises(InvalidApplePurchase): decode_signed('sandbox-jws')
            factory.assert_called_once_with(Environment.PRODUCTION)


class AppleSignatureTests(TestCase):
    def test_real_apple_verifier_rejects_forged_jws(self):
        # Real root certificates and Apple's real verifier, not the mock in the status tests.
        import base64
        encode = lambda obj: base64.urlsafe_b64encode(json.dumps(obj).encode()).rstrip(b'=').decode()
        forged = encode({'alg': 'none'}) + '.' + encode({'bundleId': 'com.nomyminds.nomy', 'environment': 'Sandbox'}) + '.'
        with self.assertRaises(InvalidApplePurchase): decode_signed(forged)


class AppleVerificationPerformanceTests(TestCase):
    def test_status_http_call_uses_short_connect_and_read_timeouts(self):
        with patch('users.subscriptions.requests.request') as request:
            client = object.__new__(PurchaseStatusClient)
            result = client._execute_request('GET', 'https://example.test', {}, {}, None, None)
            self.assertIs(result, request.return_value)
            self.assertEqual(request.call_args.kwargs['timeout'], (2, 6))

    def test_verifier_reuses_apple_certificate_cache_without_disabling_online_checks(self):
        _cached_verifier.cache_clear()
        self.addCleanup(_cached_verifier.cache_clear)
        with patch('users.subscriptions.SignedDataVerifier') as factory:
            first = verifier(Environment.SANDBOX)
            self.assertIs(verifier(Environment.SANDBOX), first)
            self.assertEqual(factory.call_count, 1)
            self.assertIs(factory.call_args.args[1], True)
            verifier(Environment.PRODUCTION)
            self.assertEqual(factory.call_count, 2)
