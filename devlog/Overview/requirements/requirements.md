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


### 1.3 Image Upload
- Upload to Supabase Storage
- Client-side background removal using `@imgly/background-removal`
- Returns public URL

### 1.4 Image to metadata extraction 

- Unimplemented

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


### 2.2 Marketplace Feed
Browse all active listings from all users.


**Sort options:** `newest`, `price_asc`, `price_desc`

### 2.3 Wishlist
Users can save listings they're interested in.



