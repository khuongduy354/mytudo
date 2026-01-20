#!/bin/bash

# Clean up Docker resources

set -e

cd "$(dirname "$0")/../.."

echo "🧹 Cleaning up Docker resources..."

# Stop all environments
./dockerize/scripts/stop-all.sh

# Remove all containers
echo "Removing containers..."
docker compose -f dockerize/docker-compose.dev.yml down -v 2>/dev/null || true
docker compose -f dockerize/docker-compose.stage.yml down -v 2>/dev/null || true
docker compose -f dockerize/docker-compose.prod.yml down -v 2>/dev/null || true

# Optionally remove images (uncomment if needed)
# echo "Removing images..."
# docker images | grep mytudo | awk '{print $3}' | xargs docker rmi -f

# Prune unused resources
echo "Pruning unused resources..."
docker system prune -f

echo "✅ Cleanup complete"
