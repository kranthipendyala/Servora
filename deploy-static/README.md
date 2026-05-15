# Mechanical Directory - Static Export Deployment

Deploy as static HTML files on WHM/cPanel — **no Node.js needed on server**.
Same approach as MyHR.

---

## How It Works

- Next.js builds all pages to static HTML/CSS/JS at build time
- Apache serves these files directly (like MyHR)
- PHP API runs alongside in the `/api` subfolder
- Search, filters, and dynamic content load via client-side JavaScript

## What You Keep

- All pages pre-rendered as HTML (SEO friendly at build time)
- Schema.org structured data (JSON-LD)
- Meta tags, Open Graph for every page
- Static sitemap.xml and robots.txt
- All UI and functionality

## What You Lose vs SSR

- No server-side rendering on each request
- New businesses require rebuild + re-upload to appear in pre-built pages
- Search results page is client-rendered (less SEO for search pages)

---

## Build Steps (Run on YOUR machine)

### Step 1: Build static files

```bash
cd c:\xampp2\htdocs\Mechanical\deploy-static
bash build.sh
```

This creates `deploy-static/out/` with all static files.

### Step 2: Upload to WHM

Upload **two things**:

```
deploy-static/out/*    → /home/USERNAME/public_html/mechanical/
api/*                  → /home/USERNAME/public_html/mechanical/api/
```

### Step 3: Setup .htaccess files

```bash
# Main site .htaccess
scp deploy-static/.htaccess-site root@SERVER:/home/USERNAME/public_html/mechanical/.htaccess

# API .htaccess
scp deploy/.htaccess-api root@SERVER:/home/USERNAME/public_html/mechanical/api/.htaccess
```

### Step 4: Database

1. Open phpMyAdmin
2. Create database `mechanical_directory`
3. Create user with password
4. Import `deploy/setup-database.sql`
5. Update `api/application/config/database.php` with credentials

### Step 5: Update API config

Copy `deploy/database-config.php` to `api/application/config/database.php` and update credentials.

---

## Folder Structure on Server

```
/home/USERNAME/public_html/mechanical/
├── .htaccess           ← from deploy-static/.htaccess-site
├── index.html          ← Homepage
├── _next/              ← CSS, JS bundles
├── sitemap.xml         ← Static sitemap
├── robots.txt          ← Robots file
├── mumbai/             ← City pages (pre-built HTML)
│   ├── index.html
│   ├── plumbing-services/
│   │   └── index.html
│   └── ...
├── business/           ← Business detail pages
│   ├── sharma-plumbing-solutions/
│   │   └── index.html
│   └── ...
├── search/             ← Client-side search page
│   └── index.html
├── admin/              ← Admin panel
│   └── ...
└── api/                ← PHP CodeIgniter 3 API
    ├── .htaccess
    ├── index.php
    ├── application/
    └── system/
```

## Updating

When you add new businesses or make changes:

1. Run `bash build.sh` locally
2. Upload `out/` contents to server
3. PHP API changes: upload api/ folder

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mechanical.com | Admin@123 |
| Owner | owner@mechanical.com | Admin@123 |
| User | user@mechanical.com | Admin@123 |
