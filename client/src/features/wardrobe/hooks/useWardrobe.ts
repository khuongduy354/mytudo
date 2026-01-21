import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wardrobeApi } from "../../../api/wardrobe.api";
import type {
  WardrobeFilters,
  CreateWardrobeItemRequest,
  UpdateWardrobeItemRequest,
  CreateWardrobeRequest,
  UpdateWardrobeRequest,
} from "@/shared";

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

// Wardrobe management hooks
export function useWardrobes() {
  return useQuery({
    queryKey: ["wardrobes"],
    queryFn: wardrobeApi.getWardrobes,
  });
}

export function useWardrobeById(id: string | undefined) {
  return useQuery({
    queryKey: ["wardrobes", id],
    queryFn: () => wardrobeApi.getWardrobe(id!),
    enabled: !!id,
  });
}

export function useCreateWardrobe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWardrobeRequest) =>
      wardrobeApi.createWardrobe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobes"] });
    },
  });
}

export function useUpdateWardrobe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWardrobeRequest }) =>
      wardrobeApi.updateWardrobe(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["wardrobes"] });
      queryClient.invalidateQueries({ queryKey: ["wardrobes", id] });
    },
  });
}

export function useDeleteWardrobe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => wardrobeApi.deleteWardrobe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobes"] });
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
    },
  });
}
