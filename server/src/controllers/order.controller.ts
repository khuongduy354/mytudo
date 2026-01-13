import { Request, Response, NextFunction } from "express";
import type { OrderService } from "../services/order.service.js";

export class OrderController {
  constructor(private orderService: OrderService) {}

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const order = await this.orderService.createOrder(userId, req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const type = (req.query.type as "buying" | "selling") || "buying";
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await this.orderService.getMyOrders(
        userId,
        type,
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

  getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const order = await this.orderService.getOrderDetails(id, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Order not found" },
        });
      }

      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  acceptOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const order = await this.orderService.acceptOrder(id, userId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  rejectOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const order = await this.orderService.rejectOrder(id, userId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  completeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const order = await this.orderService.completeOrder(id, userId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const order = await this.orderService.cancelOrder(id, userId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };
}
