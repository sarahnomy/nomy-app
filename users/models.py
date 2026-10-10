from django.db import models
from django.contrib.auth.models import User
import uuid


class MobileSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mobile_sessions")
    token_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()


class AccountProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="mobile_profile")
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    purchases_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)


class SubscriptionEntitlement(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    active = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True)
    product_id = models.CharField(max_length=200, blank=True)
    verified_at = models.DateTimeField(null=True)


class AppleSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="apple_subscriptions")
    original_transaction_id = models.CharField(max_length=100)
    environment = models.CharField(max_length=16, choices=[("Production", "Production"), ("Sandbox", "Sandbox")])

    class Meta:
        constraints = [models.UniqueConstraint(fields=["environment", "original_transaction_id"], name="unique_apple_subscription")]


class AccountCleanupTask(models.Model):
    kind = models.CharField(max_length=16, choices=[("audio", "Audio file")])
    target = models.CharField(max_length=500)
    attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class SocialIdentity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="social_identities")
    provider = models.CharField(max_length=16, choices=[("google", "Google"), ("apple", "Apple")])
    subject = models.CharField(max_length=255)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["provider", "subject"], name="unique_social_identity")]


class SocialAuthChallenge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nonce = models.CharField(max_length=128)
    provider = models.CharField(max_length=16)
    purpose = models.CharField(max_length=16)
    user_id_to_delete = models.PositiveBigIntegerField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True)


class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_verifications")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def is_used(self):
        return self.used_at is not None

    def __str__(self):
        return f"EmailVerification(user={self.user.username}, used={self.is_used})"
