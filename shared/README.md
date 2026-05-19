# @servora/shared

TypeScript contracts shared by `web/`, `mobile/`, and `vendor-app/`.

- `src/types.ts` — TS types for API entities (Business, Service, Booking, Review, Lead, User…)
- `src/schemas.ts` — Zod schemas for form + payload validation
- `src/index.ts` — barrel export

## Use from web/

`web/package.json`:

```json
{
  "dependencies": {
    "@servora/shared": "file:../shared"
  }
}
```

Then:

```ts
import type { Business, Booking } from "@servora/shared";
import { createBookingSchema } from "@servora/shared";
```

## Use from mobile/ and vendor-app/

Same pattern, but use Metro's `extraNodeModules` so the bundler can resolve the workspace path (see `mobile/metro.config.js`).

## Why this exists

So a backend response shape change shows up as a TS error in every client that consumes it, not a runtime surprise.
