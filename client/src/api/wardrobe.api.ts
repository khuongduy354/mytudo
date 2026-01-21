import { apiClient } from "./client";
import type {
  WardrobeItem,
  CreateWardrobeItemRequest,
  UpdateWardrobeItemRequest,
  WardrobeFilters,
  PaginatedResponse,
  Wardrobe,
  CreateWardrobeRequest,
  UpdateWardrobeRequest,
} from "@/shared";

export const wardrobeApi = {
  getItems: async (
    filters?: WardrobeFilters,
  ): Promise<{
    data: WardrobeItem[];
    meta: PaginatedResponse<WardrobeItem>["meta"];
  }> => {
    const response = await apiClient.get("/wardrobe", { params: filters });
    return { data: response.data.data, meta: response.data.meta };
  },

  getItem: async (id: string): Promise<WardrobeItem> => {
    const response = await apiClient.get(`/wardrobe/${id}`);
    return response.data.data;
  },

  // Alias for getItem with wrapped response
  getWardrobeItemById: async (id: string): Promise<{ data: WardrobeItem }> => {
    const response = await apiClient.get(`/wardrobe/${id}`);
    return { data: response.data.data };
  },

  createItem: async (
    data: CreateWardrobeItemRequest,
  ): Promise<WardrobeItem> => {
    const response = await apiClient.post("/wardrobe", data);
    return response.data.data;
  },

  updateItem: async (
    id: string,
    data: UpdateWardrobeItemRequest,
  ): Promise<WardrobeItem> => {
    const response = await apiClient.put(`/wardrobe/${id}`, data);
    return response.data.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/wardrobe/${id}`);
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get("/wardrobe/count");
    return response.data.data.count;
  },

  // Wardrobe management
  getWardrobes: async (): Promise<Wardrobe[]> => {
    const response = await apiClient.get("/wardrobe/wardrobes/list");
    return response.data.data;
  },

  getWardrobe: async (id: string): Promise<Wardrobe> => {
    const response = await apiClient.get(`/wardrobe/wardrobes/${id}`);
    return response.data.data;
  },

  createWardrobe: async (data: CreateWardrobeRequest): Promise<Wardrobe> => {
    const response = await apiClient.post("/wardrobe/wardrobes", data);
    return response.data.data;
  },

  updateWardrobe: async (
    id: string,
    data: UpdateWardrobeRequest,
  ): Promise<Wardrobe> => {
    const response = await apiClient.put(`/wardrobe/wardrobes/${id}`, data);
    return response.data.data;
  },

  deleteWardrobe: async (id: string): Promise<void> => {
    await apiClient.delete(`/wardrobe/wardrobes/${id}`);
  },
};
