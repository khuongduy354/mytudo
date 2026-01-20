# MYTuDo - Digital Wardrobe & Marketplace

## 🧥 Test Users (Local Development)

| Email | Password | Name | Description |
|-------|----------|------|-------------|
| minhanh@test.com | Test@123 | Minh Anh | Gen Z office worker with trendy items |
| thuha@test.com | Test@123 | Thu Hà | Sustainable fashion student |
| lanphuong@test.com | Test@123 | Lan Phương | Minimalist mom |

## 🚀 Quick Start

# Option 1: Docker (Recommended)
```bash
./dockerize/scripts/dev.sh
```

Access:
- Client: http://localhost:5173
- Server: http://localhost:3000
- Supabase Studio: http://localhost:54323

See [DOCKER.md](./dockerize/README.md) for full Docker guide.

# Option 2: Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Supabase
```bash
npx supabase start
```

**Access Points:**
- Supabase Studio: http://localhost:54323
- Inbucket (Email Inbox): http://localhost:54324
- PostgreSQL: localhost:54322

### 3. Start Development Servers
```bash
npm run dev
```

This starts both client (http://localhost:5173) and server (http://localhost:3000).

## 📂 Project Structure

```
/client     - React + Vite frontend
/server     - Express.js backend with DI container
/shared     - Shared types and Zod schemas
/supabase   - Database migrations and config
/devlog     - Development documentation
```

## ✨ Features (Phase 1+2)

- ✅ Email/Password Authentication (no SMS needed for local dev)
- ✅ Digital Wardrobe Management (add, edit, delete items)
- ✅ Create Listings to Sell Items
- ✅ Marketplace Browse & Filter
- ✅ Wishlist
- ✅ User Profile

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, React Query, Zustand, React Router
- **Backend**: Express.js, TypeScript, Custom DI Container  
- **Database**: PostgreSQL via Supabase
- **Validation**: Zod (shared schemas)
- **Mobile**: Capacitor (planned)

## 📖 Documentation

See [devlog/Overview/](./devlog/Overview/) for:
- Architecture documentation
- Database schema (DBML)
- Requirements and design decisions

### Individual Commands

```bash
# Start only client
npm run dev:client

# Start only server  
npm run dev:server

# Build all
npm run build

# Reset database
npx supabase db reset
```

## 🐳 Docker Deployment

Full Docker setup with dev, staging, and production environments.

```bash
# Development
./dockerize/scripts/dev.sh

# Staging
./dockerize/scripts/stage.sh

# Production
./dockerize/scripts/prod.sh
```

See [DOCKER.md](./DOCKER.md) for comprehensive guide and [render.yaml](./render.yaml) for Render deployment.

## 🚢 Deploy to Render

1. Push to GitHub
2. Connect repo in Render dashboard
3. Configure environment variables (see dockerize/render/.env.template)
4. Deploy using render.yaml blueprint

See [dockerize/render/README.md](./dockerize/render/README.md) for details.
```
