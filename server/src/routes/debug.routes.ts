import { Router } from "express";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { DebugController } from "../controllers/debug.controller.js";

export function createDebugRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<DebugController>(
    DI_KEYS.DEBUG_CONTROLLER
  );

  router.post("/embedding", controller.saveEmbedding);
  router.get("/items", controller.getWardrobeItems);

  return router;
}
