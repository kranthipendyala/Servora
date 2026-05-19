# Servora

Home-services marketplace for **plumbers, electricians, AC repair, home cleaning & rituals**. Service-booking + lead-generation product, India-first.

## Monorepo layout

```
Servora/
├── web/         # Next.js 14 (App Router, TS, Tailwind v3)  → Vercel
├── mobile/      # React Native customer app (iOS + Android) → App Store / Play Store
├── vendor-app/  # React Native vendor app (iOS + Android)   → App Store / Play Store
├── api/         # CodeIgniter 3 (PHP 8.x) REST API          → XAMPP / any PHP host
├── shared/      # Shared TS contracts (consumed by web + mobile + vendor-app)
├── infra/       # docker-compose: MySQL + Elasticsearch + Kibana + phpMyAdmin
├── database/    # SQL migrations
├── deploy/      # Production deploy artefacts
├── design/      # Mockups, brand assets
└── docs/        # Architecture, API spec, DB schema, ES indices, SEO checklist
```

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ----------------------------------------------------------------- |
| Web          | Next.js 14 (App Router), TypeScript, Tailwind CSS v3              |
| Web UI       | Lucide icons, custom components                                   |
| Forms        | (planned) react-hook-form + zod                                   |
| Data fetch   | (planned) TanStack Query                                          |
| Mobile       | React Native 0.74 (bare CLI), React Navigation v6                 |
| Vendor app   | React Native 0.74 (bare CLI), React Navigation v6                 |
| Backend API  | **CodeIgniter 3** + composer-autoloaded vendor, **PHP 8.x**       |
| Auth         | Bearer tokens (`users.token` + `token_expires_at`) — same tokens for web + mobile |
| Database     | MySQL 8 (managed via phpMyAdmin) — schema `servora`               |
| Search       | Elasticsearch 8.x                                                 |
| Payments     | Razorpay (India)                                                  |
| Notifications| Firebase Cloud Messaging                                          |
| Hosting      | Web → Vercel · API → any PHP 8.x host · Mobile → native release builds |

> **CI3 + PHP 8 note:** Use CodeIgniter 3.1.x with PHP 8.2. Some deprecation notices are expected; `api/index.php` is configured to suppress them in production.

See [docs/architecture.md](docs/architecture.md) for the full system design.

## Quick start (local dev)

### 1. Infrastructure — MySQL, Elasticsearch, Kibana, phpMyAdmin

```powershell
cd infra
docker compose up -d
```

- MySQL: `localhost:3306` (user `servora` / pass `servora`)
- phpMyAdmin: http://localhost:8081
- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601

> Already running MySQL via XAMPP? Comment the `mysql` and `phpmyadmin` services in `docker-compose.yml` and point the API at your XAMPP MySQL credentials in `api/application/config/database.php`.

### 2. Backend API — CodeIgniter 3

```powershell
cd api
composer install
```

Then in your browser run the migrations:

```powershell
mysql -u root < database/run_migrations.sql
```

API base URL: `http://localhost/Servora/api/index.php/api`

Build the Elasticsearch index (admin token required):

```powershell
curl -X POST -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" ^
  -d "{\"drop\": true}" ^
  http://localhost/Servora/api/index.php/api/admin/elastic/reindex
```

### 3. Web — Next.js

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

### 4. Mobile — React Native customer app

```powershell
cd mobile
npm install
npm run android   # or: npm run ios
```

Requires Android Studio + a running emulator (or attached device).

### 5. Vendor app — React Native

```powershell
cd vendor-app
npm install
npm run android   # or: npm run ios
```

## Documentation

- [Architecture](docs/architecture.md) — system diagram, data flow, decisions
- [API spec](docs/api-spec.md) — REST endpoints
- [Database schema](docs/database-schema.md) — tables + relationships
- [Elasticsearch indices](docs/elasticsearch-indices.md) — mappings, query patterns, sync
- [SEO checklist](docs/seo-checklist.md) — what's wired + what to verify per page

## Production deploy

- **Web** → push to GitHub, connect Vercel project, set env vars from `web/.env.example`
- **API** → upload `api/` to a PHP 8.x host, point webroot at the `api/` folder, run `composer install` and the migrations once
- **DB** → managed MySQL (DigitalOcean / AWS RDS / PlanetScale) or self-hosted with phpMyAdmin
- **Elasticsearch** → Elastic Cloud or Bonsai (managed) — or self-hosted on the API host
- **Mobile** → `cd android && ./gradlew assembleRelease` then upload AAB to Play Store; Xcode archive for iOS
