from django.db import models
from django.conf import settings
import uuid


class Story(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    body = models.TextField()
    appearance = models.CharField(max_length=16, choices=[("anonymous", "Anonymous"), ("display-name", "Display name")])
    display_name = models.CharField(max_length=60, blank=True)
    status = models.CharField(max_length=16, default="pending", choices=[("pending", "In review"), ("published", "Published"), ("rejected", "Rejected")])
    created_at = models.DateTimeField(auto_now_add=True)
    client_id = models.UUIDField(default=uuid.uuid4)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["author", "client_id"], name="unique_story_submission")]


class StoryReport(models.Model):
    REASONS = [("harassment", "Harassment or bullying"), ("hate", "Hate or discrimination"),
               ("sexual", "Sexual content"), ("violence", "Violence or threats"),
               ("privacy", "Personal information"), ("spam", "Spam or misleading content"), ("other", "Other")]
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name="reports")
    reason = models.CharField(max_length=16, choices=REASONS)
    details = models.CharField(max_length=1000, blank=True)
    reviewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["reporter", "story"], name="unique_story_report")]


class UserBlock(models.Model):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_created")
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_received")
    label = models.CharField(max_length=60, default="Community member")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["blocker", "blocked"], name="unique_user_block"),
                       models.CheckConstraint(condition=~models.Q(blocker=models.F("blocked")), name="cannot_block_self")]
