import { SnippetRepository } from '../../domain/repositories/SnippetRepository';
import { Snippet } from '../../domain/entities/Snippet';
import { NotFoundError } from '../../shared/errors/AppError';

export class GetSnippetUseCase {
  constructor(private snippetRepository: SnippetRepository) {}

  async execute(id: string): Promise<Snippet> {
    const snippet = await this.snippetRepository.findById(id);
    
    if (!snippet) {
      throw new NotFoundError(`Snippet with id ${id} not found`);
    }

    return snippet;
  }
}