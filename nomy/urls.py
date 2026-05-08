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
from users import views as user_views
from users.forms import EmailVerificationLoginForm
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView

urlpatterns = [
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
    path('api/mobile/register/', user_views.mobile_register, name='mobile_register'),
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
