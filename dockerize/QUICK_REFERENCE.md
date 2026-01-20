# Docker Quick Reference

# Start Services

```bash
# Development (with hot-reload)
./dockerize/scripts/dev.sh

# Staging
./dockerize/scripts/stage.sh

# Production
./dockerize/scripts/prod.sh
```

# View Logs

```bash
# All services
docker compose -f dockerize/docker-compose.dev.yml logs -f

# Specific service
docker compose -f dockerize/docker-compose.dev.yml logs -f server
docker compose -f dockerize/docker-compose.dev.yml logs -f client
docker compose -f dockerize/docker-compose.dev.yml logs -f bg-remove
```

# Execute Commands in Containers

```bash
# Access server shell
docker compose -f dockerize/docker-compose.dev.yml exec server sh

# Access client shell
docker compose -f dockerize/docker-compose.dev.yml exec client sh

# Run npm commands in server
docker compose -f dockerize/docker-compose.dev.yml exec server npm run lint

# Reset database
docker compose -f dockerize/docker-compose.dev.yml exec supabase supabase db reset
```

# Stop Services

```bash
# Stop dev environment
docker compose -f dockerize/docker-compose.dev.yml down

# Stop all environments
./dockerize/scripts/stop-all.sh

# Stop and remove volumes
docker compose -f dockerize/docker-compose.dev.yml down -v
```

# Build Images

```bash
# Build dev environment
./dockerize/scripts/build.sh dev

# Build specific service
docker compose -f dockerize/docker-compose.dev.yml build server

# Build without cache
docker compose -f dockerize/docker-compose.dev.yml build --no-cache
```

# Troubleshooting

```bash
# Check service status
docker compose -f dockerize/docker-compose.dev.yml ps

# Check resource usage
docker compose -f dockerize/docker-compose.dev.yml top

# Restart specific service
docker compose -f dockerize/docker-compose.dev.yml restart server

# Clean up everything
./dockerize/scripts/cleanup.sh

# Remove dangling images
docker image prune -f

# View detailed container info
docker compose -f dockerize/docker-compose.dev.yml exec server env
```

# Port Mappings

# Development
- Client: http://localhost:5173
- Server: http://localhost:3000/api
- BG Remove: http://localhost:8000
- Supabase Studio: http://localhost:54323
- PostgreSQL: localhost:54322

# Staging/Production
- App: http://localhost (nginx)
- Supabase Studio: http://localhost:54323

# Environment Variables

Located in dockerize/env/:
- .env.dev - Development
- .env.stage - Staging
- .env.prod - Production

Edit these files to configure your environment.

# Common Tasks

# Install new npm package
```bash
# Add to package.json then rebuild
docker compose -f dockerize/docker-compose.dev.yml build server
docker compose -f dockerize/docker-compose.dev.yml up -d server
```

# Run migrations
```bash
docker compose -f dockerize/docker-compose.dev.yml exec supabase supabase db reset
```

# Access database directly
```bash
docker compose -f dockerize/docker-compose.dev.yml exec supabase psql postgresql://postgres:postgres@localhost:54322/postgres
```

# Update dependencies
```bash
# Stop services
docker compose -f dockerize/docker-compose.dev.yml down

# Rebuild with no cache
docker compose -f dockerize/docker-compose.dev.yml build --no-cache

# Start again
./dockerize/scripts/dev.sh
```
