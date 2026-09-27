import json
import os
import uuid
from datetime import timedelta

import httpx
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import ExpressAIUsage


FREE_EXPRESS_AI_USES_PER_WEEK = 2


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


DEFAULT_EXPRESS_FEELINGS = [
    {"name": "Frustrated", "reason": "because something keeps happening or changing."},
    {"name": "Hurt", "reason": "because this may be affecting how valued you feel."},
    {"name": "Worried", "reason": "because you do not want this to become a bigger problem."},
    {"name": "Unsure", "reason": "because it is hard to know what to say or how it will land."},
]


def build_local_feeling_options(scenario):
    lowered = scenario.lower()

    if any(word in lowered for word in ["social", "socials", "drinks", "party"]) and any(word in lowered for word in ["work", "colleague", "coworker", "team"]):
        return [
            {"name": "Pressured", "reason": "because the social event is connected to work, so saying no may feel less simple."},
            {"name": "Protective", "reason": "because you may be trying to protect your energy outside work hours."},
            {"name": "Unsure", "reason": "because you might not know how much explanation people expect."},
            {"name": "Frustrated", "reason": "because joining in may feel treated like an expectation rather than a choice."},
        ]

    if any(word in lowered for word in ["cancel", "plans", "effort", "friend"]):
        return [
            {"name": "Frustrated", "reason": "because the same situation seems to keep happening."},
            {"name": "Hurt", "reason": "because you may feel like you are putting in more effort."},
            {"name": "Unsure", "reason": "because you do not want to sound needy or unfair."},
            {"name": "Tired", "reason": "because it can take energy to keep holding it in."},
        ]

    if any(word in lowered for word in ["quiet", "talk", "speak", "what's wrong", "whats wrong", "questions"]):
        return [
            {"name": "Overwhelmed", "reason": "because speaking may feel difficult in that moment."},
            {"name": "Pressured", "reason": "because questions can feel like too much when you need quiet."},
            {"name": "Misunderstood", "reason": "because being quiet can be read the wrong way."},
            {"name": "Unsure", "reason": "because you may not know how to explain it before it happens."},
        ]

    if any(word in lowered for word in ["work", "job", "manager", "colleague", "meeting"]):
        return [
            {"name": "Stressed", "reason": "because this involves expectations from other people."},
            {"name": "Unsure", "reason": "because it may be hard to know what is allowed or appropriate to say."},
            {"name": "Frustrated", "reason": "because something at work is not working for you right now."},
            {"name": "Careful", "reason": "because you may be thinking about how your words will be received."},
        ]

    if any(word in lowered for word in ["family", "partner", "relationship"]):
        return [
            {"name": "Hurt", "reason": "because this seems connected to someone important to you."},
            {"name": "Worried", "reason": "because you may not want this to create distance or conflict."},
            {"name": "Frustrated", "reason": "because your needs may not be getting understood."},
            {"name": "Unsure", "reason": "because you might be trying to protect the relationship and yourself."},
        ]

    return DEFAULT_EXPRESS_FEELINGS


def build_local_express_response(scenario):
    lowered = scenario.lower()

    if any(word in lowered for word in ["social", "socials", "drinks", "party"]) and any(word in lowered for word in ["work", "colleague", "coworker", "team"]):
        return {
            "direct": "I’m not joining work socials at the moment. I’ll keep work time separate from my personal time.",
            "relational": "Thanks for inviting me. I’m not joining work socials right now because I need to keep some space outside work, but I appreciate being included.",
        }

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


