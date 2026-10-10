import json
import uuid
from functools import wraps

from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from users.mobile_auth import mobile_user
from users.models import AccountProfile
from users.subscriptions import (InvalidApplePurchase, SubscriptionUnavailable, apple_configured,
                                 attach_purchase, process_notification, refresh_entitlement)
from appstoreserverlibrary.signed_data_verifier import VerificationException
from .models import Story, StoryReport, UserBlock


class ApiError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def api(auth=True):
    def decorate(view):
        @wraps(view)
        def wrapped(request, *args, **kwargs):
            try:
                request.mobile_user = mobile_user(request)
                if request.headers.get("Authorization") and not request.mobile_user:
                    raise ApiError("Please log in again to continue.", 401)
                if auth and not request.mobile_user:
                    raise ApiError("Please log in again to continue.", 401)
                return view(request, *args, **kwargs)
            except ApiError as error:
                return JsonResponse({"ok": False, "error": str(error)}, status=error.status)
            except SubscriptionUnavailable as error:
                return JsonResponse({"ok": False, "error": str(error)}, status=503)
            except InvalidApplePurchase as error:
                return JsonResponse({"ok": False, "error": str(error)}, status=400)
        return csrf_exempt(wrapped)
    return decorate


def body(request):
    try:
        result = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        raise ApiError("Invalid request body.")
    if not isinstance(result, dict):
        raise ApiError("Invalid request body.")
    return result


def identifier(value):
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        raise ApiError("Invalid content or account identifier.")


def visible_stories(user):
    stories = Story.objects.filter(status="published")
    if user:
        stories = Story.objects.filter(Q(status="published") | Q(author=user))
        stories = stories.exclude(author_id__in=UserBlock.objects.filter(blocker=user).values("blocked_id"))
    return stories.select_related("author")


def serialize_story(story, user):
    profile, _ = AccountProfile.objects.get_or_create(user=story.author)
    label = story.display_name if story.appearance == "display-name" else "Anonymous author"
    return {"id": str(story.pk), "title": story.title, "body": story.body.split("\n\n"),
            "story": story.body, "category": "Community story", "byline": "Shared by " + label,
            "readTime": f"{max(1, len(story.body.split()) // 200)} min read", "excerpt": story.body[:180],
            "baseHearts": 0, "authorId": str(profile.public_id), "authorLabel": label,
            "isOwn": bool(user and story.author_id == user.pk), "appearance": story.appearance,
            "status": {"pending": "In review", "published": "Published", "rejected": "Rejected"}[story.status],
            "date": story.created_at.date().isoformat()}


@api(auth=False)
@require_GET
def stories(request):
    query = visible_stories(request.mobile_user)
    if request.GET.get("mine") == "1":
        if not request.mobile_user:
            raise ApiError("Please log in to view your stories.", 401)
        query = query.filter(author=request.mobile_user)
    if request.GET.get("author"):
        query = query.filter(author__mobile_profile__public_id=identifier(request.GET["author"]))
    response = JsonResponse({"ok": True, "stories": [serialize_story(item, request.mobile_user) for item in query[:200]]})
    response["Cache-Control"] = "no-store"
    return response


@api(auth=False)
@require_GET
def story_detail(request, story_id):
    story = visible_stories(request.mobile_user).filter(pk=story_id).first()
    if not story:
        raise ApiError("This story is no longer available.", 404)
    return JsonResponse({"ok": True, "story": serialize_story(story, request.mobile_user)})


