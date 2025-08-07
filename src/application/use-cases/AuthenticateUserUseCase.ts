import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { LoginRequest } from '../../shared/types';
import { UnauthorizedError } from '../../shared/errors/AppError';
import bcrypt from 'bcryptjs';

export class AuthenticateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: LoginRequest): Promise<User> {
    const user = await this.userRepository.findByUsername(request.username);
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.hashedPassword);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return user;
  }
}