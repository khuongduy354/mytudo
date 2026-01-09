import { Request, Response, NextFunction } from "express";
import { container, DI_KEYS } from "../di/container.js";
import type { ISupabaseClient } from "../di/supabase.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "No token provided" },
      });
    }

    const token = authHeader.split(" ")[1];
    const supabase = container.resolve<ISupabaseClient>(
      DI_KEYS.SUPABASE_CLIENT
    );

    const {
      data: { user },
      error,
    } = await supabase.getClient().auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid token" },
      });
    }

    (req as any).userId = user.id;
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication failed" },
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const supabase = container.resolve<ISupabaseClient>(
        DI_KEYS.SUPABASE_CLIENT
      );

      const { data: user, error } = await supabase
        .getClient()
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !user || !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Insufficient permissions" },
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Authorization failed" },
      });
    }
  };
};
