import { Repository } from 'typeorm';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { UserEntity } from '../entities/UserEntity';
import { AppDataSource } from '../DataSource';

export class TypeOrmUserRepository implements UserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });
    
    if (!entity) {
      return null;
    }

    return new User(
      entity.id,
      entity.username,
      entity.hashedPassword,
      entity.createdAt
    );
  }

  async save(user: User): Promise<User> {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.username = user.username;
    entity.hashedPassword = user.hashedPassword;

    const savedEntity = await this.repository.save(entity);
    
    return new User(
      savedEntity.id,
      savedEntity.username,
      savedEntity.hashedPassword,
      savedEntity.createdAt
    );
  }
}