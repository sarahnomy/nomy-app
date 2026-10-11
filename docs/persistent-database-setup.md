# NOMY persistent database setup

The backend falls back to a local SQLite database if DATABASE_URL is absent. On Render that file is disposable: redeploys, restarts and free service spin-downs can remove accounts, mobile sessions, Stories, artwork and subscription ownership. The phone's cached account details do not prove that the server account exists. A login modal cannot restore a deleted database.

The new database guard refuses to start on Render without a PostgreSQL DATABASE_URL. It is prepared locally and must not be deployed until the database is connected. Local development still uses SQLite. Existing psycopg2-binary and dj-database-url dependencies support Postgres; existing migrations create its schema.

Before changing or redeploying the backend:

1. Check whether the existing web service has DATABASE_URL and whether it points to the intended database. Do not expose its value in chat or logs. If a PostgreSQL database already exists, use its Recovery page to investigate available backups rather than creating a replacement.
2. Preserve any remaining production data before changing its storage. The local SQLite files and local backups are development snapshots, not verified backups of TestFlight accounts. Do not import them blindly. If accounts have already disappeared from an ephemeral file and there is no backup, recovery may not be possible.
3. If no persistent database exists, create Render Postgres in the same region as the existing NOMY web service. Select a non-expiring paid database for a live app. Render's Free Postgres expires after 30 days and has no logical backups; it is temporary testing storage.
4. In the database Info/Connections page, copy its Internal Database URL. Set DATABASE_URL on the existing NOMY web service to that entire URL. Keep all other secrets and the web service/API URL intact. DATABASE_URL is a secret, not an EXPO_PUBLIC variable.
5. Use the existing build command: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate . If the current command also creates the admin user, retain that step. Do not flush or recreate the database on deploy.
6. Once the database is connected and any surviving data has been migrated, deploy the guarded backend. No mobile/TestFlight build is required for database connectivity.
7. Create a disposable app account; log in; use a legitimate Nomy+ entitlement to save artwork. Record its presence in Django admin. Restart/redeploy the service and verify the SAME account, session and artwork still exist. Then remove the disposable account. A pre-restart login test alone does not verify persistence.
8. Configure and check PostgreSQL backups. If using a new empty database without recoverable data, users need to register again. Apple subscription ownership may also require reconciliation; do not promise Restore Purchases fixes lost ownership without testing.

References:
- https://render.com/docs/free
- https://render.com/docs/deploy-django
- https://render.com/docs/postgresql-creating-connecting
- https://render.com/docs/postgresql-backups

Prepared validation: four database configuration tests cover local SQLite, missing/blank Render DATABASE_URL, rejected Render SQLite and configured PostgreSQL. Hosted persistence and recovery are not verified until Render configuration is completed.
