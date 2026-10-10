import json
import time
from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import patch

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, rsa
from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .models import SocialAuthChallenge, SocialIdentity
from .social_auth import SocialAuthError, revoke_apple_access


@override_settings(
    GOOGLE_OAUTH_CLIENT_IDS=["google-web-client"],
    APPLE_SIGN_IN_CLIENT_ID="com.nomyminds.nomy",
    APPLE_SIGN_IN_TEAM_ID="test-team", APPLE_SIGN_IN_KEY_ID="test-key",
    APPLE_SIGN_IN_PRIVATE_KEY="configured-for-tests",
)
class SocialSignInTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    def setUp(self):
        self.key_patch = patch("users.social_auth.key_client")
        key_client = self.key_patch.start()
        self.addCleanup(self.key_patch.stop)
        key_client.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(key=self.private_key.public_key())

    def post(self, name, body):
        return self.client.post(reverse(name), json.dumps(body), content_type="application/json")

    def proof(self, provider="google", purpose="login", user=None, **claims_override):
        challenge = self.post("mobile_social_challenge", {
            "provider": provider, "purpose": purpose, "user_id": user.pk if user else None,
        }).json()
        now = int(time.time())
        claims = {
            "iss": "https://appleid.apple.com" if provider == "apple" else "https://accounts.google.com",
            "aud": "com.nomyminds.nomy" if provider == "apple" else "google-web-client",
            "sub": "provider-user-123", "iat": now, "exp": now + 300,
            "email": "social@example.com", "email_verified": True,
            "nonce": challenge["nonce"], **claims_override,
        }
        return {"provider": provider, "challenge_id": challenge["challenge_id"],
                "identity_token": jwt.encode(claims, self.private_key, algorithm="RS256"),
                "user_id": user.pk if user else None, "authorization_code": "apple-code"}

    def test_registration_and_repeat_login_use_same_identity(self):
        first = self.post("mobile_social_login", self.proof())
        self.assertEqual(first.status_code, 200)
        user = User.objects.get(pk=first.json()["user"]["id"])
        self.assertFalse(user.has_usable_password())
        self.assertEqual(first.json()["user"]["auth_provider"], "google")
        second = self.post("mobile_social_login", self.proof(email=""))
        self.assertEqual(second.json()["user"]["id"], user.pk)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(self.client.session["_auth_user_id"], str(user.pk))

    def test_apple_repeat_login_without_email(self):
        first = self.post("mobile_social_login", self.proof("apple"))
        second = self.post("mobile_social_login", self.proof("apple", email=""))
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.json()["user"]["id"], second.json()["user"]["id"])

    def test_existing_email_cannot_be_used_to_take_over_account(self):
        user = User.objects.create_user("existing", "social@example.com", "password")
        response = self.post("mobile_social_login", self.proof())
        self.assertEqual(response.status_code, 409)
        self.assertEqual(User.objects.count(), 1)
        self.assertFalse(SocialIdentity.objects.exists())
        self.assertTrue(User.objects.get(pk=user.pk).check_password("password"))

    def test_unverified_email_is_not_saved(self):
        response = self.post("mobile_social_login", self.proof(email_verified=False))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["email"], "")

    def test_invalid_signed_claims_are_rejected(self):
        for claims in ({"aud": "another-app"}, {"iss": "https://attacker.example"},
                       {"exp": int(time.time()) - 10}, {"sub": ""}):
            with self.subTest(claims=claims):
                self.assertEqual(self.post("mobile_social_login", self.proof(**claims)).status_code, 401)
        self.assertEqual(User.objects.count(), 0)

    def test_apple_nonce_is_required(self):
        self.assertEqual(self.post("mobile_social_login", self.proof("apple", nonce="wrong")).status_code, 401)
        self.assertFalse(User.objects.exists())

    def test_invalid_signature_is_rejected(self):
        proof = self.proof()
        other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        claims = jwt.decode(proof["identity_token"], options={"verify_signature": False})
        proof["identity_token"] = jwt.encode(claims, other_key, algorithm="RS256")
        self.assertEqual(self.post("mobile_social_login", proof).status_code, 401)

    def test_challenge_cannot_be_replayed_or_used_for_other_purpose(self):
        proof = self.proof()
        self.assertEqual(self.post("mobile_social_login", proof).status_code, 200)
        self.assertEqual(self.post("mobile_social_login", proof).status_code, 401)
        self.assertEqual(self.post("mobile_social_delete_account", self.proof()).status_code, 401)

    def test_expired_challenge_is_rejected(self):
        proof = self.proof()
        SocialAuthChallenge.objects.filter(pk=proof["challenge_id"]).update(created_at=timezone.now() - timedelta(minutes=6))
        self.assertEqual(self.post("mobile_social_login", proof).status_code, 401)

    def test_social_deletion_matches_provider_subject_and_account(self):
        user = User.objects.create_user("social")
        other = User.objects.create_user("other")
        SocialIdentity.objects.create(user=user, provider="google", subject="provider-user-123")
        for proof in (self.proof(purpose="delete", user=other), self.proof(purpose="delete", user=user, sub="someone-else")):
            self.assertEqual(self.post("mobile_social_delete_account", proof).status_code, 403)
        self.assertEqual(User.objects.count(), 2)
        self.client.force_login(user)
        response = self.post("mobile_social_delete_account", self.proof(purpose="delete", user=user))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(pk=user.pk).exists())
        self.assertTrue(User.objects.filter(pk=other.pk).exists())
        self.assertFalse(SocialIdentity.objects.exists())
        self.assertNotIn("_auth_user_id", self.client.session)

    @patch("users.social_views.revoke_apple_access")
    def test_apple_deletion_revokes_access(self, revoke):
        user = User.objects.create_user("apple")
        SocialIdentity.objects.create(user=user, provider="apple", subject="provider-user-123")
        proof = self.proof("apple", "delete", user)
        self.assertEqual(self.post("mobile_social_delete_account", proof).status_code, 200)
        revoke.assert_called_once()
        self.assertFalse(User.objects.filter(pk=user.pk).exists())

    @patch("users.social_views.revoke_apple_access", side_effect=SocialAuthError("Try again", 503))
    def test_apple_revocation_failure_preserves_account(self, revoke):
        user = User.objects.create_user("apple")
        SocialIdentity.objects.create(user=user, provider="apple", subject="provider-user-123")
        self.assertEqual(self.post("mobile_social_delete_account", self.proof("apple", "delete", user)).status_code, 503)
        self.assertTrue(User.objects.filter(pk=user.pk).exists())

    def test_inactive_identity_cannot_log_in(self):
        user = User.objects.create_user("inactive", is_active=False)
        SocialIdentity.objects.create(user=user, provider="google", subject="provider-user-123")
        self.assertEqual(self.post("mobile_social_login", self.proof()).status_code, 403)

    @override_settings(GOOGLE_OAUTH_CLIENT_IDS=[], APPLE_SIGN_IN_PRIVATE_KEY="")
    def test_unconfigured_providers_are_hidden_and_rejected(self):
        self.assertEqual(self.client.get(reverse("mobile_social_providers")).json()["providers"], [])
        self.assertEqual(self.post("mobile_social_challenge", {"provider": "google", "purpose": "login"}).status_code, 503)

    def test_bad_payloads_return_validation_errors(self):
        for name in ("mobile_social_login", "mobile_social_delete_account"):
            for body in (None, [], {}, {"challenge_id": "invalid"}, {"challenge_id": [1]}):
                with self.subTest(name=name, body=body):
                    self.assertIn(self.post(name, body).status_code, (400, 401))

    @patch("users.social_auth.httpx.Client")
    def test_apple_token_exchange_and_revocation(self, http_client):
        proof = self.proof("apple")
        claims = jwt.decode(proof["identity_token"], options={"verify_signature": False})
        apple_key = ec.generate_private_key(ec.SECP256R1())
        private_key = apple_key.private_bytes(
            serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
            serialization.NoEncryption(),
        ).decode()
        client = http_client.return_value.__enter__.return_value
        client.post.side_effect = [
            SimpleNamespace(raise_for_status=lambda: None, json=lambda: {
                "id_token": proof["identity_token"], "refresh_token": "refresh-token",
            }),
            SimpleNamespace(raise_for_status=lambda: None),
        ]
        with override_settings(APPLE_SIGN_IN_PRIVATE_KEY=private_key):
            revoke_apple_access("code", claims["sub"], claims["nonce"])
        exchange, revoke = client.post.call_args_list
        self.assertEqual(exchange.args[0], "https://appleid.apple.com/auth/token")
        self.assertEqual(exchange.kwargs["data"]["grant_type"], "authorization_code")
        secret_claims = jwt.decode(exchange.kwargs["data"]["client_secret"], apple_key.public_key(),
                                   algorithms=["ES256"], audience="https://appleid.apple.com")
        self.assertEqual(secret_claims["sub"], "com.nomyminds.nomy")
        self.assertEqual(revoke.args[0], "https://appleid.apple.com/auth/revoke")
        self.assertEqual(revoke.kwargs["data"]["token"], "refresh-token")
        self.assertEqual(revoke.kwargs["data"]["token_type_hint"], "refresh_token")

    @patch("users.social_auth.httpx.Client")
    def test_apple_authorization_code_for_another_account_is_rejected(self, http_client):
        proof = self.proof("apple", sub="another-apple-account")
        claims = jwt.decode(proof["identity_token"], options={"verify_signature": False})
        apple_key = ec.generate_private_key(ec.SECP256R1())
        private_key = apple_key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
                                               serialization.NoEncryption()).decode()
        client = http_client.return_value.__enter__.return_value
        client.post.return_value.json.return_value = {"id_token": proof["identity_token"], "refresh_token": "refresh"}
        with override_settings(APPLE_SIGN_IN_PRIVATE_KEY=private_key):
            with self.assertRaises(SocialAuthError) as error:
                revoke_apple_access("code", "expected-account", claims["nonce"])
        self.assertEqual(error.exception.status, 403)
        self.assertEqual(client.post.call_count, 1)
