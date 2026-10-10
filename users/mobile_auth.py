import hashlib
import secrets
from datetime import timedelta

from django.utils import timezone

from .models import AccountProfile, MobileSession


def issue_mobile_session(user):
    token = secrets.token_urlsafe(48)
    MobileSession.objects.filter(expires_at__lt=timezone.now()).delete()
    MobileSession.objects.create(user=user, token_hash=hashlib.sha256(token.encode()).hexdigest(),
                                 expires_at=timezone.now() + timedelta(days=30))
    return token


def mobile_user(request):
    authorization = request.headers.get("Authorization", "")
    if authorization.startswith("Bearer "):
        token = authorization[7:]
        if not token or len(token) > 256:
            return None
        session = MobileSession.objects.select_related("user").filter(
            token_hash=hashlib.sha256(token.encode()).hexdigest(), expires_at__gt=timezone.now(),
            user__is_active=True,
        ).first()
        return session.user if session else None
    # New mobile APIs use bearer credentials so cookies cannot accidentally select another account.
    return None


def session_response(user, provider=None):
    profile, _ = AccountProfile.objects.get_or_create(user=user)
    result = {"id": user.pk, "username": user.username, "email": user.email,
              "purchases_id": str(profile.purchases_id), "public_id": str(profile.public_id),
              "session_token": issue_mobile_session(user)}
    if provider:
        result["auth_provider"] = provider
    return result
