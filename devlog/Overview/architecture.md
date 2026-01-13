# MYTuDo Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  React + Vite + Capacitor (Web & Mobile)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Zustand │  │ React Query │  │  Capacitor  │             │
│  │ (Auth)  │  │   (Data)    │  │ (Native API)│             │
│  └────┬────┘  └──────┬──────┘  └──────┬──────┘             │
│       │              │                │                     │
│       └──────────────┼────────────────┘                     │
│                      ▼                                      │
│              ┌──────────────┐                               │
│              │  API Client  │  axios + interceptors         │
│              └──────┬───────┘                               │
└─────────────────────┼───────────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                               │
│  Express + TypeScript                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌────────────┐    ┌──────────┐             │
│  │ Routes  │───►│ Controller │───►│ Service  │             │
│  └─────────┘    └────────────┘    └────┬─────┘             │
│                                        │                    │
│  ┌──────────────────────────────┐     │                    │
│  │  Middleware                   │     │                    │
│  │  - auth.middleware.ts         │     ▼                    │
│  │  - error.middleware.ts        │  ┌─────────┐             │
│  │  - validation.middleware.ts   │  │  Model  │             │
│  └──────────────────────────────┘  └────┬────┘             │
│                                         │                   │
│  ┌──────────────────────────────┐      │                    │
│  │  DI Container                 │      │                    │
│  │  - container.ts (core)        │◄─────┘                   │
│  │  - dev.container.ts           │                          │
│  │  - prod.container.ts          │                          │
│  │  - supabase.ts (client)       │                          │
│  └───────────────┬──────────────┘                          │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │      │
│  │   (Tables)   │  │  (Phone OTP) │  │   (Images)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
mytudo/
├── client/                 # React + Vite + Capacitor
│   ├── src/
│   │   ├── api/           # API client & endpoints
│   │   │   ├── client.ts  # Axios instance + interceptors
│   │   │   └── *.api.ts   # Feature-specific API calls
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature modules
│   │   │   └── [feature]/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── pages/
│   │   ├── hooks/         # Shared hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── App.tsx        # Routes
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── server/                 # Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data access (Supabase queries)
│   │   ├── routes/        # Express routers
│   │   ├── middleware/    # Auth, error, validation
│   │   ├── di/            # Dependency injection
│   │   │   ├── container.ts
│   │   │   ├── dev.container.ts
│   │   │   ├── prod.container.ts
│   │   │   ├── supabase.ts
│   │   │   └── index.ts
│   │   ├── utils/         # Helpers
│   │   └── index.ts       # Entry point
│   └── package.json
│
├── shared/                 # Shared types & schemas
│   ├── src/
│   │   ├── types/         # TypeScript types
│   │   └── schemas/       # Zod validation schemas
│   └── package.json
│
├── supabase/
│   └── migrations/        # SQL migrations
│
└── package.json           # Workspace root
```

---

## Patterns

### Dependency Injection
Simple DI container without external libraries:

```typescript
// Register
container.registerFactory('UserModel', () => new UserModel(supabase));

// Resolve
const model = container.resolve<UserModel>('UserModel');
```

### Service Layer
- **Controller:** HTTP request/response handling
- **Service:** Business logic, orchestration
- **Model:** Database queries via Supabase client

### Client State Management
- **Zustand:** Auth state (tokens, user)
- **React Query:** Server state (wardrobe, listings)

### API Client
Axios with interceptors for:
- Adding auth token to requests
- Handling 401 → refresh token flow
- Redirecting to login on auth failure

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase client |
| `zod` | Schema validation |
| `express` | HTTP server |
| `axios` | HTTP client |
| `zustand` | Client state |
| `@tanstack/react-query` | Server state |
| `react-router-dom` | Routing |
| `@imgly/background-removal` | Image background removal |

---

## Database Schema

```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │    wardrobes    │
├─────────────────┤     ├─────────────────┤
│ id              │◄────│ user_id         │
│ phone           │     │ id              │
│ name            │     │ name            │
│ avatar_url      │     │ visibility      │ (public/private)
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ wardrobe_items  │
                        ├─────────────────┤
                        │ id              │
                        │ wardrobe_id     │────┐
                        │ user_id         │    │
                        │ category        │    │
                        │ color           │    │
                        │ image_url       │    │
                        └────────┬────────┘    │
                                 │             │
        ┌────────────────────────┘             │
        ▼                                      │
┌─────────────────┐     ┌─────────────────┐   │
│    listings     │     │     orders      │   │
├─────────────────┤     ├─────────────────┤   │
│ id              │◄────│ listing_id      │   │
│ wardrobe_item_id│     │ id              │   │
│ seller_id       │     │ buyer_id        │   │
│ price           │     │ seller_id       │   │
│ status          │     │ status          │   │
│ (active/sold)   │     │ (pending/       │   │
└─────────────────┘     │  accepted/      │   │
                        │  rejected/      │   │
                        │  completed/     │   │
                        │  cancelled)     │   │
                        │ wardrobe_id     │───┘
                        └─────────────────┘
                         (buyer target wardrobe)
```

Order flow: Place order → Seller accepts → Complete → Item transferred to buyer's wardrobe
