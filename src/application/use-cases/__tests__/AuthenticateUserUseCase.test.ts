import { AuthenticateUserUseCase } from '../AuthenticateUserUseCase';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import { User } from '../../../domain/entities/User';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthenticateUserUseCase', () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByUsername: jest.fn(),
      save: jest.fn(),
    };

    authenticateUserUseCase = new AuthenticateUserUseCase(mockUserRepository);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should authenticate user with valid credentials', async () => {
      const username = 'admin';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const user = new User('1', username, hashedPassword);
      
      mockUserRepository.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authenticateUserUseCase.execute({ username, password });

      expect(result).toEqual(user);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should throw UnauthorizedError when user does not exist', async () => {
      const username = 'nonexistent';
      const password = 'password123';
      
      mockUserRepository.findByUsername.mockResolvedValue(null);

      await expect(authenticateUserUseCase.execute({ username, password }))
        .rejects
        .toThrow(UnauthorizedError);

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when password is incorrect', async () => {
      const username = 'admin';
      const password = 'wrong_password';
      const hashedPassword = 'hashed_password';
      const user = new User('1', username, hashedPassword);
      
      mockUserRepository.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authenticateUserUseCase.execute({ username, password }))
        .rejects
        .toThrow(UnauthorizedError);

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});