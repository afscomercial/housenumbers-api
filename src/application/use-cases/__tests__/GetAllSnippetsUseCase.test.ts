import { GetAllSnippetsUseCase } from '../GetAllSnippetsUseCase';
import { SnippetRepository } from '../../../domain/repositories/SnippetRepository';
import { Snippet } from '../../../domain/entities/Snippet';

describe('GetAllSnippetsUseCase', () => {
  let getAllSnippetsUseCase: GetAllSnippetsUseCase;
  let mockSnippetRepository: jest.Mocked<SnippetRepository>;

  beforeEach(() => {
    mockSnippetRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    getAllSnippetsUseCase = new GetAllSnippetsUseCase(mockSnippetRepository);
  });

  describe('execute', () => {
    it('should return all snippets', async () => {
      const snippets = [
        new Snippet('1', 'text1', 'summary1'),
        new Snippet('2', 'text2', 'summary2'),
      ];
      
      mockSnippetRepository.findAll.mockResolvedValue(snippets);

      const result = await getAllSnippetsUseCase.execute();

      expect(result).toEqual(snippets);
      expect(mockSnippetRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no snippets exist', async () => {
      mockSnippetRepository.findAll.mockResolvedValue([]);

      const result = await getAllSnippetsUseCase.execute();

      expect(result).toEqual([]);
      expect(mockSnippetRepository.findAll).toHaveBeenCalled();
    });
  });
});