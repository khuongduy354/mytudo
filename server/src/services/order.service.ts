import type { OrderModel } from "../models/order.model.js";
import type { ListingModel } from "../models/listing.model.js";
import type { WardrobeModel } from "../models/wardrobe.model.js";
import type {
  Order,
  OrderWithDetails,
  CreateOrderRequest,
  PaginationMeta,
} from "../shared";

export class OrderService {
  constructor(
    private orderModel: OrderModel,
    private listingModel: ListingModel,
    private wardrobeModel: WardrobeModel,
  ) {}

  async createOrder(buyerId: string, data: CreateOrderRequest): Promise<Order> {
    // Get the listing
    const listing = await this.listingModel.findById(data.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.status !== "active") {
      throw new Error("Listing is no longer available");
    }

    if (listing.sellerId === buyerId) {
      throw new Error("Cannot order your own listing");
    }

    // Check if buyer already has pending order for this listing
    const existingOrders = await this.orderModel.findByListing(data.listingId);
    const hasPendingOrder = existingOrders.some(
      (o) => o.buyerId === buyerId && o.status === "pending",
    );
    if (hasPendingOrder) {
      throw new Error("You already have a pending order for this listing");
    }

    return this.orderModel.create(buyerId, listing.sellerId, data);
  }

  async getMyOrders(
    userId: string,
    type: "buying" | "selling",
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: Order[]; meta: PaginationMeta }> {
    if (type === "buying") {
      return this.orderModel.findByBuyer(userId, page, limit);
    }
    return this.orderModel.findBySeller(userId, page, limit);
  }

  async getOrderDetails(
    orderId: string,
    userId: string,
  ): Promise<OrderWithDetails | null> {
    const order = await this.orderModel.findByIdWithDetails(orderId);
    if (!order) return null;

    // Check if user is buyer or seller
    if (order.buyerId !== userId && order.sellerId !== userId) {
      return null;
    }

    return order;
  }

  async acceptOrder(orderId: string, sellerId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.sellerId !== sellerId) {
      throw new Error("Access denied");
    }

    if (order.status !== "pending") {
      throw new Error("Order cannot be accepted");
    }

    return this.orderModel.update(orderId, { status: "accepted" });
  }

  async rejectOrder(orderId: string, sellerId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.sellerId !== sellerId) {
      throw new Error("Access denied");
    }

    if (order.status !== "pending") {
      throw new Error("Order cannot be rejected");
    }

    return this.orderModel.update(orderId, { status: "rejected" });
  }

  async completeOrder(orderId: string, sellerId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.sellerId !== sellerId) {
      throw new Error("Access denied");
    }

    if (order.status !== "accepted") {
      throw new Error("Order must be accepted before completing");
    }

    // Get the listing to find the wardrobe item
    const listing = await this.listingModel.findById(order.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    // Get buyer's default wardrobe
    const buyerWardrobe = await this.wardrobeModel.getDefaultWardrobe(
      order.buyerId,
    );
    if (!buyerWardrobe) {
      throw new Error("Buyer has no default wardrobe");
    }

    // Transfer ownership of the wardrobe item to buyer's default wardrobe
    await this.wardrobeModel.transferOwnership(
      listing.wardrobeItemId,
      order.buyerId,
      buyerWardrobe.id,
    );

    // Mark listing as sold
    await this.listingModel.update(listing.id, sellerId, { status: "sold" });

    return this.orderModel.update(orderId, { status: "completed" });
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Only buyer can cancel pending orders
    if (order.buyerId !== userId) {
      throw new Error("Access denied");
    }

    if (order.status !== "pending") {
      throw new Error("Order cannot be cancelled");
    }

    return this.orderModel.update(orderId, { status: "cancelled" });
  }
}
