# Servora

Home-services marketplace for **plumbers, electricians, AC repair, home cleaning & more** — booking + lead-generation product, India-first.

## Monorepo layout

```
Servora/
├── web/         # Next.js 14 (App Router, TS, Tailwind v3)   → Vercel
├── mobile/      # React Native 0.74 (bare) customer app      → Play Store / App Store
├── vendor-app/  # React Native 0.74 (bare) vendor app        → Play Store / App Store
├── android/     # Native Android build for the customer app
├── api/         # CodeIgniter 3 (PHP 8.x) REST API            → XAMPP / any PHP host
├── database/    # SQL migrations + seed dumps
├── deploy/      # Production deploy artefacts
├── api-deploy/  # API deploy artefacts
├── api-wrapper/ # API wrapper utilities
├── design/      # Mockups, brand assets
└── docs/        # Pricing, project docs
```

## Tech stack

| Layer        | Choice                                                              |
| ------------ | ------------------------------------------------------------------- |
| Web          | Next.js 14 (App Router), TypeScript, Tailwind CSS v3                |
| Mobile       | React Native 0.74 (bare CLI, not Expo), React Navigation v6         |
| Vendor app   | React Native 0.74 (bare CLI), React Navigation v6                   |
| Backend API  | **CodeIgniter 3** (PHP 8.x), composer-autoloaded vendor             |
| Auth         | Bearer-token sessions (custom) + Google OAuth (web)                 |
| Database     | MySQL 8 (managed via phpMyAdmin) — schema `mechanical_directory`    |
| Search       | **Elasticsearch 8.x** (`elasticsearch/elasticsearch` PHP client)    |
| Payments     | Razorpay (India)                                                    |
| Notifications| Firebase Cloud Messaging                                            |
| Hosting      | Web → Vercel · API → any PHP host · Mobile → native builds          |

> **CI3 + PHP 8 note:** Servora targets CodeIgniter 3.1.x with PHP 8.2. Some deprecation notices are expected; `api/index.php` suppresses them in production.

## Quick start (local dev)

### 1. Database — MySQL

Run MySQL via XAMPP (or any local MySQL 8). Create the schema and load the seed dump:

```powershell
mysql -u root -e "CREATE DATABASE mechanical_directory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root mechanical_directory < mechanical_directory_dump.sql
```

phpMyAdmin (bundled with XAMPP): http://localhost/phpmyadmin

### 2. Elasticsearch — for search + listings

The public site reads `/api/search` and `/api/businesses` from Elasticsearch (with MySQL fallback).

```powershell
# Easiest: run a single-node ES container
docker run -d --name servora-es -p 9200:9200 ^
  -e "discovery.type=single-node" ^
  -e "xpack.security.enabled=false" ^
  docker.elastic.co/elasticsearch/elasticsearch:8.15.0
```

Verify: `curl http://localhost:9200`

ES connection settings are in [api/application/config/elasticsearch.php](api/application/config/elasticsearch.php) and overridable via env vars: `ES_HOSTS`, `ES_API_KEY`, `ES_USER`, `ES_PASS`, `ES_INDEX_PREFIX`.

### 3. Backend API — CodeIgniter 3

```powershell
cd api
composer install
```

Drop the `api/` folder under your XAMPP htdocs (this repo is already at `c:\xampp2\htdocs\Servora`).

- API base URL: `http://localhost/Servora/api/index.php/api`
- Health check: `GET http://localhost/Servora/api/index.php/api/elastic/ping`
- Build the ES index (admin token required):
  ```
  POST /api/admin/elastic/reindex     body: {"drop": true}
  ```

### 4. Web — Next.js

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

### 5. Mobile — React Native customer app

```powershell
cd mobile
npm install
npm run android    # or: npm run ios
```

Requires Android Studio + an emulator or attached device. The bundled `android/` folder at the repo root is the native build for this app.

### 6. Vendor app — React Native

```powershell
cd vendor-app
npm install
npm run android    # or: npm run ios
```

## Search architecture (MySQL canonical, Elasticsearch for reads)

| Operation                                                | Writes to                            | Reads from         |
| -------------------------------------------------------- | ------------------------------------ | ------------------ |
| Admin create / update / delete business, service         | MySQL (canonical) → ES push (best-effort) | —              |
| Search (`/api/search?q=...`)                             | —                                    | **ES**, fallback MySQL |
| Listings (`/api/businesses?city=...&category=...&sort=`) | —                                    | **ES**, fallback MySQL |
| Business detail (`/api/businesses/{slug}`)               | —                                    | MySQL              |
| Bookings, reviews, payments, chat, dashboards            | MySQL                                | MySQL              |

When ES is unreachable, all read endpoints transparently fall back to MySQL — the site stays up. Admin writes still succeed and are logged for later re-sync.

**Recovery valve:** `POST /api/admin/elastic/reindex` rebuilds the whole index from MySQL.

## Admin endpoints (Elasticsearch)

| Method | Path                                  | Purpose                                  |
| ------ | ------------------------------------- | ---------------------------------------- |
| GET    | `/api/elastic/ping`                   | Cluster reachability + version (public)  |
| POST   | `/api/admin/elastic/setup`            | Create the index (body: `{"drop": true}` to recreate) |
| POST   | `/api/admin/elastic/reindex`          | Bulk reindex everything                  |
| POST   | `/api/admin/elastic/reindex/{id}`     | Reindex one business                     |

## Production deploy

- **Web** → push to GitHub, connect Vercel project, set env from [web/.env.example](web/.env.example)
- **API** → upload `api/` to a PHP 8 host, point webroot at the `api/` folder, run `composer install`
- **DB** → managed MySQL or self-hosted; import schema from [mechanical_directory_dump.sql](mechanical_directory_dump.sql)
- **Elasticsearch** → Elastic Cloud, Bonsai, or self-hosted on the API host
- **Mobile** → native release builds via `cd android && ./gradlew assembleRelease` (Android) / Xcode archive (iOS)
