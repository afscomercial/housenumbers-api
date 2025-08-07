import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { unique: true })
  username!: string;

  @Column('text')
  hashedPassword!: string;

  @CreateDateColumn()
  createdAt!: Date;
}