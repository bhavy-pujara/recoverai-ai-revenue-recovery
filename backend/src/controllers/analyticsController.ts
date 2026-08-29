import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export class AnalyticsController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getOverviewMetrics();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getRevenueTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const range = (req.query.range as '7D' | '30D' | '90D') || '30D';
      const data = await AnalyticsService.getRevenueTrend(range);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getRecoveryFunnel(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getRecoveryFunnel();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentMethods(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getPaymentMethodBreakdown();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getFailureReasons(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getFailureReasonBreakdown();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getAIInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getAIInsights();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
