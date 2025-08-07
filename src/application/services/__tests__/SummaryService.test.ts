import { SummaryService } from '../SummaryService';
import { SummaryService as ISummaryService } from '../../../shared/types';
import { InternalServerError } from '../../../shared/errors/AppError';

describe('SummaryService', () => {
  let summaryService: SummaryService;
  let mockLlmService: jest.Mocked<ISummaryService>;

  beforeEach(() => {
    mockLlmService = {
      summarize: jest.fn(),
    };

    summaryService = new SummaryService(mockLlmService);
  });

  describe('summarize', () => {
    it('should successfully summarize text', async () => {
      const inputText = 'This is a long text that needs to be summarized.';
      const expectedSummary = 'summary of the text';
      
      mockLlmService.summarize.mockResolvedValue(expectedSummary);

      const result = await summaryService.summarize(inputText);

      expect(result).toBe('Summary of the text.');
      expect(mockLlmService.summarize).toHaveBeenCalledWith(inputText);
    });

    it('should preprocess text by removing excessive whitespace', async () => {
      const inputText = 'This  is    a   text   with   excessive    whitespace.';
      const expectedProcessedText = 'This is a text with excessive whitespace.';
      const expectedSummary = 'processed summary';
      
      mockLlmService.summarize.mockResolvedValue(expectedSummary);

      await summaryService.summarize(inputText);

      expect(mockLlmService.summarize).toHaveBeenCalledWith(expectedProcessedText);
    });

    it('should truncate very long text', async () => {
      const inputText = 'a'.repeat(10000);
      const expectedSummary = 'truncated summary';
      
      mockLlmService.summarize.mockResolvedValue(expectedSummary);

      await summaryService.summarize(inputText);

      const callArg = mockLlmService.summarize.mock.calls[0][0];
      expect(callArg.length).toBeLessThanOrEqual(8003); // 8000 + '...'
      expect(callArg.endsWith('...')).toBe(true);
    });

    it('should postprocess summary by removing "Summary:" prefix', async () => {
      const inputText = 'Some text to summarize';
      const rawSummary = 'Summary: This is the summary';
      const expectedSummary = 'This is the summary.';
      
      mockLlmService.summarize.mockResolvedValue(rawSummary);

      const result = await summaryService.summarize(inputText);

      expect(result).toBe(expectedSummary);
    });

    it('should add period to summary if missing', async () => {
      const inputText = 'Some text';
      const rawSummary = 'This is a summary without period';
      
      mockLlmService.summarize.mockResolvedValue(rawSummary);

      const result = await summaryService.summarize(inputText);

      expect(result).toBe('This is a summary without period.');
    });

    it('should capitalize first letter of summary', async () => {
      const inputText = 'Some text';
      const rawSummary = 'this summary starts lowercase';
      
      mockLlmService.summarize.mockResolvedValue(rawSummary);

      const result = await summaryService.summarize(inputText);

      expect(result).toBe('This summary starts lowercase.');
    });

    it('should throw error for empty text', async () => {
      await expect(summaryService.summarize(''))
        .rejects
        .toThrow('Text cannot be empty');

      expect(mockLlmService.summarize).not.toHaveBeenCalled();
    });

    it('should throw error for whitespace-only text', async () => {
      await expect(summaryService.summarize('   '))
        .rejects
        .toThrow('Text cannot be empty');

      expect(mockLlmService.summarize).not.toHaveBeenCalled();
    });

    it('should handle LLM service errors', async () => {
      const inputText = 'Some text';
      
      mockLlmService.summarize.mockRejectedValue(new Error('LLM service failed'));

      await expect(summaryService.summarize(inputText))
        .rejects
        .toThrow(InternalServerError);
    });

    it('should preserve punctuation in summary', async () => {
      const inputText = 'Some text';
      const rawSummary = 'This is a summary!';
      
      mockLlmService.summarize.mockResolvedValue(rawSummary);

      const result = await summaryService.summarize(inputText);

      expect(result).toBe('This is a summary!'); // Should not add extra period
    });

    it('should handle SUMMARY: prefix case insensitive', async () => {
      const inputText = 'Some text';
      const rawSummary = 'SUMMARY: This is the summary';
      
      mockLlmService.summarize.mockResolvedValue(rawSummary);

      const result = await summaryService.summarize(inputText);

      expect(result).toBe('This is the summary.');
    });
  });
});