# Tier 3 — remaining work

Tier 3a (this session) added the additive web deps and providers. The destructive items below are deliberately deferred to their own sessions because each one can break the live site/API and needs hands-on smoke testing.

## Web

### 1. Next.js 14 → 15 + React 18 → 19

**Why deferred:** Next 15 makes `params`, `searchParams`, `headers()`, `cookies()`, and `draftMode()` async. Every dynamic route in `web/src/app/*` would need:

```ts
// before (Next 14)
export default function Page({ params }: { params: { slug: string } }) {
  return <Detail slug={params.slug} />;
}

// after (Next 15)
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Detail slug={slug} />;
}
```

Plus React 19 may surface compatibility warnings in third-party libs.

**To do:**
1. Bump `next`, `react`, `react-dom`, `eslint-config-next`, `@types/react`, `@types/react-dom`.
2. Run `npx @next/codemod@latest next-async-request-api .` from `web/`.
3. Page-by-page audit — every `[param]` route, every `searchParams` usage.
4. Test in `npm run dev` before committing.

### 2. Tailwind v3 → v4

**Why deferred:** v4 moves config from `tailwind.config.js` to CSS via `@theme`. PostCSS plugin changes from `tailwindcss` to `@tailwindcss/postcss`. Some utilities renamed (`shadow-sm` → `shadow-xs`).

**To do:**
1. Bump `tailwindcss`, replace `postcss.config.js`'s plugin entry.
2. Move `tailwind.config.ts` colors/extend into `globals.css` via `@theme {...}`.
3. Audit every page for renamed utility classes.

### 3. Migrate role-scoped API clients to TanStack Query

`web/src/lib/api.ts`, `admin-api.ts`, `booking-api.ts`, `vendor-api.ts`, `user-auth.ts` currently use raw `fetch()` via `server-fetch.ts`. The new `web/src/lib/queries.ts` is the target shape. Migrate page-by-page:

- Keep server-side `fetch` for SSR/SSG metadata
- Move client interactions to `useQuery` / `useMutation` from the new file
- Once all pages migrated, delete the role-scoped client modules

### 4. Migrate inline forms to react-hook-form + zod

Every form in `web/src/app/**/page.tsx` (admin login, vendor register, booking, contact, etc.) should adopt `useForm` with `zodResolver(schema)` from `@servora/shared`. Mirrors the mobile pattern in `mobile/app/login.tsx`.

## API

### 5. chriskacerguis/codeigniter-restserver

**Why deferred:** the current `Base_Api_Controller` (in `api/application/core/MY_Controller.php`) handcrafts JSON responses + CORS + auth. Switching to chriskacerguis means:

- `composer require chriskacerguis/codeigniter-restserver`
- Every controller extends `REST_Controller` instead of `Base_Api_Controller`
- `respond()` / `respond_error()` calls become `$this->response(...)`
- HTTP-method dispatching becomes `index_get()`, `index_post()`, etc.

That's every controller in `api/application/controllers/api/*.php` — ~24 files. Doable, but needs smoke-testing each endpoint after the change.

**Alternative:** keep the current hand-rolled base class. It works, the API contract is stable, and restserver is one of multiple valid CI3 REST patterns. Match Mileora here only if you want literal parity.

### 6. firebase/php-jwt — replace custom Bearer tokens

**Why deferred:** every existing customer/vendor/admin login token in the `users` table would stop validating. Clients would need to re-authenticate.

**To do:**
1. `composer require firebase/php-jwt`
2. Add a helper `application/libraries/Jwt_lib.php` that wraps encode/decode with the secret from `application/config/.env` (new file)
3. Update `Auth.php::login`, `phone_login`, `google_login`, `complete_profile` to return a signed JWT instead of writing to `users.token`
4. Update `Base_Api_Controller::_authenticate()` to decode + verify the JWT and load the user from its `sub` claim
5. **Migration:** during the cutover, support BOTH the old `users.token` lookup AND JWT validation. After 30 days, drop the column.
6. Update web/`servora:auth_token` storage and mobile/`@servora:auth_token` storage — the value is now a JWT string (works as-is)
7. Add JWT secret rotation procedure to ops docs

**Alternative:** the current opaque-token model has its own merits (revocation is one DELETE; no key management). Keep it if the only motivation is parity.

## Suggested order for the next session

1. shadcn primitives + lucide-react on web (additive only — done in Tier 3a)
2. Migrate one page (`/login` or `/contact`) to react-hook-form + zod — proves the pattern
3. Migrate the same page to `useQuery` from `lib/queries.ts` — proves the data layer
4. Repeat for remaining pages
5. THEN attempt Next 15 + Tailwind v4 upgrade (in a branch, with smoke tests)
6. THEN consider the API auth/restserver migration (most invasive)
