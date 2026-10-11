"""Select local development storage or the configured hosted database."""
import os
import dj_database_url
from django.core.exceptions import ImproperlyConfigured


def database_config(base_dir):
    url = os.environ.get('DATABASE_URL', '').strip()
    on_render = os.environ.get('RENDER', '').lower() == 'true'
    if on_render and not url:
        raise ImproperlyConfigured(
            'Render requires DATABASE_URL for a persistent PostgreSQL database. '
            'Local SQLite would lose accounts on redeploy or restart.'
        )
    config = dj_database_url.parse(url or f'sqlite:///{base_dir / "db.sqlite3"}', conn_max_age=600)
    if on_render and config['ENGINE'] != 'django.db.backends.postgresql':
        raise ImproperlyConfigured('Render requires a PostgreSQL DATABASE_URL; ephemeral SQLite is not supported.')
    return config
