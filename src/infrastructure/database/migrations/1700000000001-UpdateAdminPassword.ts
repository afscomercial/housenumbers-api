import { MigrationInterface, QueryRunner } from 'typeorm';
import bcrypt from 'bcryptjs';

export class UpdateAdminPassword1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash the new password
    const newPassword = process.env.AUTH_PASSWORD || 'password';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin user's password
    await queryRunner.query(
      `UPDATE users SET hashedPassword = ? WHERE username = 'admin'`,
      [hashedPassword]
    );
    
    console.log('Admin user password updated successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // For rollback, we'll set it back to the default secure password
    const defaultPassword = 'secure_password_123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    await queryRunner.query(
      `UPDATE users SET hashedPassword = ? WHERE username = 'admin'`,
      [hashedPassword]
    );
    
    console.log('Admin user password reverted to default');
  }
}