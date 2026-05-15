# InfiAp HRMS Mobile App

Expo + React Native employee HRMS application for attendance, leave, payroll, profile, and notifications.

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (`npx expo`)
- EAS CLI (`npx eas`)

## Quick Start

```bash
npm install
npm run start
```

## Environment Variables

Create `.env` for local development:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<your-local-ip>:3000/api/v1
```

Production builds require `EXPO_PUBLIC_API_BASE_URL` in EAS environment variables.

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run quality
```

## EAS Build Profiles

- `development`: internal dev client build
- `preview`: internal APK distribution
- `production`: Play Store AAB with auto-increment

Examples:

```bash
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## Auth and Security

- Auth token is stored in `expo-secure-store`
- Session metadata is stored in `AsyncStorage`
- Sign out clears secure token + local session state

## Recommended Repository Hygiene

Keep these generated files out of version control:

- `node_modules/`
- `.expo/`
- `dist/`
- build logs and temp files

## Folder Structure

```txt
app/          Route screens (expo-router)
components/   Reusable UI and layout
context/      App state providers
services/     API and auth services
utils/        Utility helpers
hooks/        Shared hooks
constants/    Static config/constants
```
