import json
import math
import re
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .mobile_auth import mobile_user
from .models import CreativeArtwork
from .subscriptions import refresh_entitlement, SubscriptionUnavailable

TEMPLATES = {f'{category}-{i}' for category in ('fruit', 'animal', 'object') for i in range(3)}
COLOR = re.compile(r'^#[0-9a-fA-F]{6}$')

def valid_document(doc):
    if not isinstance(doc, dict) or doc.get('version') != 1 or doc.get('mode') not in ('colour', 'doodle'):
        return False
    if doc.get('template') not in (TEMPLATES if doc['mode'] == 'colour' else {None}):
        return False
    fills, strokes = doc.get('fills'), doc.get('strokes')
    if not isinstance(fills, dict) or len(fills) > 30 or not isinstance(strokes, list) or len(strokes) > 200:
        return False
    if any(not isinstance(k, str) or len(k) > 40 or not isinstance(v, str) or not COLOR.fullmatch(v) for k, v in fills.items()):
        return False
    points = 0
    for stroke in strokes:
        if not isinstance(stroke, dict) or not isinstance(stroke.get('colour'), str) or not COLOR.fullmatch(stroke['colour']): return False
        width = stroke.get('width')
        if isinstance(width, bool) or not isinstance(width, (int, float)) or not math.isfinite(width) or not 1 <= width <= 32: return False
        coords = stroke.get('points')
        if not isinstance(coords, list) or not 1 <= len(coords) <= 2000: return False
        points += len(coords)
        if points > 16000: return False
        for point in coords:
            if not isinstance(point, dict): return False
            for axis in ('x', 'y'):
                value = point.get(axis)
                if isinstance(value, bool) or not isinstance(value, (float, int)) or not math.isfinite(value) or not 0 <= value <= 320: return False
    return True

def serialize(art):
    return {'id': str(art.id), 'title': art.title, 'document': art.document, 'created_at': art.created_at.isoformat(), 'updated_at': art.updated_at.isoformat()}

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def artworks(request):
    user = mobile_user(request)
    if not user: return JsonResponse({'ok': False, 'error': 'Log in again to save or view your artwork.'}, status=401)
    if request.method == 'GET':
        return JsonResponse({'ok': True, 'artworks': [serialize(art) for art in CreativeArtwork.objects.filter(user=user)[:100]]})
    try:
        if len(request.body) > 500000: raise ValueError()
        body = json.loads(request.body)
        if not isinstance(body, dict): raise ValueError()
        art_id = uuid.UUID(body.get('id', ''))
        title = body.get('title')
        if not isinstance(title, str) or not title.strip() or len(title) > 80 or not valid_document(body.get('document')): raise ValueError()
    except (ValueError, TypeError, AttributeError, UnicodeDecodeError):
        return JsonResponse({'ok': False, 'error': 'This drawing could not be saved. Please use a smaller drawing and try again.'}, status=400)
    try:
        premium, _ = refresh_entitlement(user)
    except SubscriptionUnavailable:
        return JsonResponse({'ok': False, 'error': 'Could not verify your membership. Please try again.'}, status=503)
    if not premium: return JsonResponse({'ok': False, 'error': 'Creative is included with Nomy+.'}, status=403)
    existing = CreativeArtwork.objects.filter(pk=art_id).first()
    if existing and existing.user_id != user.pk: return JsonResponse({'ok': False, 'error': 'Artwork not found.'}, status=404)
    if not existing and CreativeArtwork.objects.filter(user=user).count() >= 100:
        return JsonResponse({'ok': False, 'error': 'Your gallery is full. Delete an older drawing to save another.'}, status=400)
    art, _ = CreativeArtwork.objects.update_or_create(id=art_id, user=user, defaults={'title': title.strip(), 'document': body['document']})
    return JsonResponse({'ok': True, 'artwork': serialize(art)}, status=201)

@csrf_exempt
@require_http_methods(['GET', 'DELETE'])
def artwork_detail(request, artwork_id):
    user = mobile_user(request)
    if not user: return JsonResponse({'ok': False, 'error': 'Log in again to view your artwork.'}, status=401)
    art = CreativeArtwork.objects.filter(pk=artwork_id, user=user).first()
    if not art: return JsonResponse({'ok': False, 'error': 'Artwork not found.'}, status=404)
    if request.method == 'DELETE':
        art.delete(); return JsonResponse({'ok': True})
    return JsonResponse({'ok': True, 'artwork': serialize(art)})
