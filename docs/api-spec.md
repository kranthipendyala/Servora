# API spec

Base URL (dev): `http://localhost/Servora/api/index.php/api`
Base URL (prod): `https://catalysiscongress.com/api/index.php/api`

All responses are JSON wrapped in:

```json
{ "status": true|false, "message": "...", "data": {...} }
```

Auth: `Authorization: Bearer <token>` (fallback header: `X-Auth-Token`).

The source of truth for routes is [api/application/config/routes.php](../api/application/config/routes.php). This doc summarises the public + private surface.

## Public

| Method | Path                                       | Notes                                                 |
| ------ | ------------------------------------------ | ----------------------------------------------------- |
| GET    | `/cities`                                  | List active cities                                    |
| GET    | `/cities/{slug}`                           | One city                                              |
| GET    | `/categories`                              | List categories                                       |
| GET    | `/categories/{slug}`                       | One category                                          |
| GET    | `/localities/{city_slug}`                  | Localities in a city                                  |
| GET    | `/businesses`                              | Listing — filters: `?city=&category=&locality=&min_rating=&verified=1&sort=rating|name|newest|reviews&page=&per_page=`. **Reads from Elasticsearch**, falls back to MySQL. |
| GET    | `/businesses/{slug}`                       | Business detail (MySQL point lookup)                  |
| GET    | `/businesses/{slug}/reviews`               | Reviews for a business                                |
| GET    | `/businesses/{slug}/services`              | Services for a business                               |
| GET    | `/search`                                  | Free-text search `?q=&city=&category=&page=&per_page=`. **Reads from Elasticsearch**, falls back to MySQL. |
| GET    | `/services`                                | Listing                                               |
| GET    | `/services/{id}`                           | Service detail                                        |
| GET    | `/platform/config`                         | Global platform config (timezone, geo scope, etc.)    |
| GET    | `/seo/meta`                                | Per-route SEO meta                                    |
| GET    | `/seo/breadcrumbs`                         | Breadcrumb data                                       |
| GET    | `/seo/static-params/{type}`                | Static path params for ISR                            |
| GET    | `/sitemap/urls`                            | Sitemap URL list                                      |
| GET    | `/sitemap/xml`                             | Sitemap XML                                           |
| GET    | `/elastic/ping`                            | Cluster reachability + version                        |

## Auth

| Method | Path                                       | Notes                                                 |
| ------ | ------------------------------------------ | ----------------------------------------------------- |
| POST   | `/auth/login`                              | Email/password                                        |
| POST   | `/auth/register`                           | Customer registration                                 |
| POST   | `/auth/logout`                             | Revoke current token                                  |
| GET    | `/auth/profile`                            | Current user                                          |
| POST   | `/auth/phone-login`                        | Send OTP                                              |
| POST   | `/auth/complete-profile`                   | Set name/email after first phone login                |
| POST   | `/auth/google-login`                       | OAuth via Google ID token                             |
| POST   | `/otp/send`                                | Send OTP                                              |
| POST   | `/otp/verify`                              | Verify OTP                                            |

## Customer (auth required)

| Method | Path                                       | Notes                                                 |
| ------ | ------------------------------------------ | ----------------------------------------------------- |
| GET    | `/addresses`                               | My addresses                                          |
| POST   | `/addresses`                               | Add address                                           |
| PUT    | `/addresses/{id}`                          | Update                                                |
| DELETE | `/addresses/{id}`                          | Delete                                                |
| GET    | `/bookings`                                | My bookings                                           |
| POST   | `/bookings`                                | Create booking                                        |
| GET    | `/bookings/{id}`                           | Detail                                                |
| POST   | `/bookings/{id}/cancel`                    | Cancel                                                |
| POST   | `/bookings/{id}/review`                    | Submit review after completion                        |
| POST   | `/payments/create-order`                   | Razorpay order                                        |
| POST   | `/payments/verify`                         | Razorpay verify                                       |
| POST   | `/payments/webhook`                        | Razorpay webhook (no auth — signature verified)       |
| POST   | `/coupons/validate`                        | Validate coupon code                                  |
| GET    | `/notifications`                           | List                                                  |
| GET    | `/notifications/unread-count`              | Unread count                                          |
| POST   | `/notifications/{id}/read`                 | Mark one read                                         |
| POST   | `/notifications/read-all`                  | Mark all read                                         |
| POST   | `/leads`                                   | Submit a lead (contact form / phone click)            |
| GET    | `/chat/conversations`                      | My conversations                                      |
| GET    | `/chat/{conversation_id}`                  | Messages                                              |
| POST   | `/chat/{conversation_id}`                  | Send message                                          |

