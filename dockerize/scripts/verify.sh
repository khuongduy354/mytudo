#!/bin/bash

# Verification script to check if everything is ready for deployment

set -e

cd "$(dirname "$0")/../.."

echo "🔍 Verifying mytudo Docker setup..."
echo ""

# Check Docker installation
echo "1. Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "   ❌ Docker not installed"
    exit 1
fi
echo "   ✅ Docker: $(docker --version)"

if ! command -v docker compose &> /dev/null; then
    echo "   ❌ Docker Compose not installed"
    exit 1
fi
echo "   ✅ Docker Compose: $(docker compose version)"
echo ""

# Check required files
echo "2. Checking required files..."
FILES=(
    "dockerize/docker-compose.dev.yml"
    "dockerize/docker-compose.stage.yml"
    "dockerize/docker-compose.prod.yml"
    "dockerize/env/.env.dev"
    "client/Dockerfile"
    "client/Dockerfile.dev"
    "server/Dockerfile"
    "server/Dockerfile.dev"
    "bg-remove-service/Dockerfile"
    "render.yaml"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
        exit 1
    fi
done
echo ""

# Check scripts are executable
echo "3. Checking scripts..."
SCRIPTS=(
    "dockerize/scripts/dev.sh"
    "dockerize/scripts/stage.sh"
    "dockerize/scripts/prod.sh"
    "dockerize/scripts/build.sh"
    "dockerize/scripts/stop-all.sh"
    "dockerize/scripts/cleanup.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -x "$script" ]; then
        echo "   ✅ $script (executable)"
    else
        echo "   ⚠️  $script (not executable, fixing...)"
        chmod +x "$script"
    fi
done
echo ""

# Validate docker-compose files
echo "4. Validating docker-compose configurations..."
if docker compose -f dockerize/docker-compose.dev.yml config --quiet 2>&1 | grep -i "error"; then
    echo "   ❌ docker-compose.dev.yml has errors"
    exit 1
else
    echo "   ✅ docker-compose.dev.yml is valid"
fi

if docker compose -f dockerize/docker-compose.stage.yml config --quiet 2>&1 | grep -i "error"; then
    echo "   ❌ docker-compose.stage.yml has errors"
    exit 1
else
    echo "   ✅ docker-compose.stage.yml is valid"
fi

if docker compose -f dockerize/docker-compose.prod.yml config --quiet 2>&1 | grep -i "error"; then
    echo "   ❌ docker-compose.prod.yml has errors"
    exit 1
else
    echo "   ✅ docker-compose.prod.yml is valid"
fi
echo ""

# Check environment variables
echo "5. Checking environment configuration..."
if grep -q "SUPABASE_URL" dockerize/env/.env.dev; then
    echo "   ✅ .env.dev has SUPABASE_URL"
else
    echo "   ❌ .env.dev missing SUPABASE_URL"
fi

if grep -q "SUPABASE_ANON_KEY" dockerize/env/.env.dev; then
    echo "   ✅ .env.dev has SUPABASE_ANON_KEY"
else
    echo "   ❌ .env.dev missing SUPABASE_ANON_KEY"
fi

if grep -q "SUPABASE_SERVICE_KEY" dockerize/env/.env.dev; then
    echo "   ✅ .env.dev has SUPABASE_SERVICE_KEY"
else
    echo "   ❌ .env.dev missing SUPABASE_SERVICE_KEY"
fi
echo ""

# Check for old .env.local
echo "6. Checking for legacy files..."
if [ -f "server/.env.local" ]; then
    echo "   ⚠️  server/.env.local still exists (should be removed)"
else
    echo "   ✅ No legacy .env.local files"
fi

if [ -f "server/.env.dev" ]; then
    echo "   ✅ server/.env.dev exists"
else
    echo "   ❌ server/.env.dev missing"
fi
echo ""

# TypeScript build check
echo "7. Testing TypeScript builds..."
cd server
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Server TypeScript compiles successfully"
else
    echo "   ❌ Server TypeScript build failed"
    exit 1
fi
cd ..
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All checks passed!"
echo ""
echo "📋 Next steps:"
echo "   1. Start development: ./dockerize/scripts/dev.sh"
echo "   2. Test locally"
echo "   3. Create Supabase Cloud project for production"
echo "   4. Update dockerize/env/.env.stage and .env.prod"
echo "   5. Deploy to Render using render.yaml"
echo ""
echo "📚 Documentation:"
echo "   - DOCKER.md - Comprehensive guide"
echo "   - dockerize/CHECKLIST.md - Deployment checklist"
echo "   - dockerize/QUICK_REFERENCE.md - Command reference"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
