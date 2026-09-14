import json
import os

import httpx
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils.text import slugify
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


# -------------------------------
# Base pages
# -------------------------------
@login_required
def home(request):
    return render(request, "express/home.html")

def expressSpeak(request):
    response_text = request.GET.get("response", "")
    return render(request, "express/express-speak.html", {"response": response_text})

def expressText(request):
    response_text = request.GET.get("response", "")
    return render(request, "express/express-text.html", {"response": response_text})

# -------------------------------
# Scenario data
# -------------------------------

SCENARIOS = {
    "social-event": {
        "prompt": "Someone invites you to a social event you don’t want to attend",
        "style": "boundary-setting",
        "options": [
            {"label": "Be honest with myself", "type": "direct"},
            {"label": "Be kind to others", "type": "relational"},
        ],
    },
    "interrupted": {
        "prompt": "Your colleague interrupts you during a meeting",
        "options": [
            {"label": "Say it simply", "type": "direct"},
            {"label": "Say it gently", "type": "relational"},
        ],
    },
    "unclear-instructions": {
        "prompt": "You need clearer instructions at work",
        "options": [
            {"label": "Ask directly", "type": "direct"},
            {"label": "Ask collaboratively", "type": "relational"},
        ],
    },
    "text-over-call": {
        "prompt": "You're explaining why you prefer text over calls",
        "options": [
            {"label": "Be honest with myself", "type": "direct"},
            {"label": "Reach out gently", "type": "relational"},
        ],
    },
    "group-setting": {
        "prompt": "You’re in a group and can’t get a word in",
        "options": [
            {"label": "Be honest with myself", "type": "direct"},
            {"label": "Reach out gently", "type": "relational"},
        ],
    },
}

STYLE_INFO = {
    "boundary-setting": {
        "label": "Setting Boundaries",
        "description": "Used when you need to protect your time, energy, or comfort.",
    },
    "assert-turn-taking": {
        "label": "Holding Your Turn",
        "description": "Used when someone interrupts or talks over you.",
    },
    "clarify-info": {
        "label": "Requesting Clarity",
        "description": "Used when instructions or expectations aren't clear.",
    },
}

# -------------------------------
# Response data
# -------------------------------

RESPONSES = {
    "social-event": {
        "direct": "Thanks for the invite but I’m not up for a group event right now.",
        "relational": "I really appreciate the invite but I’ve had a full week and need some quiet time.",
    },
    "interrupted": {
        "direct": "Please let me finish my point, then I’ll listen to yours.",
        "relational": "I have a few more thoughts I’d like to finish before I lose them — can I share those first?",
    },
    "unclear-instructions": {
        "direct": "Could you clarify what’s expected for this task?",
        "relational": "I just want to make sure I’ve understood your request correctly — could you clarify what’s needed?",
    },
    "text-over-call": {
        "direct": "I find calls stressful. I prefer texting.",
        "relational": "Texting helps me focus and express myself clearly. I appreciate when people are understanding of that.",
    },
    "group-setting": {
        "direct": "I’d like to share something too.",
        "relational": "I want to share something that connects with what you said. Can I go next?",
    },
}


# -------------------------------
# Views
# -------------------------------

def expressScenario(request):
    """Display the chosen scenario and its two tone options."""
    situation = request.GET.get("situation", "social-event")
    slug = slugify(situation)
    scenario = SCENARIOS.get(slug)

    # Fallback if not found
    if not scenario:
        slug, scenario = "social-event", SCENARIOS["social-event"]

    print("DEBUG expressScenario:", slug)

    context = {
        "slug": slug,
        "prompt": scenario["prompt"],
        "options": scenario["options"],
    }
    return render(request, "express/express-scenario.html", context)

