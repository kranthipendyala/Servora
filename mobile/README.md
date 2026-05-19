# Servora — mobile (customer)

React Native + Expo SDK 51 customer app for Servora.

## Stack

- **Expo SDK 51** + **Expo Router** (file-based routes under `app/`)
- **NativeWind v4** for styling (Tailwind classes via `className`)
- **TanStack Query** for data fetching
- **react-hook-form** + **zod** (shared schemas from `@servora/shared`)
- **expo-router** typed routes
- **expo-location** for geolocation
- **react-native-razorpay** for payments
- **lucide-react-native** for icons

## Run

```powershell
npm install
npm run start              # Expo dev server
npm run android            # open Android emulator
npm run ios                # open iOS simulator (macOS only)
```

API base URL is auto-selected:
- Android emulator → `http://10.0.2.2/Servora/api/index.php/api`
- iOS / web        → `http://localhost/Servora/api/index.php/api`

Override via `app.json` → `expo.extra.apiBaseUrl`.

## Folder layout

```
mobile/
├── app/                # Expo Router routes (file-based)
│   ├── _layout.tsx     # Root stack + QueryClient + SafeAreaProvider
│   ├── (tabs)/         # Bottom-tab group
│   │   ├── _layout.tsx
│   │   ├── index.tsx        Home
│   │   ├── categories.tsx   Browse all services
│   │   ├── bookings.tsx     My bookings
│   │   └── account.tsx      Profile + sign in/out
│   ├── business/[slug].tsx  Vendor detail
│   ├── category/[slug].tsx  Filtered listing
│   ├── booking/[id].tsx     Booking detail
│   ├── search.tsx           Live search
│   └── login.tsx            Phone OTP sign-in
├── src/
│   ├── lib/
│   │   ├── api.ts           Fetch wrapper + token auth
│   │   └── queries.ts       TanStack Query hooks
│   ├── components/   (kept from bare-RN era — pre-NativeWind)
│   ├── screens/      (legacy screens — not wired to Expo Router; reference only)
│   ├── navigation/   (legacy React Navigation setup — unused)
│   ├── services/api.ts      legacy API client — kept while migration finishes
│   ├── theme/, types/       legacy
├── android/                 Native Android build (`./gradlew assembleRelease`)
├── app.json, babel.config.js, metro.config.js, tailwind.config.js, global.css
└── package.json
```

`src/screens/`, `src/navigation/`, `src/services/`, `src/components/`, `src/theme/`, `src/types/` are kept from the bare-RN era so screens can be ported one at a time. Once `app/` covers everything, delete them.

## Add a new route

Drop a `.tsx` file under `app/` — the path becomes the route. Dynamic segments use brackets: `app/business/[slug].tsx` → `/business/<slug>`.

## Add a query

Put a TanStack Query hook in `src/lib/queries.ts` and consume it from any `app/*.tsx`. Mutations clear/invalidate via `useQueryClient()` in the hook.

## Build a release APK

```powershell
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`. For Play Store, use AAB:

```powershell
./gradlew bundleRelease
```

For Expo-managed builds, use [EAS Build](https://docs.expo.dev/build/introduction/) once an `eas.json` is added.
