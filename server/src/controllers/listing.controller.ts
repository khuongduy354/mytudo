import { Request, Response, NextFunction } from "express";
import type { ListingService } from "../services/listing.service.js";
import { marketplaceFiltersSchema } from "../shared";

export class ListingController {
  constructor(private listingService: ListingService) {}

  createListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const listing = await this.listingService.createListing(userId, req.body);
      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  };

  getMyListings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await this.listingService.getMyListings(
        userId,
        page,
        limit,
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

  updateListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const listing = await this.listingService.updateListing(
        id,
        userId,
        req.body,
      );
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  };

  removeListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const listing = await this.listingService.removeListing(id, userId);
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  };

  getMarketplace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId; // May be undefined for non-authenticated users
      const filters = marketplaceFiltersSchema.parse(req.query);

      const result = await this.listingService.getMarketplace(filters, userId);

      res.json({
        success: true,
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getListingDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const listing = await this.listingService.getListingDetails(id, userId);

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Listing not found" },
        });
      }

      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  };
}
