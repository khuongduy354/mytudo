#!/bin/bash

# Production environment startup script

set -e

cd "$(dirname "$0")/../.."

echo "🚀 Starting mytudo production environment..."

# Load environment variables safely
if [ -f "dockerize/env/.env.prod" ]; then
    export $(grep -v '^#' dockerize/env/.env.prod | grep -v '^$' | xargs)
else
    echo "❌ Error: dockerize/env/.env.prod not found"
    echo "   Please create it from dockerize/env/.env.template"
    exit 1
fi

echo ""
echo "📦 Starting Supabase stack..."
cd dockerize/supabase

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating Supabase .env from example..."
    cp .env.example .env
fi

# Check if Supabase is already running
if docker compose ps -q 2>/dev/null | grep -q .; then
    echo "   ℹ️  Supabase is already running"
else
    # Start Supabase
    docker compose up -d
fi

echo "   Waiting for Supabase to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/rest/v1/ > /dev/null 2>&1; then
        echo "   ✅ Supabase is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ⚠️  Supabase took too long to start, but continuing..."
    fi
    sleep 2
done

cd ../..

echo ""
echo "🐳 Starting application services..."

# Start services
docker compose -f dockerize/docker-compose.prod.yml up --build -d

echo "✅ Production environment started"
echo "📊 View logs: docker compose -f dockerize/docker-compose.prod.yml logs -f"
