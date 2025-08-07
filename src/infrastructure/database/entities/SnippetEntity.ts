import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('snippets')
export class SnippetEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text')
  text!: string;

  @Column('text')
  summary!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}