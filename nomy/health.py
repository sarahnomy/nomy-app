"""Minimal deployment health: never expose connection strings or account data."""
from django.db import connection, DatabaseError
from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
    except DatabaseError:
        return JsonResponse({'ok': False}, status=503)
    return JsonResponse({'ok': True, 'database': connection.vendor})
