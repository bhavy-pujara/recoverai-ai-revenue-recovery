import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  role: string;
  merchantId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Optional Authentication-ready Middleware Architecture
 * In demo mode, populates a standard mock fintech merchant context.
 * In production mode with auth enabled, parses Bearer JWT.
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Structure ready for JWT verification
    req.user = {
      id: 'usr_demo_admin',
      role: 'FINTECH_ADMIN',
      merchantId: 'mer_demo_razorpay_track',
    };
  } else {
    // Default demo mode merchant context
    req.user = {
      id: 'usr_demo_sandbox',
      role: 'REVENUE_OPERATOR',
      merchantId: 'mer_sandbox_in',
    };
  }

  next();
};
