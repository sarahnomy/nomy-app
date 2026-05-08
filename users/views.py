import json
from django.utils import timezone

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .forms import UserRegisterForm
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import EmailVerification

def debug_email(request):
    return JsonResponse({
        "EMAIL_HOST": settings.EMAIL_HOST,
        "EMAIL_PORT": settings.EMAIL_PORT,
        "EMAIL_USE_TLS": settings.EMAIL_USE_TLS,
        "EMAIL_HOST_USER": settings.EMAIL_HOST_USER,
        "EMAIL_HOST_PASSWORD_SET": bool(settings.EMAIL_HOST_PASSWORD),
        "DEFAULT_FROM_EMAIL": settings.DEFAULT_FROM_EMAIL,
    })


def send_verification_email(request, user):
    verification = EmailVerification.objects.create(user=user)
    verify_url = request.build_absolute_uri(
        reverse("verify_email", kwargs={"token": str(verification.token)})
    )

    subject = "Verify your nomy email"
    message = (
        f"Hi {user.username},\n\n"
        "Welcome to nomy.\n\n"
        "Please verify your email before logging in:\n"
        f"{verify_url}\n\n"
        "If you didn't create this account, you can ignore this email.\n\n"
        "The nomy team"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def first_form_error(form):
    if form.non_field_errors():
        return form.non_field_errors()[0]

    for errors in form.errors.values():
        if errors:
            return errors[0]

    return "Something went wrong. Please try again."


@csrf_exempt
@require_POST
def mobile_login(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"ok": False, "error": "Invalid request body."}, status=400)

    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        return JsonResponse(
            {"ok": False, "error": "Please enter both your username and password."},
            status=400,
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        try:
            existing_user = UserRegisterForm.Meta.model.objects.get(username__iexact=username)
        except UserRegisterForm.Meta.model.DoesNotExist:
            existing_user = None

        if existing_user is not None and not existing_user.is_active and existing_user.check_password(password):
            return JsonResponse(
                {"ok": False, "error": "Please verify your email before logging in."},
                status=403,
            )

        return JsonResponse(
            {"ok": False, "error": "That username or password doesn't match."},
            status=401,
        )

    login(request, user)
    return JsonResponse(
        {
            "ok": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        }
    )


@csrf_exempt
@require_POST
def mobile_register(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"ok": False, "error": "Invalid request body."}, status=400)

    form = UserRegisterForm(
        {
            "username": payload.get("username", ""),
            "email": payload.get("email", ""),
            "password1": payload.get("password1", ""),
            "password2": payload.get("password2", ""),
        }
    )

    if not form.is_valid():
        return JsonResponse({"ok": False, "error": first_form_error(form)}, status=400)

    user = form.save(commit=False)
    user.is_active = False
    user.save()

    send_verification_email(request, user)

    return JsonResponse(
        {
            "ok": True,
            "message": "Account created. Please verify your email before logging in.",
            "email": user.email,
        },
        status=201,
    )

# Create your views here.
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            send_verification_email(request, user)

            return render(
                request,
                "users/verification-sent.html",
                {"email": user.email, "username": user.username},
            )
        messages.error(request, first_form_error(form))
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})


def verify_email(request, token):
    verification = EmailVerification.objects.filter(token=token).select_related("user").first()

    if verification is None:
        return render(request, "users/verification-result.html", {"verified": False})

    if not verification.is_used:
        verification.used_at = timezone.now()
        verification.save(update_fields=["used_at"])
        verification.user.is_active = True
        verification.user.save(update_fields=["is_active"])

    return render(
        request,
        "users/verification-result.html",
        {"verified": True, "user": verification.user},
    )
