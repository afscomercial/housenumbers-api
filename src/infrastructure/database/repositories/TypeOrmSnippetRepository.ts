import { Repository } from 'typeorm';
import { SnippetRepository } from '../../../domain/repositories/SnippetRepository';
import { Snippet } from '../../../domain/entities/Snippet';
import { SnippetEntity } from '../entities/SnippetEntity';
import { AppDataSource } from '../DataSource';

export class TypeOrmSnippetRepository implements SnippetRepository {
  private repository: Repository<SnippetEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(SnippetEntity);
  }

  async save(snippet: Snippet): Promise<Snippet> {
    const entity = new SnippetEntity();
    entity.id = snippet.id;
    entity.text = snippet.text;
    entity.summary = snippet.summary;

    const savedEntity = await this.repository.save(entity);
    
    return new Snippet(
      savedEntity.id,
      savedEntity.text,
      savedEntity.summary,
      savedEntity.createdAt,
      savedEntity.updatedAt
    );
  }

  async findById(id: string): Promise<Snippet | null> {
    const entity = await this.repository.findOne({ where: { id } });
    
    if (!entity) {
      return null;
    }

    return new Snippet(
      entity.id,
      entity.text,
      entity.summary,
      entity.createdAt,
      entity.updatedAt
    );
  }

  async findAll(): Promise<Snippet[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' }
    });

    return entities.map(entity => new Snippet(
      entity.id,
      entity.text,
      entity.summary,
      entity.createdAt,
      entity.updatedAt
    ));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}