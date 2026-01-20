#!/bin/bash

# First-time setup script for Docker deployment

set -e

echo "🎉 Welcome to mytudo Docker Setup!"
echo ""

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed: $(docker --version)"
echo "✅ Docker Compose is installed: $(docker compose version)"
echo ""

# Check if environment files exist
if [ ! -f "dockerize/env/.env.dev" ]; then
    echo "📝 Creating development environment file..."
    cp dockerize/env/.env.template dockerize/env/.env.dev
    echo "⚠️  Please edit dockerize/env/.env.dev and add your Supabase credentials"
    echo ""
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x dockerize/scripts/*.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Edit environment variables:"
echo "   nano dockerize/env/.env.dev"
echo ""
echo "2. Add your Supabase credentials:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_KEY"
echo ""
echo "3. Start development environment:"
echo "   ./dockerize/scripts/dev.sh"
echo ""
echo "4. Access your app:"
echo "   - Client: http://localhost:5173"
echo "   - Server: http://localhost:3000"
echo "   - Supabase Studio: http://localhost:54323"
echo ""
echo "📖 For more help, see:"
echo "   - DOCKER.md - Comprehensive guide"
echo "   - dockerize/README.md - Quick reference"
echo "   - dockerize/CHECKLIST.md - Testing checklist"
echo ""
