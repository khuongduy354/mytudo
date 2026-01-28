// Order types

import type { ListingWithDetails } from "./listing";
import type { UserProfile } from "./auth";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithDetails extends Order {
  listing: ListingWithDetails;
  buyer: Pick<UserProfile, "id" | "fullName" | "avatarUrl">;
  seller: Pick<UserProfile, "id" | "fullName" | "avatarUrl">;
}

export interface CreateOrderRequest {
  listingId: string;
  message?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  accepted: "Đã chấp nhận",
  rejected: "Đã từ chối",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};
