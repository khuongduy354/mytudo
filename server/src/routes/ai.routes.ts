import { Router } from "express";
import multer from "multer";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { AiController } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export function createAiRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<AiController>(DI_KEYS.AI_CONTROLLER);

  // Apply authentication if needed, or leave public depending on requirements.
  // Assuming these should be authenticated features.
  router.use(authenticate);

  router.post(
    "/extract-attributes",
    upload.single("file"),
    controller.extractAttributes
  );

  router.post(
    "/batch/extract-attributes",
    upload.array("files", 10), // Limit to 10 files
    controller.extractAttributesBatch
  );

  router.post(
    "/generate-embedding",
    upload.single("file"),
    controller.generateEmbedding
  );

  router.post(
    "/remove-bg",
    upload.single("file"),
    controller.removeBackground
  );

  return router;
}
