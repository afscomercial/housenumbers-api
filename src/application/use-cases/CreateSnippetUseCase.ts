import { SnippetRepository } from '../../domain/repositories/SnippetRepository';
import { Snippet } from '../../domain/entities/Snippet';
import { CreateSnippetRequest, SummaryService } from '../../shared/types';
import { ValidationError } from '../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class CreateSnippetUseCase {
  constructor(
    private snippetRepository: SnippetRepository,
    private summaryService: SummaryService
  ) {}

  async execute(request: CreateSnippetRequest): Promise<Snippet> {
    if (!request.text || request.text.trim().length === 0) {
      throw new ValidationError('Text is required and cannot be empty');
    }

    const text = request.text.trim();
    const id = uuidv4();
    
    try {
      const summary = await this.summaryService.summarize(text);
      const snippet = Snippet.create(id, text, summary);
      
      return await this.snippetRepository.save(snippet);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw error;
    }
  }
}