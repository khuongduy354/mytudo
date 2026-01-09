import { apiClient } from "./client";
import type {
  ListingWithDetails,
  MarketplaceFilters,
  PaginatedResponse,
} from "@mytudo/shared";

export const marketplaceApi = {
  getListings: async (
    filters?: MarketplaceFilters
  ): Promise<{
    data: ListingWithDetails[];
    meta: PaginatedResponse<ListingWithDetails>["meta"];
  }> => {
    const response = await apiClient.get("/marketplace", { params: filters });
    return { data: response.data.data, meta: response.data.meta };
  },

  getListingDetails: async (id: string): Promise<ListingWithDetails> => {
    const response = await apiClient.get(`/marketplace/${id}`);
    return response.data.data;
  },

  // Alias for getListingDetails
  getListingById: async (id: string): Promise<{ data: ListingWithDetails }> => {
    const response = await apiClient.get(`/marketplace/${id}`);
    return { data: response.data.data };
  },
};
