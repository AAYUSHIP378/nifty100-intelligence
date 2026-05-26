"""
Django settings for config project.
Generated for N100 Financial Intelligence System.
"""

import os
from pathlib import Path
from datetime import timedelta

# ================= BASE =================
BASE_DIR = Path(__file__).resolve().parent.parent


def load_env_file(path):
    if not path.exists():
        return
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file(BASE_DIR / '.env')

# ================= SECURITY =================
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'change-this-to-a-strong-secret-key')

DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = [host.strip() for host in os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if host.strip()]
RENDER_HOST = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if RENDER_HOST:
    ALLOWED_HOSTS.append(RENDER_HOST)

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('DJANGO_CSRF_TRUSTED_ORIGINS', '').split(',')
    if origin.strip()
]
if RENDER_HOST:
    CSRF_TRUSTED_ORIGINS.append(f'https://{RENDER_HOST}')

# ================= APPLICATIONS =================
INSTALLED_APPS = [

    # Django default apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',

    # Local apps
    'api',
    'dashboard',
    'accounts',
    'web',
]

# ================= MIDDLEWARE =================
MIDDLEWARE = [

    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ================= ROOT URL =================
ROOT_URLCONF = 'config.urls'

# ================= TEMPLATES =================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',

        'DIRS': [BASE_DIR / 'templates'],

        'APP_DIRS': True,

        'OPTIONS': {
            'context_processors': [

                'django.template.context_processors.debug',
                'django.template.context_processors.request',

                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ================= WSGI =================
WSGI_APPLICATION = 'config.wsgi.application'

# ================= DATABASE =================
# Django metadata: PostgreSQL on Render (DATABASE_URL), SQLite locally.
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    import dj_database_url

    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require='sslmode=require' not in DATABASE_URL,
        ),
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

WAREHOUSE_DATABASE = {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': os.getenv('POSTGRES_DB', 'bluestock_dw'),
    'USER': os.getenv('POSTGRES_USER', 'postgres'),
    'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'postgres'),
    'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
    'PORT': os.getenv('POSTGRES_PORT', '5432'),
}

# ================= PASSWORD VALIDATION =================
AUTH_PASSWORD_VALIDATORS = [

    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },

    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },

    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },

    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ================= INTERNATIONALIZATION =================
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_TZ = True

# ================= STATIC FILES =================
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# ================= DEFAULT PRIMARY KEY =================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ================= CORS SETTINGS =================
CORS_ALLOW_ALL_ORIGINS = True

# ================= CELERY =================
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULE = {
    'refresh-warehouse-nightly': {
        'task': 'etl.tasks.refresh_warehouse',
        'schedule': 60 * 60 * 24,
    },
}

# ================= REST FRAMEWORK =================
REST_FRAMEWORK = {

    # JWT Authentication
    'DEFAULT_AUTHENTICATION_CLASSES': (

        'rest_framework_simplejwt.authentication.JWTAuthentication',

    ),

    # Swagger schema
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ================= JWT SETTINGS =================
SIMPLE_JWT = {

    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),

    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),

    'ROTATE_REFRESH_TOKENS': False,

    'BLACKLIST_AFTER_ROTATION': True,

    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ================= SWAGGER / API DOCS =================
SPECTACULAR_SETTINGS = {

    'TITLE': 'N100 Financial Intelligence API',

    'DESCRIPTION': 'API for Financial Dashboards and ML Scores',

    'VERSION': '1.0.0',
}
