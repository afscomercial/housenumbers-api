import { SnippetRepository } from '../../domain/repositories/SnippetRepository';
import { NotFoundError } from '../../shared/errors/AppError';

export class DeleteSnippetUseCase {
  constructor(private snippetRepository: SnippetRepository) {}

  async execute(id: string): Promise<void> {
    const snippet = await this.snippetRepository.findById(id);
    
    if (!snippet) {
      throw new NotFoundError('Snippet not found');
    }

    await this.snippetRepository.delete(id);
  }
}