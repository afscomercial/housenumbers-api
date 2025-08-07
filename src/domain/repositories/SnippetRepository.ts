import { Snippet } from '../entities/Snippet';

export interface SnippetRepository {
  save(snippet: Snippet): Promise<Snippet>;
  findById(id: string): Promise<Snippet | null>;
  findAll(): Promise<Snippet[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}