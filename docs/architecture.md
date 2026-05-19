# Architecture

Servora is a **home-services booking marketplace** — customers find verified vendors (plumbers, electricians, AC repair, home cleaning, etc.), book a service, and pay online. Servora earns via commission on bookings and vendor subscription tiers.

## Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Customer (browser)              Customer (Android/iOS)            │
│        │                                  │                         │
│        ▼                                  ▼                         │
│   ┌──────────┐                       ┌────────────┐                 │
│   │  web/    │                       │  mobile/   │                 │
│   │ Next.js  │                       │ React Native│                │
│   └────┬─────┘                       └─────┬──────┘                 │
│        │                                   │                        │
│        │      HTTPS (Bearer token)         │                        │
│        └─────────────┬─────────────────────┘                        │
│                      ▼                                              │
│              ┌───────────────┐    ┌──────────────────┐              │
│              │     api/      │───▶│  Elasticsearch   │              │
│              │ CodeIgniter 3 │◀── │ servora_businesses│              │
│              │ (PHP 8.x)     │    └──────────────────┘              │
│              └──────┬────────┘                                      │
│                     │ canonical reads/writes                        │
│                     ▼                                               │
│              ┌──────────────┐                                       │
│              │   MySQL 8    │                                       │
│              │   `servora`  │                                       │
│              └──────────────┘                                       │
│                     ▲                                               │
│                     │                                               │
│              ┌──────┴────────┐                                      │
│              │  vendor-app/  │                                      │
│              │ React Native  │                                      │
│              │ (vendor side) │                                      │
│              └───────────────┘                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Roles

| Role           | Surface                            | Capabilities                                            |
| -------------- | ---------------------------------- | ------------------------------------------------------- |
| **Customer**   | `web/` + `mobile/`                 | Browse, search, book, review, chat with vendor          |
| **Vendor**     | `web/` (vendor dashboard) + `vendor-app/` | Manage profile, services, availability, leads, bookings, KYC, bank, subscription |
| **Admin**      | `web/admin/*`                      | Approve vendors, manage taxonomy, view bookings, set commissions, run payouts, moderate reviews, run Elasticsearch reindex |
| **Super-admin**| Same as admin                      | Plus user role changes                                  |

## Source of truth

**MySQL is canonical for all data.** Elasticsearch is a read-side index for search and filtered listings.

| Operation                                                | Writes to                                        | Reads from              |
| -------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Admin/vendor create / update / delete business, service  | MySQL → best-effort ES push                      | —                       |
| Free-text search (`/api/search`)                         | —                                                | ES, fallback MySQL      |
| Filtered listing (`/api/businesses?city=&category=&sort=`) | —                                              | ES, fallback MySQL      |
| Business detail (`/api/businesses/{slug}`)               | —                                                | MySQL                   |
| Bookings, payments, reviews, chat, dashboards            | MySQL                                            | MySQL                   |

If Elasticsearch is unreachable, read endpoints fall back to MySQL — the site stays up. Writes always succeed against MySQL; failed ES pushes are logged for later resync via `POST /api/admin/elastic/reindex`.

## Auth

Bearer tokens issued by `/api/auth/login`, `/api/auth/phone-login` + OTP, `/api/auth/google-login`. Token lives in `users.token` / `users.token_expires_at`. Sent on every authenticated request as `Authorization: Bearer <token>` (with `X-Auth-Token` fallback for hosts that strip Authorization).

Endpoints that need a specific role call `_require_role('admin')` / `_require_role(['admin', 'super_admin'])` in `MY_Controller.php`.

## Search index lifecycle

1. **Mapping** is defined in [api/application/libraries/Business_indexer.php](../api/application/libraries/Business_indexer.php) and mirrored in [infra/elasticsearch/mappings/businesses.json](../infra/elasticsearch/mappings/businesses.json).
2. **Setup** — `POST /api/admin/elastic/setup` creates the index. Add `{"drop": true}` to recreate.
3. **Reindex** — `POST /api/admin/elastic/reindex` bulk-indexes everything from MySQL.
4. **Incremental sync** — every business write (`Business_model::create/update/update_rating/_sync_categories/sync_service_areas`, admin direct-DB toggles, `Service_model` CRUD) triggers `reindex_to_es($id)` which builds a fresh doc and pushes it. Failures are logged, not thrown.
5. **Per-doc reindex** — `POST /api/admin/elastic/reindex/{id}` if you need to force one.

## Deploy targets

| Layer       | Where                                              |
| ----------- | -------------------------------------------------- |
| `web/`      | Vercel (production)                                |
| `api/`      | Any PHP 8.x host (currently `catalysiscongress.com`) |
| MySQL       | Managed (DigitalOcean / RDS / PlanetScale) or self-hosted |
| Elasticsearch | Elastic Cloud, Bonsai, or self-hosted on the API host |
| `mobile/`   | Play Store / App Store (RN release builds)         |
| `vendor-app/` | Play Store / App Store (RN release builds)       |

## Repo layout

See [README.md](../README.md) for the full folder map. In short: one repo, three TS clients, one PHP API, shared TS contracts, infra in `infra/`.
