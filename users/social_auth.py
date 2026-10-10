"""Verify provider credentials; never trust an email or user ID from the app."""
import hashlib
import secrets
import time
from datetime import timedelta
from functools import lru_cache

import httpx
import jwt
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import SocialAuthChallenge


class SocialAuthError(Exception):
    def __init__(self, message, status=401):
        super().__init__(message)
        self.status = status


def enabled_providers():
    providers = []
    if settings.GOOGLE_OAUTH_CLIENT_IDS:
        providers.append("google")
    if all((settings.APPLE_SIGN_IN_CLIENT_ID, settings.APPLE_SIGN_IN_TEAM_ID,
            settings.APPLE_SIGN_IN_KEY_ID, settings.APPLE_SIGN_IN_PRIVATE_KEY)):
        providers.append("apple")
    return providers


def create_challenge(provider, purpose, user_id=None):
    if provider not in enabled_providers():
        raise SocialAuthError("This sign-in option is not available yet.", 503)
    SocialAuthChallenge.objects.filter(created_at__lt=timezone.now() - timedelta(minutes=10)).delete()
    return SocialAuthChallenge.objects.create(
        provider=provider, purpose=purpose, user_id_to_delete=user_id,
        nonce=hashlib.sha256(secrets.token_bytes(32)).hexdigest(),
    )


@lru_cache(maxsize=2)
def key_client(provider):
    url = ("https://appleid.apple.com/auth/keys" if provider == "apple"
           else "https://www.googleapis.com/oauth2/v3/certs")
    return jwt.PyJWKClient(url, timeout=10)


def verify_identity(provider, token, nonce=None):
    if provider not in enabled_providers():
        raise SocialAuthError("This sign-in option is not available yet.", 503)
    if not isinstance(token, str) or not token or len(token) > 16384:
        raise SocialAuthError("Please sign in again to confirm your account.")
    try:
        key = key_client(provider).get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token, key, algorithms=["RS256"],
            audience=(settings.APPLE_SIGN_IN_CLIENT_ID if provider == "apple" else settings.GOOGLE_OAUTH_CLIENT_IDS),
            issuer=("https://appleid.apple.com" if provider == "apple" else ["accounts.google.com", "https://accounts.google.com"]),
            options={"require": ["exp", "iat", "sub", "iss", "aud"]},
        )
    except jwt.PyJWKClientConnectionError as error:
        raise SocialAuthError("Could not contact the sign-in provider. Please try again.", 503) from error
    except jwt.PyJWTError as error:
        raise SocialAuthError("Your sign-in could not be verified. Please try again.") from error
    if not isinstance(claims["sub"], str) or not claims["sub"] or len(claims["sub"]) > 255:
        raise SocialAuthError("Your sign-in could not be verified.")
    if provider == "apple" and (not nonce or claims.get("nonce") != nonce):
        raise SocialAuthError("Your sign-in confirmation has expired. Please try again.")
    return claims


def verify_challenge(payload, purpose):
    provider = payload.get("provider")
    try:
        challenge = SocialAuthChallenge.objects.get(
            pk=payload.get("challenge_id"), provider=provider, purpose=purpose,
            used_at__isnull=True, created_at__gte=timezone.now() - timedelta(minutes=5),
        )
    except (SocialAuthChallenge.DoesNotExist, ValueError, TypeError, ValidationError) as error:
        raise SocialAuthError("Your sign-in confirmation has expired. Please try again.") from error
    claims = verify_identity(provider, payload.get("identity_token"), challenge.nonce)
    return challenge, claims


def consume_challenge(challenge):
    if SocialAuthChallenge.objects.filter(pk=challenge.pk, used_at__isnull=True).update(used_at=timezone.now()) != 1:
        raise SocialAuthError("This sign-in confirmation has already been used. Please try again.")


def revoke_apple_access(authorization_code, expected_subject, nonce):
    if not isinstance(authorization_code, str) or not authorization_code or len(authorization_code) > 4096:
        raise SocialAuthError("Please confirm with Apple again to delete your account.")
    now = int(time.time())
    try:
        client_secret = jwt.encode(
            {"iss": settings.APPLE_SIGN_IN_TEAM_ID, "iat": now, "exp": now + 300,
             "aud": "https://appleid.apple.com", "sub": settings.APPLE_SIGN_IN_CLIENT_ID},
            settings.APPLE_SIGN_IN_PRIVATE_KEY, algorithm="ES256",
            headers={"kid": settings.APPLE_SIGN_IN_KEY_ID},
        )
        with httpx.Client(timeout=15) as client:
            response = client.post("https://appleid.apple.com/auth/token", data={
                "client_id": settings.APPLE_SIGN_IN_CLIENT_ID, "client_secret": client_secret,
                "code": authorization_code, "grant_type": "authorization_code",
            })
            response.raise_for_status()
            tokens = response.json()
            claims = verify_identity("apple", tokens.get("id_token"), nonce)
            if claims["sub"] != expected_subject:
                raise SocialAuthError("Please confirm with the Apple account connected to nomy.", 403)
            token = tokens.get("refresh_token") or tokens.get("access_token")
            if not isinstance(token, str) or not token:
                raise SocialAuthError("Apple could not confirm account deletion. Please try again.", 503)
            response = client.post("https://appleid.apple.com/auth/revoke", data={
                "client_id": settings.APPLE_SIGN_IN_CLIENT_ID, "client_secret": client_secret,
                "token": token, "token_type_hint": "refresh_token" if tokens.get("refresh_token") else "access_token",
            })
            response.raise_for_status()
    except (httpx.HTTPError, ValueError, jwt.PyJWTError) as error:
        raise SocialAuthError("Could not disconnect Apple. Your account has not been deleted. Please try again.", 503) from error
