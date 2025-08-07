import { GetSnippetUseCase } from '../GetSnippetUseCase';
import { SnippetRepository } from '../../../domain/repositories/SnippetRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { Snippet } from '../../../domain/entities/Snippet';

describe('GetSnippetUseCase', () => {
  let getSnippetUseCase: GetSnippetUseCase;
  let mockSnippetRepository: jest.Mocked<SnippetRepository>;

  beforeEach(() => {
    mockSnippetRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    getSnippetUseCase = new GetSnippetUseCase(mockSnippetRepository);
  });

  describe('execute', () => {
    it('should return a snippet when found', async () => {
      const snippetId = 'test-id';
      const snippet = new Snippet(snippetId, 'test text', 'test summary');
      
      mockSnippetRepository.findById.mockResolvedValue(snippet);

      const result = await getSnippetUseCase.execute(snippetId);

      expect(result).toEqual(snippet);
      expect(mockSnippetRepository.findById).toHaveBeenCalledWith(snippetId);
    });

    it('should throw NotFoundError when snippet does not exist', async () => {
      const snippetId = 'non-existent-id';
      
      mockSnippetRepository.findById.mockResolvedValue(null);

      await expect(getSnippetUseCase.execute(snippetId))
        .rejects
        .toThrow(NotFoundError);

      expect(mockSnippetRepository.findById).toHaveBeenCalledWith(snippetId);
    });
  });
});