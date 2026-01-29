import { Request, Response, NextFunction } from "express";
import { DebugService } from "../services/debug.service.js";

export class DebugController {
  constructor(private debugService: DebugService) {}

  saveEmbedding = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { imageUrl, embedding, filename } = req.body;

      if (!imageUrl || !embedding) {
        res.status(400).json({
          message: "Missing required fields: imageUrl, embedding",
        });
        return;
      }

      const result = await this.debugService.saveEmbedding({
        imageUrl,
        embedding,
        filename: filename || "unknown",
      });

      res.status(201).json({
        message: "Embedding saved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
