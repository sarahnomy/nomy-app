# NOMY App Review release guide

## Status and validation boundaries

Implementation is local. This change has not been deployed to Render or included in TestFlight build 4. StoreKit transactions, native iOS signing/build compatibility, and the complete flow on a real iPhone still require the configuration and device checks below. Automated tests mock Apple subscription status responses; an exported iOS JavaScript bundle is not a signed native build or an App Review approval.

The app keeps Django, the existing database, Expo Router, username/password login, and the original free support flows. The open-source `expo-iap` native module calls Apple's StoreKit directly; Django uses Apple's official `app-store-server-library` to verify signed transactions and call the App Store Server API. No subscription service account is required; all iOS payments use Apple In-App Purchase. No payment links or external checkout unlock iOS features.

## Changes

- Nomy+ now loads the two configured Apple subscription products and localized StoreKit prices. It has monthly/yearly purchase buttons, Restore Purchases, refresh, Apple subscription management, and links to terms, privacy and Apple's standard EULA.
- Verified Plus access unlocks the full Emotionize library, Express AI usage without the free quota, Check-in Reflections and Weekly Overview, and Toolkit activities. Sensory, Movement and Creative now have usable activities alongside the existing Breathing and Puzzles screens.
- Subscription access is linked to an opaque account-specific purchases ID. Django verifies Apple's signed transaction, checks its app/product/account identity, and fetches its current Apple subscription status; client premium flags cannot grant access. Approved StoreKit purchases unlock immediately when backend verification succeeds. If Apple succeeds but verification is temporarily unavailable, the app reports processing rather than a failed charge. Cancelled and pending purchases do not grant new access. Pending approval is picked up by StoreKit transaction updates, foreground refresh or Restore Purchases.
- Verified entitlements are cached per account with their expiration, refreshed on launch/foreground, and cleared immediately on logout/account change. The backend handles expiry, refunds, billing grace, and cryptographically verified Apple Server Notifications V2 by fetching current status; repeated or out-of-order notifications do not directly grant access. Cached access permits already verified local features offline until expiry; paid backend operations still require server verification.
- Stories are now submitted to Django and stored in the database, with chosen display names or anonymous presentation. Submissions require community guidelines acceptance and are reviewed before publication. A client UUID prevents duplicate submissions when a request is retried. The original bundled stories remain, labelled as NOMY examples.
- Story submission is available to logged-in free users so the requested review flow can create a Story before purchasing. This intentionally changes the old comparison screen's proposed 'submission requires Plus' tier. The paywall reflects the implemented benefits rather than promising a paid Story library that did not exist.
- Published user Stories and their author pages have Report Story and Block User actions. Reports include a selected reason and optional details, persist in Django, and are unique per reporter/Story. Success and already-reported confirmations are distinct.
- Blocking requires confirmation, persists on the server, and filters feed, saved/resonated retrieval, Story detail and author pages. No notification is sent to blocked authors. Settings → Privacy · Blocked accounts lists authors and supports unblocking. Anonymous authors are not displayed with their account usernames.
- Django admin now lists pending Stories and reports, supports publication/rejection, and supports marking reports reviewed. All submissions are held for human review, so unreviewed harmful content is not published automatically.
- Login/registration/social login now issue hashed, expiring mobile bearer sessions. Tokens are stored in iOS SecureStore, separately from nonsensitive account details. Cookies or a supplied user ID cannot authorize reports, blocks, purchases or reflection synchronization. Mobile sessions expire after 30 days; users then log in again. Existing installed users must log out/log in after backend deployment to obtain the new credentials.
- Express keeps its legacy free flow for older builds, but user-ID-only requests cannot claim premium/staff access. Reflection sync now requires a real session; existing local reflections remain available if sync cannot run.
- Account deletion is atomic: it removes the account and related personal rows, invalidates all mobile/web sessions, and ends the app session. Incorrect credentials or backend failure preserve the account and return an understandable error. Apple subscription associations are deleted with the account. Account audio is cleaned up after commit; transient failures remain in a retry queue. The app clears local reflections, saved Stories, voice files, account preferences and entitlement caches, while retaining intro/demo completion. A device cleanup error is disclosed without misreporting the already-deleted account as still active.
- Apple social deletion verifies a new provider confirmation and revokes Apple access. Google social deletion verifies the connected identity. Social login still depends on the separate provider setup guide.
- Terms and both privacy-policy source copies describe subscriptions, reporting, blocking and in-app deletion. Those privacy sources must actually be deployed to the public policy URL.

