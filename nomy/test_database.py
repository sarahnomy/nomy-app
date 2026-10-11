import os
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch
from django.core.exceptions import ImproperlyConfigured
from .database import database_config


class DatabaseConfigurationTests(TestCase):
    def test_local_development_retains_sqlite(self):
        with patch.dict(os.environ, {}, clear=True):
            config = database_config(Path('/tmp/nomy'))
        self.assertEqual(config['ENGINE'], 'django.db.backends.sqlite3')
        self.assertEqual(config['NAME'], '/tmp/nomy/db.sqlite3')

    def test_render_without_url_cannot_create_a_disposable_database(self):
        for value in ['', '   ']:
            with self.subTest(value=value), patch.dict(os.environ, {'RENDER': 'true', 'DATABASE_URL': value}, clear=True):
                with self.assertRaisesRegex(ImproperlyConfigured, 'Render requires DATABASE_URL'):
                    database_config(Path('/tmp/nomy'))

    def test_render_rejects_ephemeral_sqlite(self):
        with patch.dict(os.environ, {'RENDER': 'true', 'DATABASE_URL': 'sqlite:////tmp/nomy.sqlite3'}, clear=True):
            with self.assertRaisesRegex(ImproperlyConfigured, 'PostgreSQL DATABASE_URL'):
                database_config(Path('/tmp/nomy'))

    def test_render_uses_configured_postgres_without_logging_credentials(self):
        with patch.dict(os.environ, {'RENDER': 'true', 'DATABASE_URL': 'postgresql://example:private@database.internal/nomy'}, clear=True):
            config = database_config(Path('/tmp/nomy'))
        self.assertEqual(config['ENGINE'], 'django.db.backends.postgresql')
        self.assertEqual(config['NAME'], 'nomy')
        self.assertEqual(config['HOST'], 'database.internal')
