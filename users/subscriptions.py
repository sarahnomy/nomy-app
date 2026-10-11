"""Apple-only verification. Never trust a client entitlement flag or decoded unsigned JWT."""
from datetime import datetime, timedelta, timezone as dt_timezone
from functools import lru_cache
from pathlib import Path

import requests
from appstoreserverlibrary.api_client import AppStoreServerAPIClient, APIException
from appstoreserverlibrary.models.Environment import Environment
from appstoreserverlibrary.signed_data_verifier import SignedDataVerifier, VerificationException
from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import AccountProfile, AppleSubscription, SubscriptionEntitlement


class SubscriptionUnavailable(Exception):
    pass


class InvalidApplePurchase(Exception):
    pass


def apple_configured():
    return bool(settings.APPLE_IAP_KEY_ID and settings.APPLE_IAP_ISSUER_ID and settings.APPLE_IAP_PRIVATE_KEY)


@lru_cache(maxsize=1)
def root_certificates():
    return [path.read_bytes() for path in sorted(Path(__file__).with_name('apple_certificates').glob('*.cer'))]


class PurchaseStatusClient(AppStoreServerAPIClient):
    """Fail a slow status lookup before the mobile HTTP deadline."""

    def _execute_request(self, method, url, params, headers, json, data):
        return requests.request(method, url, params=params, headers=headers,
                                json=json, data=data, timeout=(2, 6))


@lru_cache(maxsize=4)
def _cached_verifier(roots, environment, bundle_id, app_id):
    # Keep Apple's built-in, time-limited certificate cache. Signed transaction
    # signatures and account/product/expiry checks still run for every purchase.
    return SignedDataVerifier(list(roots), True, environment, bundle_id, app_id)


def verifier(environment):
    roots = root_certificates()
    if not roots:
        raise SubscriptionUnavailable('Subscription verification is not configured. Please try again later.')
    return _cached_verifier(tuple(roots), environment, settings.APPLE_IAP_BUNDLE_ID,
                            settings.APPLE_IAP_APP_ID if environment == Environment.PRODUCTION else None)


def decode_signed(signed, notification=False):
    if not isinstance(signed, str) or not signed or len(signed) > 50000:
        raise InvalidApplePurchase('Apple purchase information is missing or invalid.')
    environments = [Environment.PRODUCTION]
    if settings.APPLE_IAP_ALLOW_SANDBOX:
        environments.append(Environment.SANDBOX)
    for environment in environments:
        try:
            check = verifier(environment)
            data = check.verify_and_decode_notification(signed) if notification else check.verify_and_decode_signed_transaction(signed)
            return data, environment
        except VerificationException:
            continue
    raise InvalidApplePurchase('This purchase could not be verified with Apple.')


def _valid_transaction(info, profile, environment):
    return bool(info.bundleId == settings.APPLE_IAP_BUNDLE_ID
                and info.environment == environment
                and info.productId in settings.NOMY_SUBSCRIPTION_PRODUCT_IDS
                and info.type == 'Auto-Renewable Subscription'
                and str(info.appAccountToken).lower() == str(profile.purchases_id).lower()
                and info.originalTransactionId)


def attach_purchase(user, signed_transaction):
    if not apple_configured():
        raise SubscriptionUnavailable('Subscriptions are currently unavailable. Please try again later.')
    info, environment = decode_signed(signed_transaction)
    profile, _ = AccountProfile.objects.get_or_create(user=user)
    if not _valid_transaction(info, profile, environment):
        raise InvalidApplePurchase('This Apple subscription belongs to another NOMY account, or is not a NOMY Plus purchase. Log in to the NOMY account used to subscribe.')
    try:
        with transaction.atomic():
            subscription, _ = AppleSubscription.objects.get_or_create(
                environment=environment.value, original_transaction_id=info.originalTransactionId,
                defaults={'user': user})
            if subscription.user_id != user.pk:
                raise InvalidApplePurchase('This subscription is already linked to another NOMY account.')
    except IntegrityError as error:
        raise InvalidApplePurchase('This subscription is already linked to another NOMY account.') from error
    # Even a valid old signed purchase is not evidence that the subscription is active now.
    return refresh_entitlement(user, force=True)


