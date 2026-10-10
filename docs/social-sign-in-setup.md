# Google and Apple sign-in for NOMY

The app and Django integration are implemented locally. Provider buttons remain hidden until credentials are configured on the backend and the installed app supports them. This feature is not included in TestFlight build 4. Facebook is outside this first implementation.

## Google: create the two iOS release client IDs

1. Open [Google Cloud Console](https://console.cloud.google.com/) using the Google account that should own NOMY's configuration. Create/select a project named NOMY.
2. Open **Google Auth Platform**. Complete its initial setup: app name **NOMY**, support email **hello@nomy.app** (or a selectable email you control), audience **External**, and a developer contact email you control. Use NOMY's real website and privacy policy when Google asks for branding information.
3. Under **Audience**, add the Google accounts that will test the app while the consent configuration is in testing mode. Complete Google's publishing/verification requirements before opening sign-in to everyone.
4. Under **Clients**, create an OAuth client with application type **iOS**, name **NOMY iOS**, bundle ID **com.nomyminds.nomy**. If asked, the Apple team ID is **DWH2QK6KNX** and the App Store ID is **6815977137**. Copy its **Client ID**.
5. Create a second client with application type **Web application**, name **NOMY backend**. Copy its **Client ID**. This native implementation uses it as the ID-token audience; it does not need a web redirect URI or the web client's secret.
6. These two client IDs are public identifiers and can be shared for configuration. Do not share passwords or client secrets.

Configure the app's local environment and its EAS **production** environment with:

```dotenv
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<the iOS client ID>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<the Web application client ID>
```

On the Render backend, set:

```dotenv
GOOGLE_OAUTH_CLIENT_IDS=<the same Web application client ID>
```

`mobile/app.config.js` derives Google's iOS callback URL scheme from the iOS client ID. Set both app variables before building. The backend accepts only the explicitly configured audience. Google is shown on iOS only when Apple sign-in is also enabled and available.

For a future Android release, create Android OAuth clients for package **com.nomy.app** with the SHA-1 fingerprints of its signing certificates. Those clients must be in the same Google project. The implementation requests only the sign-in profile scopes, without offline Google API access. Web social sign-in is not implemented.

Sources: [Google's iOS and backend client setup](https://developers.google.com/identity/sign-in/ios/start-integrating), [React Native Google Sign-In configuration](https://react-native-google-signin.github.io/docs/setting-up/get-config-file).

## Apple: enable the capability and create a private key

1. In [Apple Developer — Identifiers](https://developer.apple.com/account/resources/identifiers/list), select **com.nomyminds.nomy** and enable **Sign in with Apple** as a primary App ID.
2. In **Keys**, create a Sign in with Apple key, configuring it for that App ID. Download the `.p8` private key and keep it in secure storage; Apple only provides the download once.
3. Add the following to the Render backend environment. The private key belongs on Render, never in the Expo app, `EXPO_PUBLIC_*`, git, or this chat:

```dotenv
APPLE_SIGN_IN_CLIENT_ID=com.nomyminds.nomy
APPLE_SIGN_IN_TEAM_ID=DWH2QK6KNX
APPLE_SIGN_IN_KEY_ID=<the ID of the new Sign in with Apple key>
APPLE_SIGN_IN_PRIVATE_KEY=<complete contents of the downloaded .p8 file>
```

The backend supports either actual newlines or literal `\n` in the private key variable. The existing EAS App Store Connect upload key is a different key; do not reuse it for Sign in with Apple.

`mobile/app.json` enables the Apple capability and config plugin. The next signed iOS build must get a provisioning profile with this capability. The EAS credentials workflow may require Apple Developer sign-in to regenerate that profile.

Apple is unavailable in this app's Expo Go flow because Expo Go uses different app identifiers. Test on a real iPhone with a development build or TestFlight. No Apple web Services ID is needed for this native iOS implementation.

Source: [Apple's key setup](https://developer.apple.com/help/account/capabilities/create-a-sign-in-with-apple-private-key/), [Expo Apple authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/).

## Deploy and verify before the next TestFlight submission

1. Deploy the backend code and requirements, including `PyJWT[crypto]`, and run `python manage.py migrate`. Render's existing `build.sh` already installs requirements and applies migrations.
2. Configure the backend credentials above. `GET /api/mobile/social/providers/` should report the configured providers. Apple readiness currently checks that credentials are present, not that Apple has accepted the key.
3. Configure the two Google client IDs in EAS production and locally. Rebuild iOS; changing these values after building does not update an installed app.
4. On a real iPhone, test each provider: new account, logout and return login, cancellation, and deletion. Check that returning Apple users work when Apple no longer supplies an email.
5. Test selecting a different provider account during deletion: it must refuse to delete the original NOMY account. Test deletion during a provider/network failure: the account must remain.
6. Confirm Google revocation on the device and Apple revocation in the Apple account's connected-app settings. Apple revocation is performed before server-side deletion. Google revocation runs on the device after successful deletion; if it fails, the deletion still succeeds and the grant may need removal in Google account settings.
7. Review privacy disclosures for the new sign-in providers, then build and submit the configured release to TestFlight.

Existing password accounts keep working. Matching email addresses do not automatically link accounts. When a provider's verified email matches an existing password account, the app asks the user to use their existing credentials; explicit account linking is not implemented.

Provider identity tokens and Apple authorization codes are transient request data and are not stored in AsyncStorage or the database. The app stores only its existing NOMY account details plus the sign-in provider. Challenges expire after five minutes and can be consumed once. The backend validates token signature, issuer, audience and expiry; Apple additionally binds the token to a challenge nonce. Google's native SDK does not expose an equivalent nonce parameter, so Google uses standard verified ID-token authentication.

Local checks:

```sh
python manage.py test users --noinput
cd mobile
npx tsc --noEmit
npx eslint constants/social-auth.ts components/social-sign-in.tsx app/login.tsx app/register.tsx app/settings.tsx app.config.js
```
