# Docker Deployment Configuration

Centralized Docker configuration for mytudo application across dev, stage, and prod environments.

# Architecture

- client: React/Vite frontend
- server: Node.js/Express API backend
- bg-remove-service: Python FastAPI background removal service
- supabase: PostgreSQL database + auth/storage (via Supabase CLI)
- nginx: Reverse proxy (prod/stage only)

# Quick Start

# Development
```bash
./dockerize/scripts/dev.sh
```

# Staging
```bash
./dockerize/scripts/stage.sh
```

# Production (local test)
```bash
./dockerize/scripts/prod.sh
```

# Environment Files

Environment-specific configs in `dockerize/env/`:
- .env.dev
- .env.stage  
- .env.prod
- .env.supabase.dev
- .env.supabase.stage
- .env.supabase.prod

# Port Mappings

# Development
- Client: http://localhost:5173
- Server: http://localhost:3000
- BG Remove Service: http://localhost:8000
- Supabase Studio: http://localhost:54323
- PostgreSQL: localhost:54322

# Staging/Production
- Application: http://localhost (nginx)
- Supabase Studio: http://localhost:54323

# Render Deployment

See render.yaml in root and dockerize/render/ for Render-specific configs.

# Commands

# Build all services
```bash
docker compose -f dockerize/docker-compose.dev.yml build
```

# View logs
```bash
docker compose -f dockerize/docker-compose.dev.yml logs -f
```

# Stop all services
```bash
docker compose -f dockerize/docker-compose.dev.yml down
```

# Clean up everything (including volumes)
```bash
docker compose -f dockerize/docker-compose.dev.yml down -v
```

# Database

Supabase runs in a container using Supabase CLI. Migrations in `supabase/migrations/` are auto-applied.

# Reset database:
```bash
docker compose exec supabase supabase db reset
```
