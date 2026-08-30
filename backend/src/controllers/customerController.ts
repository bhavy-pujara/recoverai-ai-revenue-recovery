import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.getCustomers(req.query as any);
      return res.status(200).json({
        success: true,
        data: result.customers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customerId = Array.isArray(id) ? id[0] : id;
      const customer = await CustomerService.getCustomerById(customerId);

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: `Customer with ID '${customerId}' was not found.`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }
}
