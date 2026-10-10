from appstoreserverlibrary.api_client import AppStoreServerAPIClient, APIException
from appstoreserverlibrary.models.Environment import Environment
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
import requests

from users.subscriptions import apple_configured


class Command(BaseCommand):
    help = 'Request an Apple-signed server test notification or inspect its delivery status.'

    def add_arguments(self, parser):
        parser.add_argument('--environment', choices=['Sandbox', 'Production'], required=True)
        parser.add_argument('--token', help='Test notification token returned by a previous request')

    def handle(self, *args, **options):
        if not apple_configured():
            raise CommandError('Configure APPLE_IAP_KEY_ID, APPLE_IAP_ISSUER_ID and APPLE_IAP_PRIVATE_KEY first.')
        client = AppStoreServerAPIClient(settings.APPLE_IAP_PRIVATE_KEY.encode(), settings.APPLE_IAP_KEY_ID,
            settings.APPLE_IAP_ISSUER_ID, settings.APPLE_IAP_BUNDLE_ID, Environment(options['environment']))
        try:
            if options['token']:
                response = client.get_test_notification_status(options['token'])
                for attempt in response.sendAttempts or []:
                    self.stdout.write(str(attempt))
            else:
                response = client.request_test_notification()
                self.stdout.write('Test notification token: ' + str(response.testNotificationToken))
        except (APIException, requests.RequestException, ValueError) as error:
            # Do not include credential material or Apple's signed payload in command output.
            raise CommandError('Apple notification request failed. Check key configuration and network access.') from error
