#!/bin/bash

# Stop all environments

set -e

cd "$(dirname "$0")/../.."

echo "🛑 Stopping all Docker environments..."

# Stop Supabase first
cd dockerize/supabase
if docker compose ps -q 2>/dev/null | grep -q .; then
    echo "Stopping Supabase..."
    docker compose down
fi
cd ../..

# Stop dev
if docker compose -f dockerize/docker-compose.dev.yml ps -q 2>/dev/null | grep -q .; then
    echo "Stopping development..."
    docker compose -f dockerize/docker-compose.dev.yml down
fi

# Stop staging
if docker compose -f dockerize/docker-compose.stage.yml ps -q 2>/dev/null | grep -q .; then
    echo "Stopping staging..."
    docker compose -f dockerize/docker-compose.stage.yml down
fi

# Stop production
if docker compose -f dockerize/docker-compose.prod.yml ps -q 2>/dev/null | grep -q .; then
    echo "Stopping production..."
    docker compose -f dockerize/docker-compose.prod.yml down
fi

echo "✅ All environments stopped"
