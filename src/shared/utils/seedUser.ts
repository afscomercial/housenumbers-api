import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class UserSeeder {
  constructor(private userRepository: UserRepository) {}

  async seedDefaultUser(): Promise<void> {
    const username = process.env.AUTH_USERNAME || 'admin';
    const password = process.env.AUTH_PASSWORD || 'secure_password_123';

    try {
      const existingUser = await this.userRepository.findByUsername(username);
      
      if (existingUser) {
        console.log('Default user already exists');
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create(uuidv4(), username, hashedPassword);
      
      await this.userRepository.save(user);
      console.log(`Default user created with username: ${username}`);
    } catch (error) {
      console.error('Failed to seed default user:', error);
      throw error;
    }
  }
}