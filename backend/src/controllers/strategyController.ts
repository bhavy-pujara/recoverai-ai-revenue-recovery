import { Request, Response, NextFunction } from 'express';
import { StrategyService } from '../services/strategyService';

export class StrategyController {
  static async getStrategies(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StrategyService.getStrategies();
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async simulateStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const { strategy, transactionCount } = req.body;
      const data = await StrategyService.simulateStrategy(strategy, transactionCount);
      return res.status(200).json({
        success: true,
        message: 'Strategy simulation executed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
