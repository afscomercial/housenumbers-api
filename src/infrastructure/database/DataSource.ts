import { DataSource } from 'typeorm';
import { SnippetEntity } from './entities/SnippetEntity';
import { UserEntity } from './entities/UserEntity';
import path from 'path';

const databasePath = process.env.DATABASE_PATH || './data/database.sqlite';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: databasePath,
  synchronize: true, // Enable for first production deployment to create tables
  logging: process.env.NODE_ENV === 'development',
  entities: [SnippetEntity, UserEntity],
  migrations: [path.join(__dirname, 'migrations/*.ts')],
  migrationsTableName: 'migrations',
});