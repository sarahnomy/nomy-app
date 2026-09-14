import json
import os

import httpx
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@login_required
def home(request):
    return render(request, "core/home.html")

@login_required
def intro(request):
    return render(request, "core/intro.html")

@login_required
def options(request):
    return render(request, "core/options.html")

@login_required
def about(request):
    return render(request, "core/about.html")

@login_required
def settings(request):
    return render(request, "core/settings.html")

@login_required
def help(request):
    return render(request, "core/help.html")


def privacy(request):
    return render(request, "core/privacy.html")


def extract_response_text(payload):
    output = payload.get("output", [])
    texts = []

    for item in output:
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text" and content.get("text"):
                texts.append(content["text"])

    return "\n".join(texts).strip()


@csrf_exempt
@require_POST
def mobile_avatar_state(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"ok": False, "error": "Invalid request body."}, status=400)

    activities = payload.get("activities") or []
    if not isinstance(activities, list):
        activities = []

    if not activities:
        return JsonResponse(
            {
                "ok": True,
                "state": "guarded",
                "headline": "nomy is sleeping",
                "support": "A small step is enough. nomy can settle slowly as you use the app.",
            }
        )

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        feature_names = {activity.get("feature") for activity in activities if isinstance(activity, dict)}
        if len(feature_names) >= 3:
            return JsonResponse(
                {
                    "ok": True,
                    "state": "opening",
                    "headline": "nomy is opening",
                    "support": "You have explored different supports. nomy is more open and ready to help.",
                }
            )

        return JsonResponse(
            {
                "ok": True,
                "state": "settling",
                "headline": "nomy is settling",
                "support": "Even one support activity helps nomy settle into the space.",
            }
        )

    model = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
    instructions = (
        "You are writing an adaptive avatar state for an autism support app. "
        "Given a short list of user activities, infer whether the avatar feels "
        "guarded, settling, or opening. "
        'Return strict JSON with exactly three keys: "state", "headline", and "support". '
        'The "state" must be one of "guarded", "settling", or "opening". '
        "If there is at least one activity, do not return guarded. "
        "The headline should be under 5 words. "
        "The support line should be under 18 words, warm, calm, and concrete. "
        "Reflect reduced masking and increased ease when the user has explored or reflected more."
    )

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(
                "https://api.openai.com/v1/responses",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "instructions": instructions,
                    "input": json.dumps({"activities": activities}),
                    "text": {
                        "format": {
                            "type": "json_schema",
                            "name": "avatar_state",
                            "schema": {
                                "type": "object",
                                "additionalProperties": False,
                                "properties": {
                                    "state": {
                                        "type": "string",
                                        "enum": ["guarded", "settling", "opening"],
                                    },
                                    "headline": {"type": "string"},
                                    "support": {"type": "string"},
                                },
                                "required": ["state", "headline", "support"],
                            },
                        }
                    },
                },
            )
    except httpx.HTTPError:
        return JsonResponse({"ok": False, "error": "The AI avatar service couldn't be reached."}, status=502)

    if response.status_code >= 400:
        return JsonResponse({"ok": False, "error": "The AI avatar service couldn't create a state."}, status=502)

    try:
        parsed = json.loads(extract_response_text(response.json()))
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "The AI avatar response was invalid."}, status=502)

    state = parsed.get("state")
    headline = (parsed.get("headline") or "").strip()
    support = (parsed.get("support") or "").strip()

    if state not in {"guarded", "settling", "opening"} or not headline or not support:
        return JsonResponse({"ok": False, "error": "The AI avatar response was incomplete."}, status=502)

    return JsonResponse({"ok": True, "state": state, "headline": headline, "support": support})


