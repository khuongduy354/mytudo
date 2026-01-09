import { apiClient } from "./client";
import type {
  WishlistItem,
  WishlistItemWithListing,
  PaginatedResponse,
} from "@mytudo/shared";

export const wishlistApi = {
  getWishlist: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: WishlistItemWithListing[];
    meta: PaginatedResponse<WishlistItemWithListing>["meta"];
  }> => {
    const response = await apiClient.get("/wishlist", {
      params: { page, limit },
    });
    return { data: response.data.data, meta: response.data.meta };
  },

  addToWishlist: async (listingId: string): Promise<WishlistItem> => {
    const response = await apiClient.post(`/wishlist/${listingId}`);
    return response.data.data;
  },

  removeFromWishlist: async (listingId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${listingId}`);
  },
};
