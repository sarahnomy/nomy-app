import base64
import binascii
import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from users.mobile_auth import mobile_user
from .models import AccountSave

KINDS = {'check-in', 'express', 'story-saved', 'story-resonated', 'activity'}

def serialize(item):
    return {**item.data, 'id': str(item.pk), 'date': item.created_at.date().isoformat(), **({'at': item.created_at.isoformat()} if item.kind == 'activity' else {})}

def clean_data(kind, value):
    if not isinstance(value, dict):
        raise ValueError()
    if kind == 'activity':
        if not isinstance(value.get('type'), str) or not value['type'] or len(value['type']) > 100:
            raise ValueError()
        data = {'type': value['type']}
        for field in ('feature', 'label'):
            if field in value:
                if not isinstance(value[field], str) or len(value[field]) > 300:
                    raise ValueError()
                data[field] = value[field]
        return data, None
    if kind.startswith('story-'):
        story_id = value.get('storyId')
        if not isinstance(story_id, str) or not story_id or len(story_id) > 100:
            raise ValueError()
        return {'storyId': story_id}, None
    reflection = value.get('reflection')
    if not isinstance(reflection, str) or not reflection.strip() or len(reflection) > 30000:
        raise ValueError()
    data = {'reflection': reflection.strip()}
    if kind == 'check-in':
        if value.get('period') not in ('morning', 'evening'):
            raise ValueError()
        return {**data, 'period': value['period']}, None
    if value.get('style') not in ('direct', 'relational') or value.get('mode') not in ('text', 'voice'):
        raise ValueError()
    for field in ('scenario', 'suggestedResponse'):
        if not isinstance(value.get(field), str) or len(value[field]) > 30000:
            raise ValueError()
        data[field] = value[field]
    data.update(style=value['style'], mode=value['mode'])
    audio = None
    if value['mode'] == 'voice':
        encoded = value.get('audioBase64')
        duration = value.get('audioDurationMillis')
        if not isinstance(encoded, str) or len(encoded) > 1400000:
            raise ValueError()
        audio = base64.b64decode(encoded, validate=True)
        if not audio or len(audio) > 1048576 or isinstance(duration, bool) or not isinstance(duration, int) or not 0 <= duration <= 3600000:
            raise ValueError()
        data['audioDurationMillis'] = duration
    return data, audio

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def account_saves(request):
    user = mobile_user(request)
    if not user:
        return JsonResponse({'ok': False, 'error': 'Log in or create an account to save and view your items.'}, status=401)
    if request.method == 'GET':
        kind = request.GET.get('kind')
        if kind not in KINDS:
            return JsonResponse({'ok': False, 'error': 'Invalid save type.'}, status=400)
        return JsonResponse({'ok': True, 'items': [serialize(item) for item in AccountSave.objects.filter(user=user, kind=kind)[:40 if kind == 'activity' else 1000]]})
    try:
        if len(request.body) > 1600000:
            raise ValueError()
        body = json.loads(request.body)
        if not isinstance(body, dict) or body.get('kind') not in KINDS:
            raise ValueError()
        kind = body['kind']
        data, audio = clean_data(kind, body.get('data'))
        key = data['storyId'] if kind.startswith('story-') else body.get('key', str(uuid.uuid4()))
        if not isinstance(key, str) or not key or len(key) > 100:
            raise ValueError()
        if kind.startswith('story-') and not isinstance(body.get('selected'), bool):
            raise ValueError()
    except (ValueError, TypeError, UnicodeDecodeError, binascii.Error):
        return JsonResponse({'ok': False, 'error': 'This item could not be saved. Check the contents; voice recordings must be smaller than 1 MB.'}, status=400)
    if kind.startswith('story-') and not body['selected']:
        AccountSave.objects.filter(user=user, kind=kind, key=key).delete()
        return JsonResponse({'ok': True})
    item, _ = AccountSave.objects.get_or_create(user=user, kind=kind, key=key, defaults={'data': data, 'audio': audio})
    if kind == 'activity':
        keep = list(AccountSave.objects.filter(user=user, kind=kind).values_list('id', flat=True)[:40])
        AccountSave.objects.filter(user=user, kind=kind).exclude(id__in=keep).delete()
    return JsonResponse({'ok': True, 'item': serialize(item)}, status=201)
