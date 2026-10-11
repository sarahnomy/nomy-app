import json
import uuid
from unittest.mock import patch
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from .models import CreativeArtwork
from .mobile_auth import issue_mobile_session

class CreativeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('artist', password='ArtistPassword-123!')
        self.other = User.objects.create_user('another', password='AnotherPassword-123!')
        self.headers = {'HTTP_AUTHORIZATION': 'Bearer ' + issue_mobile_session(self.user)}
        self.body = {'id': str(uuid.uuid4()), 'title': 'Little house', 'document': {'version': 1, 'mode': 'colour', 'template': 'object-0', 'fills': {'part-1': '#ef8787'}, 'strokes': [{'colour': '#333333', 'width': 3, 'points': [{'x': 100, 'y': 100}]}]}}
        self.plus = patch('users.creative_views.refresh_entitlement', return_value=(True, None)); self.plus.start(); self.addCleanup(self.plus.stop)
    def save(self, body=None, **headers):
        return self.client.post(reverse('mobile_artworks'), json.dumps(body or self.body), content_type='application/json', **(headers or self.headers))
    def test_save_read_and_retry_are_account_owned_and_idempotent(self):
        self.assertEqual(self.save().status_code, 201); self.assertEqual(self.save().status_code, 201)
        self.assertEqual(CreativeArtwork.objects.count(), 1)
        data = self.client.get(reverse('mobile_artworks'), **self.headers).json()
        self.assertEqual(data['artworks'][0]['document'], self.body['document'])
        detail = reverse('mobile_artwork_detail', args=[self.body['id']])
        self.assertEqual(self.client.get(detail, **self.headers).status_code, 200)
        other = {'HTTP_AUTHORIZATION': 'Bearer ' + issue_mobile_session(self.other)}
        self.assertEqual(self.client.get(detail, **other).status_code, 404)
        self.assertEqual(self.save(**other).status_code, 404)
        self.assertEqual(self.client.delete(detail, **other).status_code, 404)
        self.assertEqual(self.client.get(reverse('mobile_artworks'), **other).json()['artworks'], [])
    def test_save_requires_session_and_premium_but_saved_art_survives_expiry(self):
        self.assertEqual(self.client.post(reverse('mobile_artworks'), json.dumps(self.body), content_type='application/json').status_code, 401)
        self.save()
        with patch('users.creative_views.refresh_entitlement', return_value=(False, None)):
            self.assertEqual(self.save().status_code, 403)
            self.assertEqual(self.client.get(reverse('mobile_artworks'), **self.headers).status_code, 200)
    def test_invalid_vectors_and_large_drawings_are_rejected(self):
        for doc in [None, {}, {**self.body['document'], 'template': '<script>'}, {**self.body['document'], 'template': []}, {**self.body['document'], 'fills': {'part-0': 'url(javascript:bad)'}}, {**self.body['document'], 'strokes': [{'colour': '#ffffff', 'width': 3, 'points': [{'x': -1, 'y': 3}]}]}, {**self.body['document'], 'strokes': self.body['document']['strokes'] * 201}]:
            with self.subTest(doc=doc): self.assertEqual(self.save({**self.body, 'document': doc}).status_code, 400)
        self.assertEqual(CreativeArtwork.objects.count(), 0)
    def test_delete_artwork_and_account_remove_saved_personal_data(self):
        self.save(); detail = reverse('mobile_artwork_detail', args=[self.body['id']])
        self.assertEqual(self.client.delete(detail, **self.headers).status_code, 200)
        self.assertEqual(CreativeArtwork.objects.count(), 0)
        self.save()
        result = self.client.post(reverse('mobile_delete_account'), json.dumps({'user_id': self.user.id, 'username': self.user.username, 'password': 'ArtistPassword-123!'}), content_type='application/json', **self.headers)
        self.assertEqual(result.status_code, 200); self.assertEqual(CreativeArtwork.objects.count(), 0)
        self.assertEqual(self.client.get(reverse('mobile_artworks'), **self.headers).status_code, 401)
