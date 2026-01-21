import { apiClient } from "./client";
import type {
  Listing,
  CreateListingRequest,
  UpdateListingRequest,
  PaginatedResponse,
} from "@/shared";

export const listingsApi = {
  createListing: async (data: CreateListingRequest): Promise<Listing> => {
    const response = await apiClient.post("/listings", data);
    return response.data.data;
  },

  getMyListings: async (
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Listing[]; meta: PaginatedResponse<Listing>["meta"] }> => {
    const response = await apiClient.get("/listings/my", {
      params: { page, limit },
    });
    return { data: response.data.data, meta: response.data.meta };
  },

  updateListing: async (
    id: string,
    data: UpdateListingRequest,
  ): Promise<Listing> => {
    const response = await apiClient.put(`/listings/${id}`, data);
    return response.data.data;
  },

  removeListing: async (id: string): Promise<Listing> => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data.data;
  },

  // Alias for removeListing
  deleteListing: async (id: string): Promise<Listing> => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data.data;
  },
};
