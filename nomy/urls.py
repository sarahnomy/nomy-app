from .health import health
from users import creative_views
"""
URL configuration for nomy project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.views.generic import RedirectView
from django.templatetags.static import static
from django.urls import re_path

from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from core import views as core_views
from express import views as express_views
from users import views as user_views
from users import social_views
from core import mobile_community
from users.forms import EmailVerificationLoginForm
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView

urlpatterns = [
    path("api/mobile/health/", health, name="mobile_health"),
    path('admin/', admin.site.urls),
    path('register/', user_views.register, name='register'),
    path(
        'login/',
        auth_views.LoginView.as_view(
            template_name='users/login.html',
            authentication_form=EmailVerificationLoginForm,
        ),
        name='login'
    ),
    path('logout/', auth_views.LogoutView.as_view(template_name='users/logout.html'), name='logout'),
    path('api/mobile/login/', user_views.mobile_login, name='mobile_login'),
    path('api/mobile/logout/', user_views.mobile_logout, name='mobile_logout'),
    path('api/mobile/register/', user_views.mobile_register, name='mobile_register'),
    path('api/mobile/delete-account/', user_views.mobile_delete_account, name='mobile_delete_account'),
    path('api/mobile/social/providers/', social_views.mobile_social_providers, name='mobile_social_providers'),
    path('api/mobile/social/challenge/', social_views.mobile_social_challenge, name='mobile_social_challenge'),
    path('api/mobile/social/login/', social_views.mobile_social_login, name='mobile_social_login'),
    path('api/mobile/social/delete-account/', social_views.mobile_social_delete_account, name='mobile_social_delete_account'),
    path('api/mobile/stories/', mobile_community.stories, name='mobile_stories'),
    path('api/mobile/stories/submit/', mobile_community.submit_story, name='mobile_story_submit'),
    path('api/mobile/stories/<uuid:story_id>/', mobile_community.story_detail, name='mobile_story_detail'),
    path('api/mobile/stories/<uuid:story_id>/report/', mobile_community.report_story, name='mobile_story_report'),
    path('api/mobile/artworks/', creative_views.artworks, name='mobile_artworks'),
    path('api/mobile/artworks/<uuid:artwork_id>/', creative_views.artwork_detail, name='mobile_artwork_detail'),
    path('api/mobile/blocks/', mobile_community.blocks, name='mobile_blocks'),
    path('api/mobile/subscription/', mobile_community.subscription, name='mobile_subscription'),
    path('api/mobile/subscription/webhook/', mobile_community.subscription_webhook, name='mobile_subscription_webhook'),
    path('api/mobile/avatar-state/', core_views.mobile_avatar_state, name='mobile_avatar_state'),
    path('api/mobile/support-recommendation/', core_views.mobile_support_recommendation, name='mobile_support_recommendation'),
    path('api/mobile/emotionize-tts/', core_views.mobile_emotionize_tts, name='mobile_emotionize_tts'),
    path('api/mobile/express-response/', express_views.mobile_express_response, name='mobile_express_response'),
    path('verify-email/<uuid:token>/', user_views.verify_email, name='verify_email'),
    path('reflections/', include('reflections.urls')),

    path("debug-email/", user_views.debug_email),

    # main app
    path('', include('core.urls')),

    re_path(
        r'^favicon\.ico$',
        RedirectView.as_view(url=static('favicon.ico'), permanent=True),
    ),
]
