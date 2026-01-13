import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "../../../api";
import type { ListingStatus, ItemCategory } from "@mytudo/shared";

export function useMarketplace(filters?: {
  category?: ItemCategory;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["marketplace", filters],
    queryFn: () => marketplaceApi.getListings(filters),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache in garbage collection
  });
}

export function useListingDetail(listingId: string) {
  return useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => marketplaceApi.getListingById(listingId),
    enabled: !!listingId,
  });
}
