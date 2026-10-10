from django.core.management.base import BaseCommand
from users.deletion import run_cleanup_tasks
from users.models import AccountCleanupTask


class Command(BaseCommand):
    help = "Retry file and purchase-service cleanup for deleted accounts."

    def handle(self, *args, **options):
        run_cleanup_tasks()
        self.stdout.write(f"Pending cleanup tasks: {AccountCleanupTask.objects.count()}")
