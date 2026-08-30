import { Request, Response, NextFunction } from 'express';
import { RecoveryService } from '../services/recoveryService';

export class RecoveryController {
  static async retry(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const id = Array.isArray(transactionId) ? transactionId[0] : transactionId;
      const { channel } = req.body;
      const result = await RecoveryService.retryPayment(id, channel);
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
      const id = Array.isArray(transactionId) ? transactionId[0] : transactionId;
      const { channel } = req.body;
      const result = await RecoveryService.sendReminder(id, channel);
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
      const id = Array.isArray(transactionId) ? transactionId[0] : transactionId;
      const { scheduledHours } = req.body;
      const result = await RecoveryService.scheduleRetry(id, scheduledHours || 4);
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
      const id = Array.isArray(transactionId) ? transactionId[0] : transactionId;
      const { amount } = req.body;
      const result = await RecoveryService.markRecovered(id, amount);
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
      const id = Array.isArray(transactionId) ? transactionId[0] : transactionId;
      const result = await RecoveryService.markLost(id);
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

