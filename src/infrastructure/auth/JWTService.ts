import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthenticatedUser } from '../../shared/types';
import { UnauthorizedError } from '../../shared/errors/AppError';

export class JWTService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret?: string, expiresIn: string = '24h') {
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generateToken(user: AuthenticatedUser): string {
    const payload = {
      id: user.id,
      username: user.username,
    };
    
    // Create the token with expiration
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as any);
  }

  verifyToken(token: string): AuthenticatedUser {
    try {
      const payload = jwt.verify(token, this.secret) as any;
      return {
        id: payload.id,
        username: payload.username,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}