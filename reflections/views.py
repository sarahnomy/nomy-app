from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from .models import EmotionReflection, ExpressReflection
import datetime, json

@login_required
def save_express(request):
    data = json.loads(request.body)
    ExpressReflection.objects.create(
        user=request.user,
        date=datetime.date.today(),
        text=data["text"]
    )
    return JsonResponse({"saved": True})

@login_required
def save_emotion(request):
    data = json.loads(request.body)
    EmotionReflection.objects.create(
        user=request.user,
        date=datetime.date.today(),
        emotion=data["emotion"],
        text=data["text"]
    )
    return JsonResponse({"saved": True})

@login_required
def get_emotion_reflections(request):
    items = EmotionReflection.objects.filter(user=request.user).order_by("-date")
    data = []
    for i in items:
        data.append({
            "date": i.date.strftime("%d/%m/%Y"),
            "emotion": i.emotion,
            "reflection": i.text
        })
    return JsonResponse(data, safe=False)


def serialize_emotion_reflection(item):
    return {
        "id": item.id,
        "date": item.date.isoformat(),
        "emotion": item.emotion,
        "reflection": item.text,
    }


@csrf_exempt
@require_POST
def mobile_save_emotion(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"ok": False, "error": "Invalid request body."}, status=400)

    user_id = data.get("user_id")
    emotion = (data.get("emotion") or "").strip()
    text = (data.get("text") or "").strip()

    if not user_id:
        return JsonResponse({"ok": False, "error": "Please log in before syncing this reflection."}, status=401)
    if not emotion or not text:
        return JsonResponse({"ok": False, "error": "Emotion and reflection text are required."}, status=400)

    user = User.objects.filter(id=user_id).first()
    if user is None:
        return JsonResponse({"ok": False, "error": "We couldn't find that account."}, status=404)

    item = EmotionReflection.objects.create(
        user=user,
        date=datetime.date.today(),
        emotion=emotion,
        text=text,
    )
    return JsonResponse({"ok": True, "reflection": serialize_emotion_reflection(item)}, status=201)


@csrf_exempt
@require_GET
def mobile_get_emotion_reflections(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"ok": False, "error": "Please log in before syncing reflections."}, status=401)

    items = EmotionReflection.objects.filter(user_id=user_id).order_by("-date", "-id")[:100]
    return JsonResponse({"ok": True, "reflections": [serialize_emotion_reflection(item) for item in items]})