## Business owner / vendor dashboard (auth + role=vendor)

| Method | Path                                       | Notes                                                 |
| ------ | ------------------------------------------ | ----------------------------------------------------- |
| POST   | `/vendor/register`                         | New vendor signup                                     |
| GET    | `/vendor/onboarding/status`                | Where in onboarding the vendor is                     |
| POST   | `/vendor/onboarding/complete`              | Finalise                                              |
| POST   | `/vendor/onboarding/business-profile`      | Save business profile step                            |
| POST   | `/vendor/onboarding/services`              | Save services step                                    |
| POST   | `/vendor/onboarding/kyc-documents`         | Upload KYC                                            |
| POST   | `/vendor/onboarding/bank-details`          | Save bank                                             |
| GET    | `/vendor/stats`                            | Vendor dashboard stats                                |
| GET    | `/vendor/bookings`                         | Pending bookings                                      |
| POST   | `/vendor/bookings/{id}/accept`             |                                                       |
| POST   | `/vendor/bookings/{id}/reject`             |                                                       |
| POST   | `/vendor/bookings/{id}/start`              |                                                       |
| POST   | `/vendor/bookings/{id}/complete`           |                                                       |
| POST   | `/vendor/bookings/{id}/collect-payment`    | Cash collection                                       |
| GET    | `/vendor/services`                         | My services                                           |
| POST   | `/vendor/services`                         | Create service                                        |
| PUT    | `/vendor/services/{id}`                    | Update                                                |
| DELETE | `/vendor/services/{id}`                    | Delete                                                |
| GET    | `/vendor/availability`                     |                                                       |
| PUT    | `/vendor/availability`                     |                                                       |
| GET    | `/vendor/service-areas`                    |                                                       |
| POST   | `/vendor/service-areas`                    |                                                       |
| GET    | `/vendor/categories`                       |                                                       |
| POST   | `/vendor/categories`                       |                                                       |
| GET    | `/vendor/documents`                        | KYC docs                                              |
| POST   | `/vendor/documents`                        |                                                       |
| GET    | `/vendor/bank-details`                     |                                                       |
| POST   | `/vendor/bank-details`                     |                                                       |
| GET    | `/vendor/payouts`                          |                                                       |
| GET    | `/vendor/subscriptions/plans`              | Available plans                                       |
| GET    | `/vendor/subscriptions/current`            | Current subscription                                  |
| POST   | `/vendor/subscriptions/subscribe`          | Start a plan                                          |
| POST   | `/vendor/subscriptions/cancel`             |                                                       |
| GET    | `/vendor/reviews`                          | Reviews on my businesses                              |
| POST   | `/vendor/reviews/{id}/reply`               |                                                       |
| GET    | `/vendor/leads`                            | Leads sent to me                                      |
| GET    | `/dashboard/business`                      | My business                                           |
| PUT    | `/dashboard/business`                      | Update                                                |
| POST   | `/dashboard/business/images`               | Upload                                                |
| DELETE | `/dashboard/business/images/{id}`          | Delete                                                |
| GET    | `/dashboard/reviews`                       |                                                       |
| GET    | `/dashboard/stats`                         |                                                       |

## Admin (auth + role=admin|super_admin)

