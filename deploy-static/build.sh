#!/bin/bash
# Mechanical Directory - Static Export Build Script
# Run this from your LOCAL machine (where Node.js is installed)
#
# Usage: cd deploy-static && bash build.sh
#
# This will:
# 1. Copy web/ to a temp folder
# 2. Apply static export patches
# 3. Build static HTML
# 4. Output to deploy-static/out/ (ready to upload)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WEB_DIR="$PROJECT_DIR/web"
TEMP_DIR="$SCRIPT_DIR/_build_temp"
OUT_DIR="$SCRIPT_DIR/out"

echo "==================================="
echo " Mechanical - Static Export Builder"
echo "==================================="

# Clean previous build
rm -rf "$TEMP_DIR" "$OUT_DIR"

# Step 1: Copy web/ to temp
echo ""
echo "[1/5] Copying web/ source..."
cp -r "$WEB_DIR" "$TEMP_DIR"

# Step 2: Replace next.config.mjs with static version
echo "[2/5] Applying static export config..."
cp "$SCRIPT_DIR/next.config.static.mjs" "$TEMP_DIR/next.config.mjs"

# Step 3: Patch search page to be client-side
echo "[3/5] Patching pages for static export..."
cp "$SCRIPT_DIR/patches/search-page.tsx" "$TEMP_DIR/src/app/search/page.tsx"

# Remove dynamic route handlers (not supported in static export)
rm -rf "$TEMP_DIR/src/app/sitemap.xml"
rm -rf "$TEMP_DIR/src/app/robots.txt"

# Create static sitemap.xml and robots.txt in public/
cp "$SCRIPT_DIR/patches/sitemap.xml" "$TEMP_DIR/public/sitemap.xml" 2>/dev/null || true
cp "$SCRIPT_DIR/patches/robots.txt" "$TEMP_DIR/public/robots.txt" 2>/dev/null || true

# Step 4: Install deps & Build
echo "[4/5] Building static export..."
cd "$TEMP_DIR"
npm install
NEXT_PUBLIC_API_URL=https://obesityworldconference.com/mechanical/api/api \
NEXT_PUBLIC_SITE_URL=https://obesityworldconference.com \
NEXT_PUBLIC_BASE_PATH=/mechanical \
npx next build

# Step 5: Move output
echo "[5/5] Moving output..."
mv "$TEMP_DIR/out" "$OUT_DIR"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "==================================="
echo " BUILD COMPLETE!"
echo " Output: deploy-static/out/"
echo ""
echo " Upload contents of out/ to:"
echo " /home/USERNAME/public_html/mechanical/"
echo "==================================="
