import type { Request, Response } from "express";
import { aiService } from "./ai.service.js";

export class AIController {
  async analyzeProducts(req: Request, res: Response) {
    const result = await aiService.getProductsAnalytics();

    res.status(200).json({
      success: true,
      message: "Product analytics generated successfully",
      data: result,
    });
  }
}

export const aiController = new AIController();