| Method | Path                                          | Notes                                                 |
| ------ | --------------------------------------------- | ----------------------------------------------------- |
| GET    | `/admin/businesses`                           | All businesses (no geo/status filter)                 |
| POST   | `/admin/businesses`                           | Create                                                |
| GET    | `/admin/businesses/{id}`                      | Detail                                                |
| PUT    | `/admin/businesses/{id}`                      | Update                                                |
| DELETE | `/admin/businesses/{id}`                      | Soft delete (status=suspended)                        |
| POST   | `/admin/businesses/{id}/approve`              | Approve + activate + verify                           |
| POST   | `/admin/businesses/{id}/verify`               | Toggle verified                                       |
| POST   | `/admin/businesses/{id}/feature`              | Toggle featured                                       |
| POST   | `/admin/businesses/backfill-states`           | One-time data fix                                     |
| GET    | `/admin/categories`                           |                                                       |
| POST   | `/admin/categories`                           |                                                       |
| PUT    | `/admin/categories/{id}`                      |                                                       |
| DELETE | `/admin/categories/{id}`                      |                                                       |
| GET    | `/admin/cities`                               |                                                       |
| POST   | `/admin/cities`                               |                                                       |
| PUT    | `/admin/cities/{id}`                          |                                                       |
| GET    | `/admin/localities`                           |                                                       |
| POST   | `/admin/localities`                           |                                                       |
| PUT    | `/admin/localities/{id}`                      |                                                       |
| DELETE | `/admin/localities/{id}`                      |                                                       |
| GET    | `/admin/reviews`                              |                                                       |
| POST   | `/admin/reviews/{id}/approve`                 |                                                       |
| DELETE | `/admin/reviews/{id}`                         |                                                       |
| GET    | `/admin/users`                                |                                                       |
| POST   | `/admin/users`                                |                                                       |
| PUT    | `/admin/users/{id}`                           |                                                       |
| GET    | `/admin/claims`                               | Vendor claims for unowned businesses                  |
| PUT    | `/admin/claims/{id}`                          |                                                       |
| GET    | `/admin/seo`                                  |                                                       |
| POST   | `/admin/seo`                                  |                                                       |
| DELETE | `/admin/seo/{id}`                             |                                                       |
| GET    | `/admin/settings`                             |                                                       |
| POST   | `/admin/settings`                             |                                                       |
| GET    | `/admin/stats`                                |                                                       |
| GET    | `/admin/bookings`                             |                                                       |
| GET    | `/admin/bookings/{id}`                        |                                                       |
| PUT    | `/admin/bookings/{id}/status`                 |                                                       |
| GET    | `/admin/commissions`                          | Commission rules                                      |
| POST   | `/admin/commissions`                          |                                                       |
| PUT    | `/admin/commissions/{id}`                     |                                                       |
| DELETE | `/admin/commissions/{id}`                     |                                                       |
| GET    | `/admin/services`                             | All services across vendors                           |
| GET    | `/admin/subscription-plans`                   |                                                       |
| POST   | `/admin/subscription-plans`                   |                                                       |
| PUT    | `/admin/subscription-plans/{id}`              |                                                       |
| GET    | `/admin/vendor-subscriptions`                 |                                                       |
| GET    | `/admin/payouts`                              |                                                       |
| POST   | `/admin/payouts/{id}/process`                 |                                                       |
| GET    | `/admin/vendor-documents`                     |                                                       |
| POST   | `/admin/vendor-documents/{id}/approve`        |                                                       |
| POST   | `/admin/vendor-documents/{id}/reject`         |                                                       |
| GET    | `/admin/coupons`                              |                                                       |
| POST   | `/admin/coupons`                              |                                                       |
| PUT    | `/admin/coupons/{id}`                         |                                                       |
| DELETE | `/admin/coupons/{id}`                         |                                                       |
| GET    | `/admin/analytics/revenue`                    |                                                       |
| GET    | `/admin/analytics/bookings`                   |                                                       |
| GET    | `/admin/analytics/vendors`                    |                                                       |
| GET    | `/admin/login-logs`                           |                                                       |
| GET    | `/admin/otp-logs`                             |                                                       |
| GET    | `/admin/leads`                                | All leads                                             |
| POST   | `/admin/elastic/setup`                        | Body: `{"drop": true}` to recreate                    |
| POST   | `/admin/elastic/reindex`                      | Body: `{"drop": true, "batch_size": 200}`             |
| POST   | `/admin/elastic/reindex/{id}`                 | One business                                          |

## Errors

```json
{
  "status": false,
  "message": "Missing: name, city_id",
  "data": null,
  "errors": null
}
```

Common HTTP codes:

- `200` OK
- `201` Created
- `400` Validation failed
- `401` Auth required / invalid token
- `403` Insufficient role
- `404` Not found
- `405` Method not allowed
- `422` Bad input
- `500` Server error
- `503` Elasticsearch unavailable (only on `/elastic/ping`)
