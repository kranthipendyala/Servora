# Servora - WHM Deployment Guide

**Live URL:** https://obesityworldconference.com/servora
**API URL:** https://obesityworldconference.com/servora/api/api/

---

## Prerequisites

- WHM root SSH access
- Apache modules: mod_proxy, mod_proxy_http, mod_rewrite, mod_headers
- PHP 8.2 with: mysqli, json, mbstring, curl
- MySQL/MariaDB

---

## Step 1: Install Node.js (SSH as root)

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
node --version    # v20.x.x
npm --version     # 10.x.x
```

## Step 2: Install PM2

```bash
npm install -g pm2
```

## Step 3: Create Folders

Replace `USERNAME` with cPanel username for obesityworldconference.com

```bash
# Next.js app (OUTSIDE public_html)
mkdir -p /home/USERNAME/servora-nextjs

# PHP API (INSIDE public_html)
mkdir -p /home/USERNAME/public_html/servora/api

# Logs
mkdir -p /home/USERNAME/logs
```

## Step 4: Upload Files

From your local machine:

```bash
# Upload PHP API
scp -r api/* root@SERVER_IP:/home/USERNAME/public_html/servora/api/

# Upload Next.js app (web/ folder)
scp -r web/* root@SERVER_IP:/home/USERNAME/servora-nextjs/

# Upload PM2 config
scp deploy/ecosystem.config.js root@SERVER_IP:/home/USERNAME/servora-nextjs/

# Upload production database config
scp deploy/database-config.php root@SERVER_IP:/home/USERNAME/public_html/servora/api/application/config/database.php

# Upload production .htaccess for API
scp deploy/.htaccess-api root@SERVER_IP:/home/USERNAME/public_html/servora/api/.htaccess
```

## Step 5: Setup Database

1. Open phpMyAdmin on WHM
2. Create database: `servora_directory`
3. Create user: `servora_user` with strong password
4. Grant ALL PRIVILEGES on `servora_directory`
5. Import `deploy/setup-database.sql`
6. Update password in `/home/USERNAME/public_html/servora/api/application/config/database.php`

## Step 6: Build & Start Next.js

```bash
cd /home/USERNAME/servora-nextjs

# Install dependencies
npm install

# Build for production
NEXT_PUBLIC_API_URL=https://obesityworldconference.com/servora/api/api \
NEXT_PUBLIC_SITE_URL=https://obesityworldconference.com \
NEXT_PUBLIC_BASE_PATH=/servora \
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # Auto-start on server reboot
```

## Step 7: Apache Reverse Proxy

Add to vhost config for obesityworldconference.com:

**WHM > Apache Configuration > Include Editor > Pre VirtualHost Include (All Versions)**

OR edit the vhost directly:

```bash
nano /etc/apache2/conf.d/userdata/ssl/2_4/USERNAME/obesityworldconference.com/servora.conf
```

Paste contents of `deploy/apache-proxy.conf`, then:

```bash
/scripts/rebuildhttpdconf
service httpd restart
```

## Step 8: Verify

```bash
# Check PM2 is running
pm2 status

# Check API
curl https://obesityworldconference.com/servora/api/api/cities

# Check website
curl -I https://obesityworldconference.com/servora/
```

---

## Updating / Redeploying

```bash
cd /home/USERNAME/servora-nextjs
# Upload new files, then:
npm install
NEXT_PUBLIC_API_URL=https://obesityworldconference.com/servora/api/api \
NEXT_PUBLIC_SITE_URL=https://obesityworldconference.com \
NEXT_PUBLIC_BASE_PATH=/servora \
npm run build
pm2 restart servora
```

## Troubleshooting

```bash
pm2 logs servora             # View app logs
pm2 restart servora          # Restart app
pm2 delete servora           # Stop & remove
cat /home/USERNAME/logs/servora-error.log   # Error logs
```

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@servora.com | Admin@123 |
| Owner | owner@servora.com | Admin@123 |
| User | user@servora.com | Admin@123 |

**Change these passwords immediately after deployment!**
