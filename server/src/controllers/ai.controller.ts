import { Request, Response, NextFunction } from "express";
import type { AiService } from "../services/ai.service.js";

export class AiController {
  constructor(private aiService: AiService) {}

  extractAttributes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
      }

      const result = await this.aiService.extractAttributes(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  extractAttributesBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No files provided" },
        });
      }

      const files = req.files as Express.Multer.File[];
      const result = await this.aiService.extractAttributesBatch(files);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  generateEmbedding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
      }

      const result = await this.aiService.generateEmbedding(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  removeBackground = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No file provided" },
        });
      }

      const imageBuffer = await this.aiService.removeBackground(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.set("Content-Type", "image/png");
      res.send(imageBuffer);
    } catch (error) {
      next(error);
    }
  };
}
