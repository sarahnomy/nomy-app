from django.db import models
from django.contrib.auth.models import User
import uuid


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
