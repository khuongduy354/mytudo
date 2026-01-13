import { apiClient } from "./client";
import type {
  Order,
  OrderWithDetails,
  CreateOrderRequest,
  PaginatedResponse,
} from "@mytudo/shared";

export const ordersApi = {
  getOrders: async (
    type: "buying" | "selling" = "buying",
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Order[]; meta: PaginatedResponse<Order>["meta"] }> => {
    const response = await apiClient.get("/orders", {
      params: { type, page, limit },
    });
    return { data: response.data.data, meta: response.data.meta };
  },

  getOrderById: async (id: string): Promise<{ data: OrderWithDetails }> => {
    const response = await apiClient.get(`/orders/${id}`);
    return { data: response.data.data };
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post("/orders", data);
    return response.data.data;
  },

  acceptOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.post(`/orders/${id}/accept`);
    return response.data.data;
  },

  rejectOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.post(`/orders/${id}/reject`);
    return response.data.data;
  },

  completeOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.post(`/orders/${id}/complete`);
    return response.data.data;
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    return response.data.data;
  },
};
