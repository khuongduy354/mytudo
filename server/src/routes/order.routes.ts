import { Router } from "express";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { OrderController } from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export function createOrderRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<OrderController>(
    DI_KEYS.ORDER_CONTROLLER
  );

  // All routes require authentication
  router.use(authenticate);

  // Get my orders (buying or selling)
  router.get("/", controller.getMyOrders);

  // Create a new order
  router.post("/", controller.createOrder);

  // Get order details
  router.get("/:id", controller.getOrderDetails);

  // Accept order (seller)
  router.post("/:id/accept", controller.acceptOrder);

  // Reject order (seller)
  router.post("/:id/reject", controller.rejectOrder);

  // Complete order (seller)
  router.post("/:id/complete", controller.completeOrder);

  // Cancel order (buyer)
  router.post("/:id/cancel", controller.cancelOrder);

  return router;
}
