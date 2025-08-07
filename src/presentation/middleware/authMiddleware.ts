import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../infrastructure/auth/JWTService';
import { UnauthorizedError } from '../../shared/errors/AppError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const createAuthMiddleware = (jwtService: JWTService) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        throw new UnauthorizedError('Authorization header is required');
      }

      const [bearer, token] = authHeader.split(' ');
      
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedError('Bearer token is required');
      }

      const user = jwtService.verifyToken(token);
      req.user = user;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};