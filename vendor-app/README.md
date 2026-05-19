# Servora — vendor app

React Native + Expo SDK 51 vendor (service provider) app for Servora. Mirrors Mileora's `guide-app/` in stack and structure.

## Stack

- **Expo SDK 51** + **Expo Router** (file-based routes under `app/`)
- **NativeWind v4** for styling (Tailwind classes via `className`)
- **TanStack Query** for data fetching
- **react-hook-form** + **zod** (shared schemas from `@servora/shared`)
- **lucide-react-native** for icons

## Run

```powershell
npm install
npm run start              # Expo dev server
npm run android            # open Android emulator
npm run ios                # open iOS simulator (macOS only)
```

API base URL auto-selects:
- Android emulator → `http://10.0.2.2/Servora/api/index.php/api`
- iOS / web        → `http://localhost/Servora/api/index.php/api`

Override via `app.json` → `expo.extra.apiBaseUrl`.

## Folder layout

```
vendor-app/
├── app/                      # Expo Router routes
│   ├── _layout.tsx           # Stack + QueryClient + SafeAreaProvider
│   ├── (tabs)/               # Bottom tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx          Dashboard (KPIs + upcoming bookings)
│   │   ├── bookings.tsx       Bookings with status filters
│   │   ├── services.tsx       My services + toggle active
│   │   ├── earnings.tsx       Revenue, payouts, request withdrawal
│   │   └── profile.tsx        Business profile, availability switch, sign out
│   ├── booking/[id].tsx       Booking detail with accept/reject/start/complete/collect-cash
│   ├── chat/[threadId].tsx    Customer chat thread (5s polling)
│   ├── login.tsx              Phone OTP sign-in
│   └── onboarding.tsx         New-vendor onboarding flow (stub — wire to existing /vendor/onboarding/* API)
├── src/
│   ├── lib/
│   │   ├── api.ts             Fetch wrapper with JWT/X-Auth-Token
│   │   ├── format.ts          formatINR helper
│   │   └── queries.ts         TanStack hooks (dashboard, bookings, services, earnings, profile, chat, auth)
│   ├── screens/   (legacy bare-RN screens — kept until each is ported)
│   ├── navigation/, services/, theme/, types/   (legacy)
└── package.json, app.json, babel.config.js, metro.config.js, tailwind.config.js, global.css, tsconfig.json
```

The legacy `src/screens/auth/*`, `src/screens/bookings/*`, etc. are kept as reference for forms and edge cases not yet wired into the new app/ tree (KYC docs upload, bank details form, service create wizard). Port them incrementally; delete once `app/` covers everything.

## Add a route

Drop a `.tsx` file under `app/` — the path becomes the route. Brackets denote params: `app/booking/[id].tsx` → `/booking/<id>`.

## Add a query

Add to `src/lib/queries.ts` and consume from `app/*.tsx`. Mutations invalidate via `useQueryClient()` so dependent screens re-fetch.

## Build a release APK

`vendor-app/` doesn't yet have a committed `android/` (Expo prebuild generates it). When you're ready:

```powershell
npx expo prebuild
cd android
./gradlew assembleRelease
```

For Play Store, use `bundleRelease` and AAB output.

## Differences from `mobile/`

| Concern | mobile/ (customer) | vendor-app/ (provider) |
|---|---|---|
| Auth storage key | `@servora:auth_token` | `@servora-vendor:auth_token` (independent session) |
| Default tabs | Home / Browse / Bookings / Account | Dashboard / Bookings / Services / Earnings / Profile |
| Auth required | Public browse + login | Login-gated |
| Payment role | Pays for service | Receives payouts |
| Booking actions | Create + cancel | Accept / reject / start / complete / collect cash |
