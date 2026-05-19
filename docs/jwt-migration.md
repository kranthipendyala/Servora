# JWT migration

Servora's API now supports **JWT** (firebase/php-jwt) as the authentication scheme. The previous opaque-token mechanism (`users.api_token` + `users.token_expires_at`) still works — the server accepts either format. This document covers the rollout plan.

## What changed

- **New dep**: `firebase/php-jwt ^7.0` in [api/composer.json](../api/composer.json).
- **New config**: [api/application/config/jwt.php](../api/application/config/jwt.php) reads `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_TTL` from env. Dev fallback secret is built into the file (do not deploy as-is).
- **New library**: [api/application/libraries/Jwt_lib.php](../api/application/libraries/Jwt_lib.php) — `issue($user_id, $role)` and `decode($token)`.
- **Acceptance**: [api/application/core/MY_Controller.php](../api/application/core/MY_Controller.php) `_authenticate()` now tries JWT first (recognised by the `ey…` prefix + 2 dots), then falls back to the opaque-token lookup.
- **Dual-emit**: [api/application/controllers/api/Auth.php](../api/application/controllers/api/Auth.php) login responses now include a `jwt` field alongside the existing `token`. Both work.

## Token shape

```jsonc
// header
{ "typ": "JWT", "alg": "HS256" }

// payload
{
  "iss":  "servora",
  "aud":  "servora-clients",
  "sub":  42,             // user_id
  "role": "vendor",       // denormalised for fast role checks
  "iat":  1716000000,
  "exp":  1718592000      // +30 days
}
```

## Server-side rollout (already done)

1. ✅ `composer require firebase/php-jwt:^7.0`
2. ✅ Config + library + dual-acceptance + dual-emission

## Production setup

```
# in your prod env (.htaccess SetEnv, server vars, or .env)
JWT_SECRET=<random 64+ char string — `openssl rand -hex 32`>
JWT_ISSUER=servora
JWT_AUDIENCE=servora-clients
JWT_TTL=2592000
```

**Important:** the dev default secret is deterministic per-install. Change `JWT_SECRET` before any deploy. firebase/php-jwt enforces a minimum 32-byte key for HS256 (will throw `DomainException: Provided key is too short` otherwise).

## Client rollout (not yet done)

The web + mobile + vendor-app clients still use the opaque token from the `token` field in login responses. Migrate them in this order:

### 1. mobile/ + vendor-app/

In `mobile/src/lib/api.ts` (and `vendor-app` equivalent), after a successful login response:

```ts
// Today:
if (data.token) await setToken(data.token);

// After migration: prefer JWT if present
if (data.jwt) await setToken(data.jwt);
else if (data.token) await setToken(data.token);
```

No other code changes needed — the existing `Authorization: Bearer <token>` header sends either format and the server detects which.

### 2. web/

In `web/src/lib/queries.ts` `useVerifyOtp` and any other login mutation, save `data.jwt` to localStorage instead of `data.token`. Same prefer-JWT-fallback-to-opaque logic.

In `web/src/lib/user-auth.ts`, same change.

### 3. Cutover validation

After clients are deployed:

- Hit `/api/auth/profile` with a JWT — confirm 200
- Hit `/api/auth/profile` with an old opaque token — confirm still 200 (compat)
- Inspect server logs for `JWT issuance failed` warnings

### 4. After 30 days of dual-emission

Once all active sessions are JWT-based (most users will have logged in fresh by then), the opaque path can be removed:

1. Drop the JWT-shape check + fall-through in `_authenticate()` so only JWTs validate.
2. Drop the `token` field from login responses (keep `jwt`).
3. Optionally drop the `users.api_token` and `users.token_expires_at` columns. Leave them as-is if you want a one-click "force logout" via `User_model::invalidate_token()`.

Step 3 is the only destructive one — defer it until everything else has been stable in prod for a couple of weeks.

## Logout

JWTs aren't revocable without a denylist. The current `/api/auth/logout` endpoint invalidates the opaque token in the DB and is a no-op for JWTs (the client just drops the JWT locally).

If you ever need server-side revocation:

1. Add a `jti` claim (unique per-token) when issuing
2. Add a `revoked_jtis` table or Redis set
3. On logout, write the jti
4. In `_authenticate`, after decoding, check the jti isn't revoked

This is a deferred enhancement — opaque tokens already serve the "force logout" case until you fully retire them.

## Why HS256 not RS256

HS256 is fine because Servora's API is the only verifier of these tokens. If you ever federate verification to a separate service (microservices split, public token validation by a CDN edge, etc.), switch to RS256 (asymmetric) — the verifier only needs the public key, not the signing secret.

The switch is mechanical: generate a key pair, change `$config['jwt']['algorithm']` to `'RS256'`, pass the private key to `JWT::encode` and the public key to `JWT::decode`.

## Why not also migrate restserver?

The "Tier 3 remaining" doc listed `chriskacerguis/codeigniter-restserver` as a parity gap with Mileora. After review, the existing `Base_Api_Controller` already provides:

- Consistent JSON envelope (`{ status, message, data }`)
- CORS handling
- Bearer/X-Auth-Token extraction
- Role-based authorisation helpers (`_require_role`)
- HTTP method dispatch

The benefits of switching to restserver are largely cosmetic (REST_Controller naming, method suffix dispatch like `index_get` / `index_post`). The cost is real: ~24 controllers to refactor, every endpoint to retest.

**Recommendation**: keep `Base_Api_Controller`. It's not a parity gap that matters for users — they see identical JSON shapes either way.