def _apple_status(subscription, profile):
    environment = Environment(subscription.environment)
    client = PurchaseStatusClient(settings.APPLE_IAP_PRIVATE_KEY.encode(), settings.APPLE_IAP_KEY_ID,
                                    settings.APPLE_IAP_ISSUER_ID, settings.APPLE_IAP_BUNDLE_ID, environment)
    response = client.get_all_subscription_statuses(subscription.original_transaction_id)
    if response.bundleId != settings.APPLE_IAP_BUNDLE_ID or response.environment != environment:
        raise InvalidApplePurchase('Apple returned subscription information for a different app.')
    check = verifier(environment)
    candidates = []
    for group in response.data or []:
        for item in group.lastTransactions or []:
            if item.originalTransactionId != subscription.original_transaction_id:
                continue
            info = check.verify_and_decode_signed_transaction(item.signedTransactionInfo)
            if not _valid_transaction(info, profile, environment) or info.originalTransactionId != subscription.original_transaction_id:
                raise InvalidApplePurchase('Apple returned subscription information for a different account.')
            expiration = info.expiresDate
            # Apple status 4 is billing grace; retry status 3 alone does not grant access.
            if item.status == 4 and item.signedRenewalInfo:
                renewal = check.verify_and_decode_renewal_info(item.signedRenewalInfo)
                if renewal.originalTransactionId != subscription.original_transaction_id or renewal.environment != environment:
                    raise InvalidApplePurchase('Apple returned inconsistent subscription information.')
                expiration = max(expiration or 0, renewal.gracePeriodExpiresDate or 0)
            if item.status in (1, 4) and not info.revocationDate and not info.isUpgraded and expiration:
                expires_at = datetime.fromtimestamp(expiration / 1000, dt_timezone.utc)
                if expires_at > timezone.now():
                    candidates.append((expires_at, info.productId))
    return candidates


def refresh_entitlement(user, force=False):
    entitlement, _ = SubscriptionEntitlement.objects.get_or_create(user=user)
    if not apple_configured():
        return False, entitlement
    now = timezone.now()
    if not force and entitlement.verified_at and entitlement.verified_at > now - timedelta(seconds=60):
        return bool(entitlement.active and entitlement.expires_at and entitlement.expires_at > now), entitlement
    profile, _ = AccountProfile.objects.get_or_create(user=user)
    candidates = []
    try:
        for subscription in AppleSubscription.objects.filter(user=user):
            candidates.extend(_apple_status(subscription, profile))
    except (APIException, requests.RequestException, VerificationException, InvalidApplePurchase,
            ValueError, TypeError, AttributeError, OverflowError) as error:
        raise SubscriptionUnavailable('Could not verify your subscription with Apple. Please try again.') from error
    expires_at, product = max(candidates, default=(None, ''), key=lambda item: item[0])
    entitlement.active = expires_at is not None
    entitlement.expires_at = expires_at
    entitlement.product_id = product
    entitlement.verified_at = now
    entitlement.save()
    return entitlement.active, entitlement


def process_notification(signed_payload):
    payload, environment = decode_signed(signed_payload, notification=True)
    # Apple test notifications have no transaction and can be acknowledged after signature verification.
    data = payload.data
    if not data or not data.signedTransactionInfo:
        return
    info = verifier(environment).verify_and_decode_signed_transaction(data.signedTransactionInfo)
    # Notifications update known subscriptions only. They never recreate a deleted user or transfer access.
    subscription = AppleSubscription.objects.filter(environment=environment.value,
        original_transaction_id=info.originalTransactionId).select_related('user').first()
    if subscription:
        profile, _ = AccountProfile.objects.get_or_create(user=subscription.user)
        if not _valid_transaction(info, profile, environment):
            raise InvalidApplePurchase('Invalid Apple notification account.')
        refresh_entitlement(subscription.user, force=True)
