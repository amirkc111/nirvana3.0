#!/bin/bash
set -e

# Ensure Docker is in the PATH for Mac
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

echo "🚀 Step 1: Building and Pushing Backend (imbibetech/nirvana-backend)..."
cd backend
docker buildx build --platform linux/amd64,linux/arm64 --no-cache -t imbibetech/nirvana-backend:latest --push .
cd ..

echo "🏗️ Step 2: Building and Pushing Frontend (imbibetech/nirvana-frontend)..."
cd frontend
docker buildx build --platform linux/amd64,linux/arm64 --no-cache \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://fkckiknrclhadiosowwp.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrY2tpa25yY2xoYWRpb3Nvd3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTQyMzQsImV4cCI6MjA4MjA5MDIzNH0.UjcSZsaOBKFwHcLdKgthv0oOIUVPnRNkH0brjOO1sU0" \
  -t imbibetech/nirvana-frontend:latest --push .
cd ..

echo "✅ Done! Universal images pushed:"
echo "   - imbibetech/nirvana-backend:latest"
echo "   - imbibetech/nirvana-frontend:latest"
