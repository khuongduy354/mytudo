#!/bin/bash

# Build all Docker images

set -e

cd "$(dirname "$0")/../.."

ENV=${1:-dev}

echo "🔨 Building Docker images for $ENV environment..."

case $ENV in
    dev)
        docker compose -f dockerize/docker-compose.dev.yml build
        ;;
    stage)
        docker compose -f dockerize/docker-compose.stage.yml build
        ;;
    prod)
        docker compose -f dockerize/docker-compose.prod.yml build
        ;;
    *)
        echo "Usage: $0 [dev|stage|prod]"
        exit 1
        ;;
esac

echo "✅ Build complete for $ENV environment"