def build_local_express_payload(scenario, feeling="", goal="", not_wants=None, tone="", memory_context=""):
    not_wants = not_wants or []
    response = build_local_express_response(scenario)
    feeling_text = feeling or "unsure"
    goal_text = goal or "I don't know yet."
    not_want_line = ""

    if not_wants:
        first_not_want = not_wants[0].replace("I don't want to ", "").rstrip(".")
        not_want_line = f" I also do not want to {first_not_want}."

    topic = scenario.strip().replace("\n", " ")
    if len(topic) > 120:
        topic = f"{topic[:117]}..."

    trying_to_say = (
        f"I want to talk about {topic or 'what happened'}. "
        f"I think I might be feeling {feeling_text.lower()}, and {goal_text.lower()}"
    )

    drafts = [
        {
            "label": "Softer",
            "text": (
                f"I wanted to be honest about something. When {topic}, I feel {feeling_text.lower()}. "
                f"{goal_text} I care about how this comes across, but I do not want to pretend it is not affecting me.{not_want_line}"
            ),
        },
        {"label": "Direct", "text": response["direct"]},
        {"label": "More like everyday speech", "text": response["relational"]},
    ]

    if tone in {"Firm", "Matter-of-fact"}:
        drafts = [drafts[1], drafts[2], drafts[0]]

    if memory_context:
        trying_to_say = f"{trying_to_say} I may also need the other person to understand a pattern I've noticed before."

    return {
        "ok": True,
        "prompt": scenario,
        "ai_used": False,
        "feelings": build_local_feeling_options(scenario),
        "trying_to_say": trying_to_say,
        "drafts": drafts,
        **response,
    }


def safe_list(value):
    if not isinstance(value, list):
        return []

    return [str(item).strip() for item in value if str(item).strip()]


def get_mobile_request_user(request, payload):
    if request.user.is_authenticated:
        return request.user

    user_id = payload.get("user_id")
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return None

    return User.objects.filter(id=user_id, is_active=True).first()


def user_has_unlimited_express_ai(user):
    return bool(user and (user.is_staff or user.is_superuser))


def get_express_ai_limit_state(user):
    window_start = timezone.now() - timedelta(days=7)
    used_count = ExpressAIUsage.objects.filter(user=user, used_at__gte=window_start).count()

    return {
        "used_count": used_count,
        "uses_left": max(FREE_EXPRESS_AI_USES_PER_WEEK - used_count, 0),
        "window_start": window_start,
    }


def extract_usage_counts(data):
    usage = data.get("usage") if isinstance(data, dict) else {}
    if not isinstance(usage, dict):
        return 0, 0

    input_tokens = usage.get("input_tokens") or usage.get("prompt_tokens") or 0
    output_tokens = usage.get("output_tokens") or usage.get("completion_tokens") or 0

    try:
        input_tokens = int(input_tokens)
    except (TypeError, ValueError):
        input_tokens = 0

    try:
        output_tokens = int(output_tokens)
    except (TypeError, ValueError):
        output_tokens = 0

    return input_tokens, output_tokens