@api()
@require_POST
def submit_story(request):
    payload = body(request)
    title, content = payload.get("title"), payload.get("story")
    appearance = payload.get("appearance")
    display_name = payload.get("display_name", "")
    if not isinstance(title, str) or not 1 <= len(title.strip()) <= 160 or not isinstance(content, str) or not 1 <= len(content.strip()) <= 20000:
        raise ApiError("Enter a title (up to 160 characters) and a story (up to 20,000 characters).")
    if appearance not in ("anonymous", "display-name") or not isinstance(display_name, str) or len(display_name.strip()) > 60:
        raise ApiError("Choose how your story should appear.")
    if appearance == "display-name" and not display_name.strip():
        raise ApiError("Enter a display name or choose anonymous.")
    # Writing and submitting remains available to every logged-in user; Plus unlocks the other premium libraries.
    if payload.get("accept_guidelines") is not True:
        raise ApiError("Please accept the community guidelines before submitting.")
    story, created = Story.objects.get_or_create(author=request.mobile_user, client_id=identifier(payload.get("client_id")),
        defaults={"title": title.strip(), "body": content.strip(), "appearance": appearance,
                  "display_name": display_name.strip() if appearance == "display-name" else ""})
    return JsonResponse({"ok": True, "story": serialize_story(story, request.mobile_user)}, status=201 if created else 200)


@api()
@require_POST
def report_story(request, story_id):
    payload = body(request)
    story = visible_stories(request.mobile_user).filter(pk=story_id, status="published").first()
    if not story:
        raise ApiError("This story is no longer available.", 404)
    if story.author_id == request.mobile_user.pk:
        raise ApiError("You cannot report your own story.")
    reason, details = payload.get("reason"), payload.get("details", "")
    if not isinstance(reason, str) or reason not in dict(StoryReport.REASONS) or not isinstance(details, str) or len(details) > 1000:
        raise ApiError("Choose a report reason and keep details under 1,000 characters.")
    report, created = StoryReport.objects.get_or_create(reporter=request.mobile_user, story=story,
                                                       defaults={"reason": reason, "details": details.strip()})
    return JsonResponse({"ok": True, "already_reported": not created, "report_id": report.pk})


@api()
def blocks(request):
    if request.method == "GET":
        entries = UserBlock.objects.filter(blocker=request.mobile_user).select_related("blocked__mobile_profile")
        return JsonResponse({"ok": True, "blocked_accounts": [
            {"authorId": str(entry.blocked.mobile_profile.public_id), "label": entry.label} for entry in entries]})
    if request.method != "POST":
        raise ApiError("Method not allowed.", 405)
    payload = body(request)
    profile = AccountProfile.objects.filter(public_id=identifier(payload.get("author_id")), user__is_active=True).first()
    if not profile or profile.user_id == request.mobile_user.pk:
        raise ApiError("This account cannot be blocked.")
    if payload.get("action") == "unblock":
        UserBlock.objects.filter(blocker=request.mobile_user, blocked_id=profile.user_id).delete()
    elif payload.get("action") == "block":
        # Only publicly accessible authors can be blocked; anonymous authors keep their anonymity.
        story = visible_stories(request.mobile_user).filter(author_id=profile.user_id, status="published").first()
        existing = UserBlock.objects.filter(blocker=request.mobile_user, blocked_id=profile.user_id).exists()
        if not story and not existing:
            raise ApiError("This author is unavailable.", 404)
        label = story.display_name if story and story.appearance == "display-name" else "Anonymous author"
        UserBlock.objects.get_or_create(blocker=request.mobile_user, blocked_id=profile.user_id, defaults={"label": label})
    else:
        raise ApiError("Choose block or unblock.")
    return JsonResponse({"ok": True})


@api()
@require_POST
def subscription(request):
    payload = body(request)
    if "signed_transaction" in payload:
        active, entitlement = attach_purchase(request.mobile_user, payload["signed_transaction"])
    else:
        active, entitlement = refresh_entitlement(request.mobile_user, force=True)
    return JsonResponse({"ok": True, "active": active, "expires_at": entitlement.expires_at,
                         "product_id": entitlement.product_id, "configured": apple_configured()})


@csrf_exempt
@require_POST
def subscription_webhook(request):
    try:
        process_notification(body(request).get("signedPayload"))
        return JsonResponse({"ok": True})
    except (ApiError, InvalidApplePurchase, VerificationException):
        return JsonResponse({"ok": False}, status=400)
    except SubscriptionUnavailable:
        return JsonResponse({"ok": False}, status=503)
