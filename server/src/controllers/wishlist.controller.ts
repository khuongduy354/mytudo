import { Request, Response, NextFunction } from "express";
import type { WishlistService } from "../services/wishlist.service.js";

export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await this.wishlistService.getWishlist(
        userId,
        page,
        limit
      );

      res.json({
        success: true,
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { listingId } = req.params;

      const wishlistItem = await this.wishlistService.addToWishlist(
        userId,
        listingId
      );

      res.status(201).json({ success: true, data: wishlistItem });
    } catch (error) {
      next(error);
    }
  };

  removeFromWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).userId;
      const { listingId } = req.params;

      await this.wishlistService.removeFromWishlist(userId, listingId);

      res.json({ success: true, data: { message: "Removed from wishlist" } });
    } catch (error) {
      next(error);
    }
  };
}
