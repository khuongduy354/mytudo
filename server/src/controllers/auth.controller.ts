import { Request, Response, NextFunction } from "express";
import type { AuthService } from "../services/auth.service.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  // Email/password authentication
  loginWithEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.loginWithEmail(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  registerWithEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.authService.registerWithEmail(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Magic link authentication
  sendMagicLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.sendMagicLink(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const user = await this.authService.getMe(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const user = await this.authService.updateProfile(userId, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (token) {
        await this.authService.logout(token);
      }

      res.json({ success: true, data: { message: "Logged out successfully" } });
    } catch (error) {
      // Still return success even if server logout fails
      res.json({ success: true, data: { message: "Logged out" } });
    }
  };
}
