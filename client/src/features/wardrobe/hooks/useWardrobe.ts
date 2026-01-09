import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wardrobeApi } from "../../../api/wardrobe.api";
import type {
  WardrobeFilters,
  CreateWardrobeItemRequest,
  UpdateWardrobeItemRequest,
} from "@mytudo/shared";

export function useWardrobe(filters?: WardrobeFilters) {
  return useQuery({
    queryKey: ["wardrobe", filters],
    queryFn: () => wardrobeApi.getItems(filters),
  });
}

export function useWardrobeItem(id: string | undefined) {
  return useQuery({
    queryKey: ["wardrobe", id],
    queryFn: () => wardrobeApi.getItem(id!),
    enabled: !!id,
  });
}

export function useWardrobeCount() {
  return useQuery({
    queryKey: ["wardrobe", "count"],
    queryFn: wardrobeApi.getCount,
  });
}

export function useCreateWardrobeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWardrobeItemRequest) =>
      wardrobeApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
    },
  });
}

export function useUpdateWardrobeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWardrobeItemRequest;
    }) => wardrobeApi.updateItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["wardrobe", id] });
    },
  });
}

export function useDeleteWardrobeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => wardrobeApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
    },
  });
}
