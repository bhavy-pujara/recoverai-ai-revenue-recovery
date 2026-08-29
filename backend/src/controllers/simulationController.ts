import { Request, Response, NextFunction } from 'express';
import { SimulationService } from '../services/simulationService';

export class SimulationController {
  static async runSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SimulationService.runSimulation(req.body);
      return res.status(200).json({
        success: true,
        message: 'Simulation completed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSimulationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await SimulationService.getSimulationById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SIMULATION_NOT_FOUND',
            message: `Simulation with ID '${id}' was not found.`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
