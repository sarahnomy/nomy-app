from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class DailyReflection(models.Model):
    user            = models.ForeignKey(User, on_delete=models.CASCADE)
    date            = models.DateField()
    affirmation     = models.TextField(blank=True)
    goal            = models.TextField(blank=True)
    checklist       = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user} – {self.date}"

class EmotionReflection(models.Model):
    user            = models.ForeignKey(User, on_delete=models.CASCADE)
    date            = models.DateField()
    emotion         = models.CharField(max_length=100)
    text            = models.TextField()

    def __str__(self):
        return f"{self.user} – {self.emotion} – {self.date}"

class ExpressReflection(models.Model):
    user            = models.ForeignKey(User, on_delete=models.CASCADE)
    date            = models.DateField()
    text            = models.TextField(blank=True)
    audio           = models.FileField(upload_to="express/", blank=True)

    def __str__(self):
        return f"{self.user} – {self.date}"

class AccountSave(models.Model):
    """Private saves; ownership is always taken from the bearer session."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    kind = models.CharField(max_length=20)
    key = models.CharField(max_length=100)
    data = models.JSONField(default=dict)
    audio = models.BinaryField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['user', 'kind', 'key'], name='unique_account_save')]
        ordering = ['-created_at', '-id']
