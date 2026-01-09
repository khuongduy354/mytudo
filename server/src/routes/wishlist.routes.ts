import { Router } from "express";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { WishlistController } from "../controllers/wishlist.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export function createWishlistRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<WishlistController>(
    DI_KEYS.WISHLIST_CONTROLLER
  );

  // All routes require authentication
  router.use(authenticate);

  router.get("/", controller.getWishlist);
  router.post("/:listingId", controller.addToWishlist);
  router.delete("/:listingId", controller.removeFromWishlist);

  return router;
}
