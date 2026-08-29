import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transactionService';

export class TransactionController {
  static async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TransactionService.getTransactions(req.query as any);
      return res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: `Transaction with ID '${id}' was not found.`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.createTransaction(req.body);
      return res.status(201).json({
        success: true,
        message: 'Transaction created and analyzed successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
}
