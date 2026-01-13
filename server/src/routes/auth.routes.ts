import { Router } from "express";
import { DIContainer, DI_KEYS } from "../di/container.js";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import {
  loginWithEmailSchema,
  registerWithEmailSchema,
  sendMagicLinkSchema,
  updateProfileSchema,
  refreshTokenSchema,
} from "@mytudo/shared";

export function createAuthRouter(container: DIContainer): Router {
  const router = Router();
  const controller = container.resolve<AuthController>(DI_KEYS.AUTH_CONTROLLER);

  // Email/password auth routes
  router.post(
    "/login",
    validateRequest(loginWithEmailSchema),
    controller.loginWithEmail
  );

  router.post(
    "/register",
    validateRequest(registerWithEmailSchema),
    controller.registerWithEmail
  );

  // Magic link auth route
  router.post(
    "/send-magic-link",
    validateRequest(sendMagicLinkSchema),
    controller.sendMagicLink
  );

  router.post(
    "/refresh",
    validateRequest(refreshTokenSchema),
    controller.refreshToken
  );

  // Protected routes
  router.get("/me", authenticate, controller.getMe);

  router.put(
    "/profile",
    authenticate,
    validateRequest(updateProfileSchema),
    controller.updateProfile
  );

  router.post("/logout", authenticate, controller.logout);

  return router;
}
