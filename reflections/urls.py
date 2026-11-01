from django.urls import path
from . import views
from .account_saves import account_saves

urlpatterns = [
    path("mobile/items/", account_saves, name="mobile_account_saves"),
    path("save/express/", views.save_express, name="save_express"),
    path("save/emotion/", views.save_emotion, name="save_emotion"),
    path("get/emotion/", views.get_emotion_reflections, name="get_emotion"),
    path("mobile/save/emotion/", views.mobile_save_emotion, name="mobile_save_emotion"),
    path("mobile/get/emotion/", views.mobile_get_emotion_reflections, name="mobile_get_emotion"),
]
