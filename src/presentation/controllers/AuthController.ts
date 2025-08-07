import { Request, Response, NextFunction } from 'express';
import { AuthenticateUserUseCase } from '../../application/use-cases/AuthenticateUserUseCase';
import { JWTService } from '../../infrastructure/auth/JWTService';
import { loginSchema } from '../validators/authValidators';
import { ValidationError } from '../../shared/errors/AppError';

export class AuthController {
  constructor(
    private authenticateUserUseCase: AuthenticateUserUseCase,
    private jwtService: JWTService
  ) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const user = await this.authenticateUserUseCase.execute(value);
      const token = this.jwtService.generateToken({
        id: user.id,
        username: user.username,
      });

      res.json({
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      });
    } catch (error) {
      next(error);
    }
  }
}