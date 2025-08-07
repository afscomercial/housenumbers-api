import 'dotenv/config';
import { AppDataSource } from '../DataSource';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    const dataDir = path.dirname(process.env.DATABASE_PATH || './data/database.sqlite');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('Running migrations...');
    await AppDataSource.runMigrations();
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  runMigrations();
}