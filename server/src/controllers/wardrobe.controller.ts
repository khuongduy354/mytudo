import { Request, Response, NextFunction } from "express";
import type { WardrobeService } from "../services/wardrobe.service.js";
import {
  wardrobeFiltersSchema,
  createWardrobeSchema,
  updateWardrobeSchema,
} from "@mytudo/shared";

export class WardrobeController {
  constructor(private wardrobeService: WardrobeService) {}

  getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const filters = wardrobeFiltersSchema.parse(req.query);
      const result = await this.wardrobeService.getItems(userId, filters);

      res.json({
        success: true,
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const item = await this.wardrobeService.getItem(id, userId);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Item not found" },
        });
      }

      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const item = await this.wardrobeService.createItem(userId, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const item = await this.wardrobeService.updateItem(id, userId, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      await this.wardrobeService.deleteItem(id, userId);
      res.json({ success: true, data: { message: "Item deleted" } });
    } catch (error) {
      next(error);
    }
  };

  getCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const count = await this.wardrobeService.getItemCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  };

  // ================================
  // WARDROBE MANAGEMENT
  // ================================

  getWardrobes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const wardrobes = await this.wardrobeService.getWardrobes(userId);
      res.json({ success: true, data: wardrobes });
    } catch (error) {
      next(error);
    }
  };

  getWardrobe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { wardrobeId } = req.params;
      const wardrobe = await this.wardrobeService.getWardrobe(
        wardrobeId,
        userId
      );

      if (!wardrobe) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Wardrobe not found" },
        });
      }

      res.json({ success: true, data: wardrobe });
    } catch (error) {
      next(error);
    }
  };

  createWardrobe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const wardrobe = await this.wardrobeService.createWardrobe(
        userId,
        req.body
      );
      res.status(201).json({ success: true, data: wardrobe });
    } catch (error) {
      next(error);
    }
  };

  updateWardrobe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { wardrobeId } = req.params;
      const wardrobe = await this.wardrobeService.updateWardrobe(
        wardrobeId,
        userId,
        req.body
      );
      res.json({ success: true, data: wardrobe });
    } catch (error) {
      next(error);
    }
  };

  deleteWardrobe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { wardrobeId } = req.params;
      await this.wardrobeService.deleteWardrobe(wardrobeId, userId);
      res.json({ success: true, data: { message: "Wardrobe deleted" } });
    } catch (error) {
      next(error);
    }
  };
}
