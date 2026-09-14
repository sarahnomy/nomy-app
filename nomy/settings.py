"""
Django settings for nomy project.
Updated for deployment on Render / Railway (auto-deploy from GitHub)
"""
from django.contrib.auth import get_user_model
import os
from pathlib import Path
import dj_database_url
import environ
env = environ.Env()
environ.Env.read_env()

# ------------------------------------------------------
# BASE DIRECTORY
# ------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent


# ------------------------------------------------------
# SECURITY
# ------------------------------------------------------
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-dev-key-change-me"  # fallback for local dev
)

DEBUG = os.getenv("DEBUG", "True") == "True"

# Example for both local + hosted domain
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "nomy-app.onrender.com",     # your Render free domain
    "yourdomain.com"         # replace with your custom domain later
]

CSRF_TRUSTED_ORIGINS = [
    "https://nomy-app.onrender.com",
    "http://nomy-app.onrender.com",
    "https://yourdomain.com",
    "https://*.onrender.com"
]

if DEBUG:
    ALLOWED_HOSTS += ["*"]
    CSRF_TRUSTED_ORIGINS += [
        "https://*.localhost.run",
        "https://*.lhr.life",
        "https://*.loca.lt",
        "https://*.trycloudflare.com",
    ]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = False  # redirect to https if in production
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ------------------------------------------------------
# APPLICATIONS
# ------------------------------------------------------
INSTALLED_APPS = [
    'core',
    'emotionfy',
    'dailies',
    'experience',
    'express',
    'toolkit',
    'reflections',
    'users.apps.UsersConfig',

    # Django defaults
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]


# ------------------------------------------------------
# MIDDLEWARE
# ------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # enables static serving on Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ------------------------------------------------------
# URLS + WSGI
# ------------------------------------------------------
ROOT_URLCONF = 'nomy.urls'
WSGI_APPLICATION = 'nomy.wsgi.application'


# ------------------------------------------------------
# TEMPLATES
# ------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'nomy' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ------------------------------------------------------
# DATABASE
# ------------------------------------------------------
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=False
    )
}


# ------------------------------------------------------
# PASSWORD VALIDATION
# ------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ------------------------------------------------------
# INTERNATIONALIZATION
# ------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ------------------------------------------------------
# STATIC FILES
# ------------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = [
    BASE_DIR / "core" / "static",
]

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ------------------------------------------------------
# DEFAULT PK TYPE
# ------------------------------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_REDIRECT_URL = '/'

# --- Email Settings ---
# --- Email Settings (Brevo SMTP) ---
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.environ.get("EMAIL_HOST")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS") == "True"
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL")

LOGIN_URL = '/login/'
