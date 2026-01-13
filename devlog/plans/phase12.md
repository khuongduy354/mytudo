# MYTuDo - Feature Checklist

## Overview
Digital wardrobe + C2C marketplace for sustainable fashion. Users digitize their closet, then sell items from their wardrobe.

---

## Phase 1: Digital Wardrobe

### Authentication
- [x] Sign up/Login with Phone + OTP
- [x] Profile creation (name, avatar)

### Wardrobe Management
- [x] Add clothing items with image, category, color
- [x] View wardrobe items in grid
- [x] Filter by category
- [x] View item detail (at /wardrobe/:id)
- [x] Upload image with background removal
- [x] Multiple wardrobes (public/private) - backend ready
- [ ] Multiple wardrobes - frontend UI
- [ ] Move items between wardrobes - frontend UI

### Image Features
- [x] Upload to storage
- [x] Background removal (@imgly/background-removal)

---

## Phase 2: Marketplace

### Selling
- [x] Create listing from wardrobe item
- [x] Set price, condition, description
- [x] View my listings (Đang bán)
- [x] Show full item data like wardrobe view
- [x] Cancel listing

### Marketplace Feed
- [x] Browse active listings
- [x] Filter by category, price
- [x] Sort by newest/price
- [x] Add to wishlist from listing card

### Wishlist
- [x] View wishlist
- [x] Add to wishlist (from detail)
- [x] Add to wishlist (from list view)

---

## Phase 3: Orders

Backend complete (models, services, controllers, routes):
- [x] Order model with status (pending/accepted/rejected/completed/cancelled)
- [x] Create order on listing
- [x] Seller accept/reject order
- [x] Complete order - transfers item to buyer wardrobe
- [x] Cancel order

Frontend TODO:
- [ ] Place order button on listing detail
- [ ] Orders list page (buyer/seller views)
- [ ] Accept/reject/complete actions UI