def save_express_ai_usage(user, flow_id, model, input_tokens, output_tokens):
    usage, created = ExpressAIUsage.objects.get_or_create(
        user=user,
        flow_id=flow_id,
        defaults={
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        },
    )

    if not created:
        usage.model = model
        usage.request_count += 1
        usage.input_tokens += input_tokens
        usage.output_tokens += output_tokens
        usage.save(update_fields=["model", "request_count", "input_tokens", "output_tokens", "last_used_at"])

    return usage


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

    feeling = (payload.get("feeling") or "").strip()
    goal = (payload.get("goal") or "").strip()
    tone = (payload.get("tone") or "").strip()
    not_wants = safe_list(payload.get("not_wants"))
    memory_context = (payload.get("memory_context") or "").strip()
    flow_id = (payload.get("flow_id") or "").strip()[:80] or uuid.uuid4().hex
    wants_final_drafts = bool(feeling or goal or tone or not_wants or memory_context)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return JsonResponse(build_local_express_payload(scenario, feeling, goal, not_wants, tone, memory_context))

    user = get_mobile_request_user(request, payload)
    if user is None:
        return JsonResponse(
            {
                "ok": False,
                "login_required": True,
                "error": "Log in or create an account to use Express AI.",
            },
            status=401,
        )

    limit_state = get_express_ai_limit_state(user)
    existing_flow = ExpressAIUsage.objects.filter(user=user, flow_id=flow_id).first()
    if not user_has_unlimited_express_ai(user) and existing_flow is None and limit_state["uses_left"] <= 0:
        return JsonResponse(
            {
                "ok": False,
                "limit_reached": True,
                "weekly_limit": FREE_EXPRESS_AI_USES_PER_WEEK,
                "uses_left": 0,
                "error": "You’ve used this week’s free Express support.",
            },
            status=429,
        )

    model = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
    instructions = (
        "You are Nomy, a calm writing support tool for late-diagnosed autistic adults. "
        "Help the user unpack what they wrote and find words that feel direct, literal, relational, and non-shaming. "
        "The feeling options must be specific to the user's exact situation, not generic templates. "
        "Each feeling reason must refer to a concrete detail, tension, or need from what the user wrote. "
        "Do not diagnose, do not over-explain, do not use therapy disclaimers, and do not tell the user what they must feel. "
        "Use plain English and keep each draft under 75 words. "
        "Return strict JSON only."
    )
    user_context = {
        "what_happened": scenario,
        "selected_feeling": feeling,
        "conversation_goal": goal,
        "what_the_user_does_not_want_to_say": not_wants,
        "preferred_tone": tone,
        "relevant_emotionize_memory": memory_context,
        "stage": "draft" if wants_final_drafts else "unpack",
    }

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
                    "input": (
                        "Create Express support for this user context.\n"
                        f"{json.dumps(user_context, ensure_ascii=False)}\n\n"
                        "Return JSON with: feelings, trying_to_say, drafts, direct, relational. "
                        "feelings must be 4 short options with name and reason. Do not reuse stock reasons unless they clearly match the user's exact words. "
                        "drafts must be 3 options. Use labels that fit the preferred tone, such as Softer, Direct, Warm, Firm, or Everyday speech."
                    ),
                    "text": {
                        "format": {
                            "type": "json_schema",
                            "name": "express_responses",
                            "schema": {
                                "type": "object",
                                "additionalProperties": False,
                                "properties": {
                                    "feelings": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "additionalProperties": False,
                                            "properties": {
                                                "name": {"type": "string"},
                                                "reason": {"type": "string"},
                                            },
                                            "required": ["name", "reason"],
                                        },
                                    },
                                    "trying_to_say": {"type": "string"},
                                    "drafts": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "additionalProperties": False,
                                            "properties": {
                                                "label": {"type": "string"},
                                                "text": {"type": "string"},
                                            },
                                            "required": ["label", "text"],
                                        },
                                    },
                                    "direct": {"type": "string"},
                                    "relational": {"type": "string"},
                                },
                                "required": ["feelings", "trying_to_say", "drafts", "direct", "relational"],
                            },
                        }
                    },
                },
            )
    except httpx.HTTPError:
        return JsonResponse(build_local_express_payload(scenario, feeling, goal, not_wants, tone, memory_context))

    if response.status_code >= 400:
        return JsonResponse(build_local_express_payload(scenario, feeling, goal, not_wants, tone, memory_context))

    data = response.json()
    raw_text = extract_response_text(data)

    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        return JsonResponse(build_local_express_payload(scenario, feeling, goal, not_wants, tone, memory_context))

    direct = (parsed.get("direct") or "").strip()
    relational = (parsed.get("relational") or "").strip()
    trying_to_say = (parsed.get("trying_to_say") or "").strip()
    feelings = [
        {"name": (item.get("name") or "").strip(), "reason": (item.get("reason") or "").strip()}
        for item in parsed.get("feelings", [])
        if isinstance(item, dict) and (item.get("name") or "").strip() and (item.get("reason") or "").strip()
    ]
    drafts = [
        {"label": (item.get("label") or "").strip(), "text": (item.get("text") or "").strip()}
        for item in parsed.get("drafts", [])
        if isinstance(item, dict) and (item.get("label") or "").strip() and (item.get("text") or "").strip()
    ]

    if not direct or not relational or not trying_to_say or not feelings or not drafts:
        return JsonResponse(build_local_express_payload(scenario, feeling, goal, not_wants, tone, memory_context))

    input_tokens, output_tokens = extract_usage_counts(data)
    save_express_ai_usage(user, flow_id, model, input_tokens, output_tokens)
    refreshed_limit_state = get_express_ai_limit_state(user)

    return JsonResponse(
        {
            "ok": True,
            "prompt": scenario,
            "ai_used": True,
            "flow_id": flow_id,
            "weekly_limit": FREE_EXPRESS_AI_USES_PER_WEEK,
            "uses_left": (
                FREE_EXPRESS_AI_USES_PER_WEEK
                if user_has_unlimited_express_ai(user)
                else refreshed_limit_state["uses_left"]
            ),
            "feelings": feelings[:4],
            "trying_to_say": trying_to_say,
            "drafts": drafts[:3],
            "direct": direct,
            "relational": relational,
        }
    )
