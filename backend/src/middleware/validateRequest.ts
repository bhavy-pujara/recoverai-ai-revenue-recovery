import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validateBody = <T = unknown>(schema: ZodType<T, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = <T = unknown>(schema: ZodType<T, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      req.query = parsed as unknown as Request['query'];
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = <T = unknown>(schema: ZodType<T, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.params);
      req.params = parsed as unknown as Request['params'];
      next();
    } catch (error) {
      next(error);
    }
  };
};
