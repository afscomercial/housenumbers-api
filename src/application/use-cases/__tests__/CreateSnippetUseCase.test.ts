import { CreateSnippetUseCase } from '../CreateSnippetUseCase';
import { SnippetRepository } from '../../../domain/repositories/SnippetRepository';
import { SummaryService } from '../../../shared/types';
import { ValidationError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

describe('CreateSnippetUseCase', () => {
  let createSnippetUseCase: CreateSnippetUseCase;
  let mockSnippetRepository: jest.Mocked<SnippetRepository>;
  let mockSummaryService: jest.Mocked<SummaryService>;

  beforeEach(() => {
    mockSnippetRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    mockSummaryService = {
      summarize: jest.fn(),
    };

    createSnippetUseCase = new CreateSnippetUseCase(mockSnippetRepository, mockSummaryService);

    (uuidv4 as jest.Mock).mockReturnValue('test-uuid-123');
  });

  describe('execute', () => {
    it('should create a snippet successfully', async () => {
      const text = 'This is a long text that needs to be summarized';
      const expectedSummary = 'Short summary';
      
      mockSummaryService.summarize.mockResolvedValue(expectedSummary);
      mockSnippetRepository.save.mockResolvedValue({
        id: 'test-uuid-123',
        text,
        summary: expectedSummary,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await createSnippetUseCase.execute({ text });

      expect(result).toEqual({
        id: 'test-uuid-123',
        text,
        summary: expectedSummary,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockSummaryService.summarize).toHaveBeenCalledWith(text);
      expect(mockSnippetRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 'test-uuid-123',
        text,
        summary: expectedSummary,
      }));
    });

    it('should throw ValidationError when text is empty', async () => {
      await expect(createSnippetUseCase.execute({ text: '' }))
        .rejects
        .toThrow(ValidationError);

      expect(mockSummaryService.summarize).not.toHaveBeenCalled();
      expect(mockSnippetRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when text is only whitespace', async () => {
      await expect(createSnippetUseCase.execute({ text: '   ' }))
        .rejects
        .toThrow(ValidationError);

      expect(mockSummaryService.summarize).not.toHaveBeenCalled();
      expect(mockSnippetRepository.save).not.toHaveBeenCalled();
    });

    it('should handle summary service errors', async () => {
      const text = 'Some text';
      mockSummaryService.summarize.mockRejectedValue(new Error('AI service error'));

      await expect(createSnippetUseCase.execute({ text }))
        .rejects
        .toThrow('AI service error');

      expect(mockSnippetRepository.save).not.toHaveBeenCalled();
    });
  });
});