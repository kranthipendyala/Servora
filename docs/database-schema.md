# Database schema

MySQL 8, schema `servora`, charset `utf8mb4_unicode_ci`.

The authoritative source is [database/migrations/](../database/migrations/). Run them with [database/run_migrations.sql](../database/run_migrations.sql). This doc is a high-level map — when in doubt, read the migration SQL.

## Tables — grouped by domain

### Identity

| Table              | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `users`            | All accounts (customer / vendor / admin / super_admin). `role` enum, `token` + `token_expires_at` for Bearer auth. |
| `user_login_logs`  | Audit trail — when, how, from where each user logged in |
| `otp_verifications`| Phone OTP send/verify state                            |
| `addresses`        | Customer saved addresses                               |

### Catalogue

| Table              | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `states`           | Indian states. `name`, `slug`                          |
| `cities`           | Cities. `name`, `slug`, `state_id`                     |
| `localities`       | Neighbourhoods within cities                           |
| `categories`       | Service categories (Plumbing, Electrical, AC, Cleaning…) |

### Vendors / businesses (terminology: DB table is `businesses`, user-facing copy is "vendor")

| Table                       | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `businesses`                | The vendor's business profile. `status` enum (`pending|approved|rejected|suspended`), `is_active`, `is_verified`, `is_featured`, `avg_rating`, `total_reviews`, lat/lng, owner FK to `users.id` |
| `business_categories`       | Many-to-many between business and category. `is_primary` marks the headline category |
| `business_images`           | Gallery images per business                          |
| `business_service_areas`    | Cities a business serves beyond its home city        |
| `business_claims`           | Vendor requests to claim an unowned business listing |

### Catalogue offered by each vendor

| Table              | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `services`         | What a vendor offers — name, description, `base_price`, `discounted_price`, `price_unit`, `duration_minutes`, `is_active` |
| `service_variants` | Tiered/sized versions of a service (e.g., 1BHK / 2BHK / 3BHK cleaning) |

### Bookings

| Table              | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `bookings`         | Customer booking of a service. `status` enum (`pending|confirmed|in_progress|completed|cancelled|refunded`), `amount_paise`, Razorpay IDs |
| `booking_items`    | Line items within a booking (service + optional variant + quantity) |
| `booking_reviews`  | Review attached to a completed booking                 |
| `reviews`          | Legacy/general reviews (pre-booking-flow). New code uses `booking_reviews`. |

### Vendor operations

| Table                  | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `vendor_availability`  | Weekly availability windows                        |
| `vendor_blocked_dates` | One-off blocked dates                              |
| `vendor_documents`     | KYC documents (PAN, GST, aadhaar, etc.) with approval status |
| `vendor_bank_details`  | Payout account                                     |
| `vendor_subscriptions` | Active plan per vendor                             |
| `subscription_plans`   | Tier definitions                                   |

### Revenue & payouts

| Table              | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `commission_rules` | Platform commission % by category / vendor tier        |
| `payments`         | Razorpay payments                                      |
| `payouts`          | Settlement to vendor bank                              |
| `coupons`          | Discount codes                                         |

### Lead generation

| Table              | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `leads`            | Contact form / phone-click leads sent to a vendor. `source` enum, `status` lifecycle. |

### Engagement

| Table                 | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `chat_conversations`  | One row per customer↔vendor thread                  |
| `chat_messages`       | Messages within a conversation                      |
| `notifications`       | In-app notifications (push + center)                |

### Content / config

| Table        | Purpose                                                      |
| ------------ | ------------------------------------------------------------ |
| `seo_meta`   | Per-route meta title/description/keywords/canonical          |
| `pages`      | Static pages (about, contact, terms, privacy) edited by admin |
| `settings`   | Key-value platform config (geo scope, default city, FCM keys…) |

## Key relationships

```
users(id) ──┬── businesses(owner_user_id)
            ├── bookings(user_id)
            ├── reviews(user_id)
            └── addresses(user_id)

businesses(id) ──┬── business_categories(business_id) ── categories(id)
                 ├── business_images(business_id)
                 ├── business_service_areas(business_id) ── cities(id)
                 ├── services(business_id) ── service_variants(service_id)
                 ├── bookings(business_id) ── booking_items(booking_id)
                 │                          └── booking_reviews(booking_id)
                 ├── reviews(business_id)
                 ├── leads(business_id)
                 ├── vendor_availability(business_id)
                 ├── vendor_blocked_dates(business_id)
                 ├── vendor_documents(business_id)
                 ├── vendor_bank_details(business_id)
                 ├── vendor_subscriptions(business_id) ── subscription_plans(id)
                 └── payouts(business_id)

cities(id) ──┬── localities(city_id)
             ├── businesses(city_id)
             └── business_service_areas(city_id)

states(id) ── cities(state_id) ── businesses(state_id)
```

## Auto-derived columns

- `businesses.state_id` is derived from `businesses.city_id` via `cities.state_id` whenever a business is created/updated without an explicit state. Backfill helper: `POST /api/admin/businesses/backfill-states`.
- `businesses.avg_rating` and `businesses.total_reviews` are recomputed by `Business_model::update_rating()` whenever an approved review changes.
- `businesses.is_active` is auto-flipped based on `status` transitions (`approved` → active, `rejected|suspended` → inactive).

## Soft-delete

Servora doesn't hard-delete vendors. `DELETE /api/admin/businesses/{id}` sets `status='suspended'` and `is_active=0`. They drop out of public listings via the ES filter `is_active=true AND status=approved`.

## Migrations

```
database/
├── migrations/
│   ├── 001_create_states.sql
│   ├── 002_create_cities.sql
│   ├── 003_create_localities.sql
│   ├── 004_create_categories.sql
│   ├── 005_create_businesses.sql
│   └── ...
└── run_migrations.sql       # CREATE DATABASE + SOURCE each file
```