def expressResponse(request):
    situation = request.GET.get("situation")
    tone = request.GET.get("tone")  # direct or relational

    scenario = SCENARIOS.get(situation)
    if not scenario:
        return redirect("express:express-home")

    response_text = RESPONSES.get(situation, {}).get(tone)
    if not response_text:
        response_text = "No response available."

    context = {
        "prompt": scenario["prompt"],          # ✅ readable scenario
        "response": response_text,
        "tone": tone,
        "tone_label": tone.title(),             # "Direct" / "Relational"
    }

    return render(request, "express/express-response.html", context)

def createScenarioPage(request):
    return render(request, "express/create-scenario.html")


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


def build_local_express_response(scenario):
    lowered = scenario.lower()

    if any(word in lowered for word in ["call", "phone", "text", "message"]):
        return {
            "direct": "Text works better for me than calls. Please message me instead.",
            "relational": "I communicate more clearly by text. I appreciate you using messages with me when you can.",
        }

    if any(word in lowered for word in ["space", "alone", "quiet", "overstimulated", "overwhelmed"]):
        return {
            "direct": "I need some quiet time now. I will come back to this when I can.",
            "relational": "I care about this, and I need a bit of quiet time before I can respond properly.",
        }

    if any(word in lowered for word in ["interrupt", "meeting", "group", "speak", "talk"]):
        return {
            "direct": "I would like to finish my thought first.",
            "relational": "I have something I want to add. Can I finish my thought, then I will listen to yours?",
        }

    if any(word in lowered for word in ["invite", "event", "party", "meet"]):
        return {
            "direct": "Thank you for inviting me, but I cannot come this time.",
            "relational": "I appreciate the invite. I do not have the capacity for this right now, but thank you for thinking of me.",
        }

    return {
        "direct": "I need to say this clearly: this does not work for me right now.",
        "relational": "I want to explain this in a way that is clear and respectful. This does not work for me right now.",
    }


@csrf_exempt
@require_POST
def mobile_express_response(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"ok": False, "error": "Invalid request body."}, status=400)

    scenario = (payload.get("scenario") or "").strip()
    if not scenario:
        return JsonResponse({"ok": False, "error": "Please write your scenario first."}, status=400)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        local_response = build_local_express_response(scenario)
        return JsonResponse({"ok": True, "prompt": scenario, **local_response})

    model = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
    instructions = (
        "You help autistic adults express themselves clearly and kindly. "
        "Given a scenario, return strict JSON with exactly two keys: "
        '"direct" and "relational". '
        "Each response should be concise, supportive, and natural. "
        "Avoid therapy disclaimers, avoid overexplaining, and keep each response under 45 words."
    )

    try:
        with httpx.Client(timeout=25.0) as client:
            response = client.post(
                "https://api.openai.com/v1/responses",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "instructions": instructions,
                    "input": f"Scenario: {scenario}\nReturn JSON only.",
                    "text": {
                        "format": {
                            "type": "json_schema",
                            "name": "express_responses",
                            "schema": {
                                "type": "object",
                                "additionalProperties": False,
                                "properties": {
                                    "direct": {"type": "string"},
                                    "relational": {"type": "string"},
                                },
                                "required": ["direct", "relational"],
                            },
                        }
                    },
                },
            )
    except httpx.HTTPError:
        local_response = build_local_express_response(scenario)
        return JsonResponse({"ok": True, "prompt": scenario, **local_response})

    if response.status_code >= 400:
        local_response = build_local_express_response(scenario)
        return JsonResponse({"ok": True, "prompt": scenario, **local_response})

    data = response.json()
    raw_text = extract_response_text(data)

    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        local_response = build_local_express_response(scenario)
        return JsonResponse({"ok": True, "prompt": scenario, **local_response})

    direct = (parsed.get("direct") or "").strip()
    relational = (parsed.get("relational") or "").strip()

    if not direct or not relational:
        local_response = build_local_express_response(scenario)
        return JsonResponse({"ok": True, "prompt": scenario, **local_response})

    return JsonResponse(
        {
            "ok": True,
            "prompt": scenario,
            "direct": direct,
            "relational": relational,
        }
    )
