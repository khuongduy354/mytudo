import { Router } from "express";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { ListingController } from "../controllers/listing.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { createListingSchema, updateListingSchema } from "@mytudo/shared";
import type { ISupabaseClient } from "../di/supabase.js";

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
  // This doesn't fail if auth is invalid - it just proceeds without userId
  const optionalAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    console.log(
      "DEBUG optionalAuth - Auth header:",
      authHeader ? "present" : "absent"
    );
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      console.log(
        "DEBUG optionalAuth - Token:",
        token.substring(0, 20) + "..."
      );
      try {
        const supabase = container.resolve<ISupabaseClient>(
          DI_KEYS.SUPABASE_CLIENT
        );
        const {
          data: { user },
        } = await supabase.getClient().auth.getUser(token);
        console.log(
          "DEBUG optionalAuth - User from token:",
          user ? user.id : "null"
        );
        if (user) {
          req.userId = user.id;
          req.user = user;
        }
      } catch (error) {
        // Ignore auth errors for optional auth
        console.log("DEBUG optionalAuth - Auth error:", error);
      }
    }
    console.log(
      "DEBUG optionalAuth - Final req.userId:",
      req.userId || "undefined"
    );
    next();
  };

  router.get("/", optionalAuth, controller.getMarketplace);
  router.get("/:id", optionalAuth, controller.getListingDetails);

  return router;
}
