import logging

from django.contrib.sessions.models import Session
from django.core.files.storage import default_storage
from django.db import transaction
from django.utils import timezone

from reflections.models import ExpressReflection
from .models import SocialAuthChallenge, AccountCleanupTask

logger = logging.getLogger(__name__)


def delete_account_data(user):
    """Call inside an atomic transaction; all user-owned rows cascade."""
    audio_files = [entry.audio.name for entry in
                   ExpressReflection.objects.filter(user=user).exclude(audio="")]
    user_id = user.pk
    SocialAuthChallenge.objects.filter(user_id_to_delete=user_id).delete()
    tasks = [AccountCleanupTask.objects.create(kind="audio", target=name).pk for name in audio_files]
    # Delete every web session for this user, not just the requesting device's session.
    for session in Session.objects.filter(expire_date__gt=timezone.now()).iterator():
        if str(session.get_decoded().get("_auth_user_id")) == str(user_id):
            session.delete()
    user.delete()

    transaction.on_commit(lambda: run_cleanup_tasks(tasks), robust=True)


def run_cleanup_tasks(task_ids=None):
    from django.db.models import F
    tasks = AccountCleanupTask.objects.all()
    if task_ids is not None:
        tasks = tasks.filter(pk__in=task_ids)
    for task in tasks.iterator():
        try:
            if task.kind == "audio":
                default_storage.delete(task.target)
            else:
                # Preserve unknown legacy tasks for manual review instead of discarding them.
                continue
            task.delete()
        except Exception:
            AccountCleanupTask.objects.filter(pk=task.pk).update(attempts=F("attempts") + 1)
            logger.exception("Account cleanup task failed; queued for retry")
