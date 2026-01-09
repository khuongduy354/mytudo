import { Router } from "express";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { ListingController } from "../controllers/listing.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { createListingSchema, updateListingSchema } from "@mytudo/shared";

export function createListingRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<ListingController>(
    DI_KEYS.LISTING_CONTROLLER
  );

  // Protected routes for managing listings
  router.post(
    "/",
    authenticate,
    validateRequest(createListingSchema),
    controller.createListing
  );

  router.get("/my", authenticate, controller.getMyListings);

  router.put(
    "/:id",
    authenticate,
    validateRequest(updateListingSchema),
    controller.updateListing
  );

  router.delete("/:id", authenticate, controller.removeListing);

  return router;
}

export function createMarketplaceRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<ListingController>(
    DI_KEYS.LISTING_CONTROLLER
  );

  // Optional auth for marketplace (to get wishlist status)
  const optionalAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Try to authenticate but don't fail if invalid
      authenticate(req, res, (err: any) => {
        // Proceed regardless of auth result
        next();
      });
    } else {
      next();
    }
  };

  router.get("/", optionalAuth, controller.getMarketplace);
  router.get("/:id", optionalAuth, controller.getListingDetails);

  return router;
}
