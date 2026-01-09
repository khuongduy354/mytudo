# MYTuDo - Technical Requirements

## Overview
MYTuDo is a digital wardrobe + C2C marketplace app for sustainable fashion. Users digitize their closet, then sell items "1-tap" from their wardrobe data.

**Stack:** React + Capacitor (web/mobile) | Express + TypeScript | Supabase (PostgreSQL + Auth)

---

## Phase 1: Digital Wardrobe (Core)

### 1.1 Authentication (Phone + OTP)
- **Sign up/Login:** Phone number + OTP via Supabase Auth
- **Profile creation:** Full name, avatar (optional)
- **Session:** JWT tokens (access + refresh)

**API Endpoints:**
```
POST /api/auth/send-otp     { phone }
POST /api/auth/verify-otp   { phone, otp }
GET  /api/auth/me
PUT  /api/auth/profile      { fullName, avatarUrl? }
POST /api/auth/logout
```

### 1.2 Wardrobe Items (CRUD)
User can add clothing items to their digital wardrobe.

**Item Properties:**
| Field | Type | Required |
|-------|------|----------|
| imageUrl | string | ✅ |
| category | enum | ✅ |
| color | string | ✅ |
| name | string | ❌ |
| brand | string | ❌ |
| size | string | ❌ |
| material | string | ❌ |
| purchasePrice | number | ❌ |

**Categories:** `tops`, `bottoms`, `footwear`, `accessories`

**API Endpoints:**
```
GET    /api/wardrobe              ?category&color&search&page&limit
GET    /api/wardrobe/:id
POST   /api/wardrobe              { imageUrl, category, color, name?, ... }
PUT    /api/wardrobe/:id          { ...updates }
DELETE /api/wardrobe/:id
```

### 1.3 Image Upload
- Upload to Supabase Storage
- Client-side background removal using `@imgly/background-removal`
- Returns public URL

**API Endpoints:**
```
POST /api/upload/image    multipart/form-data { file }
```

---

## Phase 2: Marketplace

### 2.1 Listings (Sell Items)
User can list wardrobe items for sale. Listing links to a wardrobe item.

**Listing Properties:**
| Field | Type | Required |
|-------|------|----------|
| wardrobeItemId | uuid | ✅ |
| price | number | ✅ |
| condition | enum | ✅ |
| description | string | ❌ |
| status | enum | auto |

**Conditions:** `new`, `like_new`, `used`
**Status:** `active`, `sold`, `removed`

**API Endpoints:**
```
POST   /api/listings              { wardrobeItemId, price, condition, description? }
GET    /api/listings/my           (seller's own listings)
PUT    /api/listings/:id          { price?, condition?, description?, status? }
DELETE /api/listings/:id          (soft delete - sets status to 'removed')
```

### 2.2 Marketplace Feed
Browse all active listings from all users.

**API Endpoints:**
```
GET /api/marketplace    ?category&minPrice&maxPrice&condition&search&sort&page&limit
GET /api/marketplace/:id
```

**Sort options:** `newest`, `price_asc`, `price_desc`

### 2.3 Wishlist
Users can save listings they're interested in.

**API Endpoints:**
```
POST   /api/wishlist/:listingId
DELETE /api/wishlist/:listingId
GET    /api/wishlist
```

---

## Client Pages

### Phase 1
| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Phone + OTP login |
| `/` | WardrobePage | Grid view of user's items |
| `/wardrobe/:id` | ItemDetailPage | View/edit single item |
| `/wardrobe/add` | AddItemPage | Camera/gallery + form |
| `/profile` | ProfilePage | User profile |

### Phase 2
| Route | Page | Description |
|-------|------|-------------|
| `/marketplace` | MarketplacePage | Browse all listings |
| `/marketplace/:id` | ListingDetailPage | View listing + seller info |
| `/sell/:wardrobeItemId` | CreateListingPage | Create listing from item |
| `/my-listings` | MyListingsPage | Manage user's listings |
| `/wishlist` | WishlistPage | Saved listings |

---

## Data Flow

```
[Client]
   │
   ├── React Query (data fetching)
   ├── Zustand (auth state)
   └── Capacitor (camera, storage)
         │
         ▼
    [API Layer]
   axios client with interceptors
         │
         ▼
    [Express Server]
         │
         ├── Routes → Controllers → Services → Models → Supabase
         │
         └── DI Container (dependency injection)
         │
         ▼
    [Supabase]
         ├── PostgreSQL (data)
         ├── Auth (phone OTP)
         └── Storage (images)
```

---

## Validation (Zod Schemas)
All request/response types defined in `shared/` package using Zod schemas.

---

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "field": ["error message"] }
  }
}
```

## Success Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

## Paginated Response Format
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
