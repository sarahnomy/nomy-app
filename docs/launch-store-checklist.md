# Nomy launch checklist

Last updated: 4 September 2026

## 1. App build setup

- iOS bundle identifier: `com.nomy.app`
- Android package name: `com.nomy.app`
- App version: `1.0.0`
- iOS build number: `1`
- Android version code: `1`
- EAS config: `mobile/eas.json`
- Production API URL: `https://nomy-app-fq92.onrender.com`

Before the first real store build, confirm the bundle/package ID. Changing it later is awkward once builds/users exist.

Useful commands:

```bash
cd mobile
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform all --profile production
npx eas-cli@latest submit --platform ios --profile production
npx eas-cli@latest submit --platform android --profile production
```

## 2. Store compliance

Privacy policy URL:

```text
https://nomy-app-fq92.onrender.com/privacy/
```

Support email:

```text
hello@nomy.app
```

Store listing safety wording:

```text
Nomy is a self-reflection and wellbeing app for late-diagnosed autistic adults. It helps users explore emotional language, check in with themselves, find words for conversations, and use grounding tools.

Nomy is not a medical, diagnostic, therapy, emergency, or crisis service.
```

## Apple App Privacy draft

Likely data types to declare, depending on the final production behaviour:

- Contact info: email address, if account creation is enabled.
- User content: reflections, check-ins, Express text, Emotionize selections.
- Identifiers: user ID/account ID.
- Usage data: app interactions, if stored for profile statistics/avatar state.
- Diagnostics: only if crash/error tooling is added.

Use/purpose:

- App functionality.
- Account management.
- Personalisation/user patterns.
- Customer support, if users contact support.

Do not mark data as sold. Do not claim “no data collected” if account saving or server sync is enabled.

## Google Play Data Safety draft

Likely data collection to declare:

- Personal info: email address/user ID for account login.
- App activity: feature usage and saved activity used for stats/avatar state.
- User-generated content: reflections, check-ins, written Express content, Emotionize answers.

Security statements:

- Data is transmitted over HTTPS.
- Users can request deletion by contacting support.
- Account-based saved data is linked to the user account.
- Local-only data may remain on the device unless the app is deleted or local storage is cleared.

## 4. Safety/privacy positioning

Use:

- self-reflection
- wellbeing
- emotional language
- communication support
- grounding tools
- patterns

Avoid:

- diagnose
- treat
- cure
- therapy replacement
- clinical advice
- crisis support
- emergency support

Required safety line for store copy and in-app policy:

```text
Nomy is not a medical, diagnostic, therapy, emergency, or crisis service.
```