@csrf_exempt
@require_POST
def mobile_support_recommendation(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"ok": False, "error": "Invalid request body."}, status=400)

    feeling = (payload.get("feeling") or "").strip()
    if not feeling:
        return JsonResponse({"ok": False, "error": "Please write how you feel first."}, status=400)

    feature_map = {
        "emotionize": "Emotionize",
        "dailies": "Check-in",
        "express": "Express",
        "toolkit": "Toolkit",
    }
    category_map = {
        "unclear": {"label": "Unclear", "feature": "emotionize"},
        "heavy": {"label": "Heavy", "feature": "dailies"},
        "too_much": {"label": "Too much", "feature": "toolkit"},
        "need_words": {"label": "Need words", "feature": "express"},
    }

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        lowered = feeling.lower()
        if any(word in lowered for word in ["overwhelmed", "panic", "overstim", "too much", "shaky", "noise"]):
            return JsonResponse(
                {
                    "ok": True,
                    "category": "too_much",
                    "feature": "toolkit",
                    "label": feature_map["toolkit"],
                    "reason": "Toolkit looks like the gentlest first step when your system sounds overloaded.",
                }
            )
        if any(word in lowered for word in ["tired", "exhausted", "drained", "heavy", "low energy", "flat", "burnt out", "burnout", "hard day", "slow"]):
            return JsonResponse(
                {
                    "ok": True,
                    "category": "heavy",
                    "feature": "dailies",
                    "label": feature_map["dailies"],
                    "reason": "Check-in is a gentle place to notice what needs support without adding pressure.",
                }
            )
        if any(word in lowered for word in ["lonely", "sad", "numb", "confused", "unclear", "feeling"]):
            return JsonResponse(
                {
                    "ok": True,
                    "category": "unclear",
                    "feature": "emotionize",
                    "label": feature_map["emotionize"],
                    "reason": "Emotionize looks most helpful when the feeling itself needs naming and understanding first.",
                }
            )
        if any(word in lowered for word in ["say", "reply", "text", "message", "conversation", "talk", "speak", "tell", "discuss", "explain"]):
            return JsonResponse(
                {
                    "ok": True,
                    "category": "need_words",
                    "feature": "express",
                    "label": feature_map["express"],
                    "reason": "Express looks like the best fit when words, replies, or self-expression are the main need.",
                }
            )
        return JsonResponse(
            {
                "ok": True,
                "category": "heavy",
                "feature": "dailies",
                "label": feature_map["dailies"],
                "reason": "Check-in is a gentle place to slow down and notice what needs support before doing anything bigger.",
            }
        )

    model = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
    instructions = (
        "You recommend the best first support feature for an autism support app. "
        "First categorise the user's sentence into exactly one support category: unclear, heavy, too_much, or need_words. "
        "Unclear means the user cannot name or understand what they feel. "
        "Heavy means low energy, tiredness, sadness, flatness, or needing a gentle check-in. "
        "Too_much means overload, panic, sensory stress, shutdown, meltdown, or needing regulation. "
        "Need_words means needing help with wording, replying, explaining, boundaries, or communication. "
        "Then choose the matching first feature: unclear -> emotionize, heavy -> dailies, too_much -> toolkit, need_words -> express. "
        "Emotionize is for understanding feelings. "
        "Dailies is for gentle daily reflection and check-ins. "
        "Express is for finding words or responses. "
        "Toolkit is for grounding and regulation. "
        'Return strict JSON with exactly four keys: "category", "feature", "label", and "reason". '
        'The "category" must be one of unclear, heavy, too_much, need_words. '
        'The "feature" must be one of emotionize, dailies, express, toolkit. '
        'The "label" should be the user-facing feature name. '
        "The reason should be warm, calm, and under 20 words. "
        "Recommend only the best first step, but remember the user can still choose differently."
    )

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(
                "https://api.openai.com/v1/responses",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "instructions": instructions,
                    "input": feeling,
                    "text": {
                        "format": {
                            "type": "json_schema",
                            "name": "support_recommendation",
                            "schema": {
                                "type": "object",
                                "additionalProperties": False,
                                "properties": {
                                    "category": {
                                        "type": "string",
                                        "enum": ["unclear", "heavy", "too_much", "need_words"],
                                    },
                                    "feature": {
                                        "type": "string",
                                        "enum": ["emotionize", "dailies", "express", "toolkit"],
                                    },
                                    "label": {"type": "string"},
                                    "reason": {"type": "string"},
                                },
                                "required": ["category", "feature", "label", "reason"],
                            },
                        }
                    },
                },
            )
    except httpx.HTTPError:
        return JsonResponse({"ok": False, "error": "The recommendation service couldn't be reached."}, status=502)

    if response.status_code >= 400:
        return JsonResponse({"ok": False, "error": "The recommendation service couldn't help just now."}, status=502)

    try:
        parsed = json.loads(extract_response_text(response.json()))
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "The recommendation came back in an unexpected format."}, status=502)

    category = parsed.get("category")
    feature = parsed.get("feature")
    label = (parsed.get("label") or "").strip()
    reason = (parsed.get("reason") or "").strip()

    if category not in category_map or feature not in feature_map or not label or not reason:
        return JsonResponse({"ok": False, "error": "The recommendation was incomplete."}, status=502)

    expected_feature = category_map[category]["feature"]
    if feature != expected_feature:
        feature = expected_feature
        label = feature_map[feature]

    return JsonResponse({"ok": True, "category": category, "feature": feature, "label": label, "reason": reason})
