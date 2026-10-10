import json
import uuid

from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import SocialIdentity
from .mobile_auth import session_response
from .deletion import delete_account_data
from .social_auth import (
    SocialAuthError, consume_challenge, create_challenge, enabled_providers,
    revoke_apple_access, verify_challenge,
)


def read_payload(request):
    try:
        payload = json.loads(request.body)
    except (ValueError, UnicodeDecodeError) as error:
        raise SocialAuthError("Invalid request body.", 400) from error
    if not isinstance(payload, dict):
        raise SocialAuthError("Invalid request body.", 400)
    return payload


def failure(error):
    return JsonResponse({"ok": False, "error": str(error)}, status=error.status)


@require_GET
def mobile_social_providers(request):
    response = JsonResponse({"ok": True, "providers": enabled_providers()})
    response["Cache-Control"] = "no-store"
    return response


@csrf_exempt
@require_POST
def mobile_social_challenge(request):
    try:
        payload = read_payload(request)
        provider, purpose = payload.get("provider"), payload.get("purpose")
        if provider not in ("google", "apple") or purpose not in ("login", "delete"):
            raise SocialAuthError("Invalid sign-in request.", 400)
        user_id = payload.get("user_id") if purpose == "delete" else None
        if purpose == "delete" and (type(user_id) is not int or user_id <= 0):
            raise SocialAuthError("Please log in again before deleting your account.", 400)
        challenge = create_challenge(provider, purpose, user_id)
        return JsonResponse({"ok": True, "challenge_id": str(challenge.pk), "nonce": challenge.nonce})
    except SocialAuthError as error:
        return failure(error)


def social_user(provider, claims):
    identity = SocialIdentity.objects.select_related("user").filter(provider=provider, subject=claims["sub"]).first()
    if identity:
        if not identity.user.is_active:
            raise SocialAuthError("This account is unavailable. Please contact hello@nomy.app.", 403)
        return identity.user
    email = claims.get("email", "")
    verified = claims.get("email_verified") in (True, "true")
    if not isinstance(email, str) or len(email) > 254 or not verified:
        email = ""
    # Matching email addresses are not sufficient proof to link an existing account.
    if email and User.objects.filter(email__iexact=email).exists():
        raise SocialAuthError("You already have a nomy account with this email. Please use your existing username and password.", 409)
    user = User.objects.create_user(username="nomy_" + uuid.uuid4().hex[:16], email=email)
    SocialIdentity.objects.create(user=user, provider=provider, subject=claims["sub"])
    return user


@csrf_exempt
@require_POST
def mobile_social_login(request):
    try:
        payload = read_payload(request)
        challenge, claims = verify_challenge(payload, "login")
        try:
            with transaction.atomic():
                consume_challenge(challenge)
                user = social_user(challenge.provider, claims)
        except IntegrityError:
            # A simultaneous first login may have created the same identity.
            with transaction.atomic():
                consume_challenge(challenge)
                user = social_user(challenge.provider, claims)
        login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        return JsonResponse({"ok": True, "user": session_response(user, challenge.provider)})
    except SocialAuthError as error:
        return failure(error)


@csrf_exempt
@require_POST
def mobile_social_delete_account(request):
    try:
        payload = read_payload(request)
        challenge, claims = verify_challenge(payload, "delete")
        with transaction.atomic():
            consume_challenge(challenge)
            identity = SocialIdentity.objects.select_related("user").filter(
                provider=challenge.provider, subject=claims["sub"], user_id=challenge.user_id_to_delete,
            ).first()
            if not identity or not identity.user.is_active or str(payload.get("user_id")) != str(identity.user_id):
                raise SocialAuthError("Please confirm with the account connected to nomy.", 403)
            user = User.objects.select_for_update().get(pk=identity.user_id)
            if challenge.provider == "apple":
                revoke_apple_access(payload.get("authorization_code"), claims["sub"], challenge.nonce)
            delete_account_data(user)
            logout(request)
        return JsonResponse({"ok": True})
    except SocialAuthError as error:
        return failure(error)
