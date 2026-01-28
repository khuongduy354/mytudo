import { Router } from "express";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { WardrobeController } from "../controllers/wardrobe.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  createWardrobeItemSchema,
  updateWardrobeItemSchema,
  createWardrobeSchema,
  updateWardrobeSchema,
} from "../shared";

export function createWardrobeRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<WardrobeController>(
    DI_KEYS.WARDROBE_CONTROLLER,
  );

  // All routes require authentication
  router.use(authenticate);

  // Wardrobe items routes
  router.get("/", controller.getItems);
  router.get("/count", controller.getCount);
  router.get("/:id", controller.getItem);

  router.post(
    "/",
    validateRequest(createWardrobeItemSchema),
    controller.createItem,
  );

  router.put(
    "/:id",
    validateRequest(updateWardrobeItemSchema),
    controller.updateItem,
  );

  router.delete("/:id", controller.deleteItem);

  // Wardrobes management routes
  router.get("/wardrobes/list", controller.getWardrobes);
  router.get("/wardrobes/:wardrobeId", controller.getWardrobe);

  router.post(
    "/wardrobes",
    validateRequest(createWardrobeSchema),
    controller.createWardrobe,
  );

  router.put(
    "/wardrobes/:wardrobeId",
    validateRequest(updateWardrobeSchema),
    controller.updateWardrobe,
  );

  router.delete("/wardrobes/:wardrobeId", controller.deleteWardrobe);

  return router;
}