## App Store Connect: exact manual configuration

Open [NOMY in App Store Connect](https://appstoreconnect.apple.com/apps/6815977137).

1. Confirm the app record uses bundle ID **com.nomyminds.nomy** and Apple team **DWH2QK6KNX**. The Account Holder must accept the Paid Apps Agreement and complete banking/tax requirements under Business before StoreKit can return purchasable products.
2. Open **Monetization → Subscriptions** and create one subscription group named **Nomy+**. Add a localization for the group, such as English (UK), display name **Nomy+**.
3. Add these two **auto-renewable subscriptions** in that same group:

| Reference name | Product ID (exact) | Duration | Suggested display name | Suggested initial UK price |
| --- | --- | --- | --- | --- |
| Nomy+ Monthly | `com.nomyminds.nomy.plus.monthly` | 1 month | Nomy+ Monthly | £4.99 |
| Nomy+ Yearly | `com.nomyminds.nomy.plus.yearly` | 1 year | Nomy+ Yearly | £39.99 |

The price suggestions preserve the old comparison screen's proposal; choose and save the actual prices in Apple. The app always displays StoreKit's localized price, never a hard-coded price.

4. Put both products at the same subscription service level because they unlock identical features. Monthly/yearly are alternative durations, not separate feature tiers. Select the territories where they should be available. Do not add free-trial/introductory offers unless you also review the paywall copy for those terms; this release does not advertise offers.
5. Add each product's localization: display name as above, and description such as **Premium stories, tools and unlimited Express AI** (47 characters). Fill in every required field, pricing and availability section.
6. Upload a subscription review screenshot showing the real Nomy+ paywall from the configured build. In review notes explain **Settings → Membership → Nomy+**, the listed benefits, Restore Purchases, and that sandbox purchases unlock the same access as production. Reach **Ready to Submit** with no missing metadata.
7. Generate an **In-App Purchase key** under **Users and Access → Integrations → In-App Purchase**. Download its `.p8` once, and record its Key ID and Issuer ID. Store the private key in the backend's protected environment configuration using the variables below. This is distinct from the EAS submission API key and the Sign in with Apple key. Do not paste the private key into chat, commit it, or embed it in the mobile app.
8. This StoreKit 2 integration does **not** require an app-specific shared secret or any RevenueCat account/key.
9. In NOMY's **App Information → App Store Server Notifications**, set **both production and sandbox URLs** to `https://nomy-app-fq92.onrender.com/api/mobile/subscription/webhook/`, selecting **Version 2**. The backend authenticates notifications using Apple's signatures and bundled Apple root certificates, not a shared webhook password. Deploy the backend before testing delivery.
10. Create a sandbox tester under **Users and Access → Sandbox** for controlled renewal/refund/approval testing. Ordinary TestFlight purchases already use Apple's sandbox and do not create a real charge. On current iOS, advanced sandbox controls are under **Settings → Developer → Sandbox Apple Account**; consult Apple's current instructions before switching Media & Purchases accounts.
11. Update App Privacy answers to reflect linked account identifiers, purchase history, user-submitted Stories/reflections and moderation data. Apple receives an opaque NOMY app-account token. NOMY's backend stores original transaction identifiers and verified subscription status; no card details are sent to NOMY. Check the current SDK privacy disclosures rather than marking data as uncollected.
12. Provide a working public privacy-policy URL, support URL and support email. Deploy the updated policy to **https://nomy-app.com/privacy/**. The paywall links that URL and Apple's standard EULA. If using the standard EULA, include its URL in the app description as appropriate; if choosing a custom EULA, configure that in App Store Connect and update the app link.
13. For the first auto-renewable subscriptions, attach both products to the **In-App Purchases and Subscriptions** section of the app version and submit them **with a new app version/build**. An EAS upload to TestFlight does not submit subscriptions or the app for App Review. Use a marketing version above the currently released App Store version if necessary; do not reuse a version already released.

Primary references: [Apple's configuration overview](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/), [first IAP submission](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/), [sandbox product availability](https://developer.apple.com/documentation/technotes/tn3186-troubleshooting-in-app-purchases-availability-in-the-sandbox).

## Direct Apple verification and account ownership

- The backend validates the transaction's Apple certificate chain, signature, bundle ID, environment, product, subscription type and `appAccountToken`. The token is the account's existing opaque purchases UUID. It then calls **Get All Subscription Statuses** using the verified original transaction ID; a replayed old purchase cannot override current expiry/refund status.
- Production and genuine Apple sandbox transactions are supported. `APPLE_IAP_ALLOW_SANDBOX=True` is required for TestFlight/App Review. Locally generated Xcode StoreKit test receipts are not accepted as Apple-signed server purchases.
- New and restored subscriptions remain linked to the **same NOMY account used for the purchase**. Reinstallation works after signing into that NOMY account and the same Apple account. Restoring while signed into another NOMY account shows an understandable error and does not duplicate/transfer access. No automatic account transfer or Family Sharing entitlement is implemented; leave Family Sharing disabled for these products.
- Account deletion removes the NOMY account, purchases token and subscription association. It does not cancel Apple's billing. Cancel through Apple before deleting. Creating a new NOMY account does not recover an old deleted account's subscription; account transfer needs a separate verified support process and is outside this release.
- StoreKit transactions are finished only after server verification/persistence. A network failure leaves a transaction unfinished for redelivery and shows processing. Pending purchases grant nothing until Apple delivers approval. Cancelling automatic renewal does not end already-paid access; Apple status/expiry/refund/grace determine access.
- Signature verification uses Apple's public G2/G3 root certificates in `users/apple_certificates/`, with Apple's online certificate checks enabled. The server needs outbound HTTPS access to Apple API and certificate-status endpoints. Keep those certificates shipped with the deployment.
- Duplicate/out-of-order notifications re-fetch current status. Notifications for deleted/unrecognised purchase associations are acknowledged without recreating an account. Genuine Apple `TEST` notifications are signature-verified and acknowledged.

References: [Apple's official Python verification library](https://github.com/apple/app-store-server-library-python), [Get All Subscription Statuses](https://developer.apple.com/documentation/appstoreserverapi/get-all-subscription-statuses), [generate purchase keys](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/generate-keys-for-in-app-purchases/), [notification URLs](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/enter-server-urls-for-app-store-server-notifications/).

## Environment variables and secrets

| Location | Variable | Value |
| --- | --- | --- |
| EAS production (already configured) | `EXPO_PUBLIC_API_BASE_URL` | `https://nomy-app-fq92.onrender.com` |
| Render backend only | `APPLE_IAP_KEY_ID` | Key ID of the Apple In-App Purchase key |
| Render backend only | `APPLE_IAP_ISSUER_ID` | Issuer ID from Apple's In-App Purchase integrations page |
| Render backend only | `APPLE_IAP_PRIVATE_KEY` | Complete contents of the downloaded `.p8`, including BEGIN/END lines; actual newlines or literal `\n` separators are supported |
| Render backend | `APPLE_IAP_ALLOW_SANDBOX` | `True` for TestFlight/App Review; default `True` |
| Render production | `DJANGO_SECRET_KEY` | Existing stable random production secret |
| Render production | `DEBUG` | `False` |
| Render backend | `DATABASE_URL` | Existing persistent production database |

The bundle ID **com.nomyminds.nomy**, App Store ID **6815977137** and both product IDs are fixed in the code. No Apple payment secret belongs in any `EXPO_PUBLIC_*` variable. No public purchase SDK key or RevenueCat environment variable is needed. If you previously added unused RevenueCat keys, remove them after switching to this build.

Google/Apple login variables remain separately documented in [social-sign-in-setup.md](social-sign-in-setup.md). Leave those providers unconfigured/hidden until their credentials and device tests are complete; username/password registration/login works independently.

## Backend deployment and migrations

Deploy the repository changes and current `requirements.txt` to Render using the project's existing deployment workflow. The `build.sh` already installs dependencies, collects static assets and applies migrations. This task did not push your uncommitted work or deploy it.

The local SQLite database was backed up to `/private/tmp/nomy-before-app-review-migrations.sqlite3` (owner-only permissions) and migrated. Its pre-existing `express/0001_initial` migration was unapplied: Django deletion can fail when the cascade collector queries that missing table. Registration, authenticated Story submission, deletion and token invalidation were then verified against the migrated local database using a temporary diagnostic account, which was removed. This proves the local fix, not the schema or deployment state of Render. Apply all migrations on Render as well.

Required migrations:

- `express/0001_initial.py`: existing Express usage table; ensure this earlier migration is applied.
- `core/0001_initial.py`: Stories, moderation reports, blocking and uniqueness/self-block constraints.
- `users/0002_socialauthchallenge_socialidentity.py`: prior local social-login work, if not already deployed.
- `users/0003_accountprofile_mobilesession_subscriptionentitlement.py`: stable public/purchases IDs, hashed mobile sessions, persisted verified entitlements.
- `users/0004_accountcleanuptask.py`: post-deletion audio cleanup retry queue (historical migration retains the previous integration choice).
- `users/0005_alter_accountcleanuptask_kind_applesubscription.py`: direct Apple subscription ownership table and audio-only cleanup choices. Apply this migration before running the new code, including before testing deletion. It was applied locally after an owner-only backup at `/private/tmp/nomy-before-direct-apple.sqlite3`; hosted deployment is still pending.

Run:

```sh
pip install -r requirements.txt
python manage.py migrate
python manage.py check
```

Configure a recurring job using the same production database, storage and secrets:

```sh
python manage.py cleanup_deleted_accounts
```

For example, run it every 15 minutes to retry audio deletion after temporary service failures. Successful tasks are removed; failed tasks retain an attempt count for monitoring. The default filesystem storage must be persistent/shared with this job if deployed in separate processes. A Render ephemeral filesystem is not suitable for retaining uploaded audio. The storage used by the cleanup worker must be the storage used for `ExpressReflection.audio`.

Django admin at **/admin/** is the moderation console. Give the moderator Story and StoryReport permissions. Review pending Stories, then publish or reject them. Inspect unreviewed reports, remove/reject offending Stories as appropriate, and mark reports reviewed. Set a real moderation response process and keep **hello@nomy.app** monitored. Code cannot substitute for operational moderation.

## Exact TestFlight release and full-flow test

1. Complete Apple subscription/key/notification configuration. Deploy/migrate the backend. Confirm the public privacy page is updated. Log out/log in in existing installations to issue the new mobile credentials.
2. Confirm EAS's **production** API URL points to the updated backend. No payment SDK key is needed. From `mobile`, run the local checks below, then the existing release command:

   ```sh
   npm run test:unit
   npx tsc --noEmit
   npm run testflight
   ```

   EAS builds a signed production iOS binary and increments build number 4 to the next unused number. If another build has consumed that number, check EAS/App Store Connect and update the local build number before building. A new Apple capability/profile from the earlier social work may require the existing Apple credentials workflow. Do not claim native build success until EAS actually finishes.
3. Wait for Apple processing, enable the build for your tester group under [NOMY TestFlight](https://appstoreconnect.apple.com/apps/6815977137/testflight/ios), and install **that new build** on a real iPhone. Expo Go and the old build 4 cannot verify these StoreKit changes. External TestFlight groups may need beta review.
4. Before testing, register a separate ordinary **author** account in the app. Submit one safe Story, and have a moderator publish it in Django admin. Use a real ordinary account rather than a fake privileged review identity. This gives the reviewing **reader** another user's content to report/block.
5. Launch from a fresh installation; register the reader account. Confirm it becomes usable immediately. Log out, then log in with the same username/password. No email-verification step is required by the current mobile registration path.
6. Use free core flows: free Emotionize feeling, Express non-AI/available free AI support, Morning/Evening Check-in, and the free Toolkit activity. Confirm existing saved activity/reflections remain usable.
7. Open Stories and read the published author's Story. Open its author page. Submit a Story from the reader account, accept guidelines, and verify it appears under **Written → In review**. Verify the Story row exists in Django admin. It must not be public until a moderator publishes it.
8. On the other author's published Story, choose **Report story**, select a reason and submit. Check the confirmation and verify the report in Django admin. Report again and verify there is only one report row and an already-reported confirmation. Logged-out requests must fail without saving a report.
9. Choose **Block user** and confirm. Verify the author's content disappears from feed/saved/resonated views and direct detail/profile access is unavailable for this reader. In Settings → Privacy · Blocked accounts, confirm the author is listed and unblock them; confirm the content returns. On the author's account, verify no block notification or blocker list is exposed.
10. Go to **Settings → Membership → Nomy+**. Confirm both products and localized prices load. Cancel the Apple purchase sheet once: no new Plus access or charge. Purchase the monthly product in the TestFlight sandbox. Confirm the Apple sheet is sandbox and Django's `AppleSubscription.environment` is `Sandbox`; this must be a genuine Apple transaction without a real charge.
11. After confirmation, verify **Nomy+ is active** and open a previously locked Emotionize feeling, Check-in Reflections and Weekly Overview, and Sensory/Movement/Creative Toolkit. Confirm Express AI support is no longer limited by the free quota. Check Django's entitlement for the same purchases ID.
12. Force-close and reopen NOMY; confirm access survives for the same account. Tap **Restore Purchases** and confirm active access returns without starting a new purchase. Also test reinstall → log in → Restore Purchases with the same Apple account. Test a different NOMY account to ensure paid access is not copied merely from another account's local cache; Restore must show that the subscription belongs to another NOMY account; the original account must retain its entitlement.
13. Use the sandbox account controls to exercise pending approval, renewal, expiration and refund where supported. Confirm pending doesn't grant access before approval; SDK/foreground refresh picks up approval; a cancelled auto-renewal retains paid access until expiry; expired/refunded access is removed. Test temporary backend/network failure: report/block cannot show success without a server response, and a completed Apple purchase reports verification-in-progress rather than asking for another charge.
14. Cancel the test subscription through Apple management if desired **before deleting the test NOMY account**. Deletion does not cancel Apple renewal. For a live App Store installation, never use the purchase step as a no-charge test; only TestFlight/sandbox qualifies.
15. In Settings → Delete account, confirm with the reader's password. Check the logged-out/welcome state and that back navigation cannot reveal authenticated reader screens. Relaunch; confirm the session/entitlement is cleared. In Django verify removal of reader account, Stories, reflections, reports, blocks and mobile sessions. Verify old credentials and all previous session tokens fail. Review cleanup tasks and ensure audio cleanup finishes. Retry with an incorrect password/network outage on another test account and confirm that account survives with a clear error.
16. Save a screen recording and your observed results. Once all device checks pass, select the completed subscriptions and the new build on the App Store version, enter App Review notes and ordinary review account credentials if requested, and submit for review. Do not use the moderator account as the review login.

Suggested review note: "Nomy+ uses Apple In-App Purchase. Open Settings → Membership for monthly/yearly subscriptions and Restore Purchases. Valid sandbox purchases unlock the Emotionize library, Express support, Check-in history/insights and full Toolkit. Community Story submissions are reviewed before publication. Published user Stories and author pages provide Report and Block actions; blocked accounts can be managed in Settings. Delete Account is in Settings. Registration creates an immediately usable ordinary account."

## Automated checks and their limits

```sh
python manage.py test --noinput
python manage.py makemigrations --check --dry-run
cd mobile
npm run test:unit
npx tsc --noEmit
npx expo export --platform ios --output-dir /tmp/nomy-app-review-ios-export
```

Backend tests cover authenticated moderation, duplicate submissions/reports, blocked feed/detail/author access, account ownership, authoritative Apple subscription entitlements, expiry/refunds/grace, Apple signature verification and replay-safe notification handling, deletion failure rollback, all-device session invalidation and retryable external cleanup. SDK-adapter tests cover purchase outcomes, delayed verification, restore, account switching, approval updates, offline cached expiry and the session cleanup path.

Current automated result: **57 backend tests** and **25 mobile adapter/session tests** pass; TypeScript and lint of the changed app modules pass. Direct Apple iOS, Android and web bundle exports succeed. An isolated iOS native prebuild succeeds. Native compilation/signing and physical-device StoreKit purchases remain unverified; no signed TestFlight build has been produced for this revision.

Real StoreKit sheets, Apple signing, product availability, sandbox receipts, hosted backend configuration and the complete physical-device TestFlight sequence are **not** certified by those tests. They remain a release gate until the steps above are actually performed.

## Confirm Apple notification delivery

After deploying and setting the Apple variables, request a signed Apple test notification:

```sh
python manage.py test_apple_notifications --environment Sandbox
python manage.py test_apple_notifications --environment Production
```

Each command returns a test notification token. Check Apple's delivery result:

```sh
python manage.py test_apple_notifications --environment Sandbox --token TOKEN_FROM_PREVIOUS_COMMAND
```

Check backend request logs for HTTP 200 at the notification endpoint, then exercise actual renewal/expiry/refund events with the sandbox device. A GET request or a fabricated notification is not a valid delivery test.
