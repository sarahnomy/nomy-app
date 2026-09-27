from django.conf import settings
from django.db import models


class ExpressAIUsage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="express_ai_usages")
    flow_id = models.CharField(max_length=80)
    used_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    model = models.CharField(max_length=80, blank=True)
    request_count = models.PositiveIntegerField(default=1)
    input_tokens = models.PositiveIntegerField(default=0)
    output_tokens = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-used_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "flow_id"], name="unique_express_ai_flow_per_user"),
        ]
        indexes = [
            models.Index(fields=["user", "used_at"]),
        ]

    def __str__(self):
        return f"{self.user} used Express AI at {self.used_at:%Y-%m-%d %H:%M}"
