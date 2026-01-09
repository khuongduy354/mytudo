import { Router } from "express";
import multer from "multer";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { UploadController } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export function createUploadRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<UploadController>(
    DI_KEYS.UPLOAD_CONTROLLER
  );

  router.post(
    "/image",
    authenticate,
    upload.single("file"),
    controller.uploadImage
  );

  return router;
}
