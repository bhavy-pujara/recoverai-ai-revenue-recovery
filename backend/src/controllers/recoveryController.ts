import { Request, Response, NextFunction } from 'express';
import { RecoveryService } from '../services/recoveryService';

export class RecoveryController {
  static async retry(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const { channel } = req.body;
      const result = await RecoveryService.retryPayment(transactionId, channel);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remind(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const { channel } = req.body;
      const result = await RecoveryService.sendReminder(transactionId, channel);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const { scheduledHours } = req.body;
      const result = await RecoveryService.scheduleRetry(transactionId, scheduledHours || 4);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markRecovered(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const { amount } = req.body;
      const result = await RecoveryService.markRecovered(transactionId, amount);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markLost(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const result = await RecoveryService.markLost(transactionId);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
