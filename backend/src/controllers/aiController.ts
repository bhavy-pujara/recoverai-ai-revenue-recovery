import { Request, Response, NextFunction } from 'express';
import { RecoveryEngine } from '../ai/recoveryEngine';
import { AIScoringInput } from '../ai/types';

export class AIController {
  static async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const input: AIScoringInput = req.body;
      const result = RecoveryEngine.analyze(input);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async batchAnalyze(req: Request, res: Response, next: NextFunction) {
    try {
      const items: AIScoringInput[] = req.body.transactions || [];
      const results = items.map((item) => ({
        input: item,
        analysis: RecoveryEngine.analyze(item),
      }));

      return res.status(200).json({
        success: true,
        data: {
          count: results.length,
          results,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
