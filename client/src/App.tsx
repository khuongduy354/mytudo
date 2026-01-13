import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Feature Pages
import { LoginPage } from "./features/auth/pages/LoginPage";
import { WardrobePage } from "./features/wardrobe/pages/WardrobePage";
import { AddItemPage } from "./features/wardrobe/pages/AddItemPage";
import { WardrobeItemDetailPage } from "./features/wardrobe/pages/WardrobeItemDetailPage";
import { WardrobesPage } from "./features/wardrobe/pages/WardrobesPage";
import { EditWardrobePage } from "./features/wardrobe/pages/EditWardrobePage";
import { MarketplacePage } from "./features/marketplace/pages/MarketplacePage";
import { ListingDetailPage } from "./features/marketplace/pages/ListingDetailPage";
import { SellItemPage } from "./features/listings/pages/SellItemPage";
import { MyListingsPage } from "./features/listings/pages/MyListingsPage";
import { WishlistPage } from "./features/wishlist/pages/WishlistPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Wardrobe */}
          <Route path="/" element={<WardrobePage />} />
          <Route path="/wardrobe/add" element={<AddItemPage />} />
          <Route
            path="/wardrobe/:itemId"
            element={<WardrobeItemDetailPage />}
          />
          <Route path="/sell/:wardrobeItemId" element={<SellItemPage />} />

          {/* Wardrobes Management */}
          <Route path="/wardrobes" element={<WardrobesPage />} />
          <Route
            path="/wardrobes/:wardrobeId/edit"
            element={<EditWardrobePage />}
          />

          {/* Marketplace */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/listing/:listingId" element={<ListingDetailPage />} />

          {/* My Listings */}
          <Route path="/my-listings" element={<MyListingsPage />} />

          {/* Wishlist */}
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
