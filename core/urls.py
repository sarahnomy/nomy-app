from django.urls import include, path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Core pages
    path('', views.home, name='nomy-home'),
    path('intro/', views.intro, name='nomy-intro'),
    path('options/', views.options, name='nomy-options'),
    path('about/', views.about, name='nomy-about'),
    path('help/', views.help, name='nomy-help'),
    path('privacy/', views.privacy, name='nomy-privacy'),

    # Settings + password change (templates live in core/)
    path('settings/', views.settings, name='nomy-settings'),

    path('settings/password/', auth_views.PasswordChangeView.as_view(
        template_name='core/password-change.html',
        success_url='/settings/password/done/'
    ), name='password_change'),

    path('settings/password/done/', auth_views.PasswordChangeDoneView.as_view(
        template_name='core/password-change-done.html'
    ), name='password_change_done'),

    # Sub-apps
    path('emotionize/', include('emotionfy.urls')),
    path('dailies/', include('dailies.urls')),
    path('express/', include('express.urls')),
    path('toolkit/', include('toolkit.urls')),
]
