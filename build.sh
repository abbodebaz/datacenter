#!/usr/bin/env bash
# ============================================================
# Bayt Alebaa PDC — Production Build Script
# 1. Build the React frontend
# 2. Collect Django static files
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/data_center/pdc_frontend"
BACKEND_DIR="$SCRIPT_DIR/data_center/pdc_backend"

echo "==> [1/3] Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install --legacy-peer-deps

echo "==> [2/3] Building React frontend..."
npm run build
echo "    React build complete: $FRONTEND_DIR/dist"

echo "==> [3/3] Collecting Django static files..."
cd "$BACKEND_DIR"
DJANGO_SETTINGS_MODULE=pdc_backend.settings.production \
    python manage.py collectstatic --noinput --clear 2>&1 || true

echo "==> Build complete."
