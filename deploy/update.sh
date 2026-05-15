#!/bin/bash
# Servora - Redeploy Script
# Run from: /home/USERNAME/servora-nextjs/
# Usage: bash update.sh

set -e

echo "==================================="
echo " Servora - Redeploying"
echo "==================================="

echo ""
echo "[1/4] Installing dependencies..."
npm install

echo ""
echo "[2/4] Building Next.js for production..."
NEXT_PUBLIC_API_URL=https://obesityworldconference.com/servora/api/api \
NEXT_PUBLIC_SITE_URL=https://obesityworldconference.com \
NEXT_PUBLIC_BASE_PATH=/servora \
npm run build

echo ""
echo "[3/4] Restarting PM2..."
pm2 restart servora

echo ""
echo "[4/4] Verifying..."
sleep 2
pm2 status servora

echo ""
echo "==================================="
echo " Deployment complete!"
echo " Check logs: pm2 logs servora"
echo "==================================="
