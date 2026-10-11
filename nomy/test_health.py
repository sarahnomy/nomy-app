from unittest.mock import patch
from django.db import DatabaseError
from django.test import TestCase
from django.urls import reverse


class HealthTests(TestCase):
    def test_health_checks_connection_and_only_reports_vendor(self):
        response = self.client.get(reverse('mobile_health'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'ok': True, 'database': 'sqlite'})

    def test_database_failure_does_not_expose_credentials(self):
        with patch('nomy.health.connection.cursor', side_effect=DatabaseError('private connection details')):
            response = self.client.get(reverse('mobile_health'))
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {'ok': False})
