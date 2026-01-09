import { Request, Response, NextFunction } from "express";
import type { UploadService } from "../services/upload.service.js";

export class UploadController {
  constructor(private uploadService: UploadService) {}

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
      }

      const imageUrl = await this.uploadService.uploadImage(
        userId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({ success: true, data: { imageUrl } });
    } catch (error) {
      next(error);
    }
  };
}
