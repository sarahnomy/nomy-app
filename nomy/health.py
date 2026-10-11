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
    response = JsonResponse({'ok': True, 'database': connection.vendor})
    response['Cache-Control'] = 'no-store'
    response['X-Nomy-Database-Guard'] = '1'
    response['X-Nomy-Subscription-Revision'] = '2'
    response['X-Nomy-Story-Admin-Revision'] = '1'
    response['X-Nomy-Story-Safety-Revision'] = '1'
    return response
