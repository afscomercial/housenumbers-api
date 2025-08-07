import { SnippetRepository } from '../../domain/repositories/SnippetRepository';
import { Snippet } from '../../domain/entities/Snippet';

export class GetAllSnippetsUseCase {
  constructor(private snippetRepository: SnippetRepository) {}

  async execute(): Promise<Snippet[]> {
    return await this.snippetRepository.findAll();
  }
}