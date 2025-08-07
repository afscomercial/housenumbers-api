import { SummaryService as ISummaryService } from '../../shared/types';
import { InternalServerError } from '../../shared/errors/AppError';

export class SummaryService implements ISummaryService {
  private llmService: ISummaryService;

  constructor(llmService: ISummaryService) {
    this.llmService = llmService;
  }

  async summarize(text: string): Promise<string> {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      // Preprocess text to ensure it's within reasonable limits
      const processedText = this.preprocessText(text);
      
      // Call the underlying LLM service
      const summary = await this.llmService.summarize(processedText);
      
      // Post-process the summary
      return this.postprocessSummary(summary);
    } catch (error) {
      console.error('Error in SummaryService:', error);
      
      if (error instanceof Error && error.message.includes('Text cannot be empty')) {
        throw error;
      }
      
      throw new InternalServerError('Failed to generate text summary');
    }
  }

  private preprocessText(text: string): string {
    // Clean and normalize the text
    let processedText = text.trim();
    
    // Remove excessive whitespace
    processedText = processedText.replace(/\s+/g, ' ');
    
    // Truncate if too long (to prevent token overflow)
    const maxLength = 8000; // Conservative limit for model context
    if (processedText.length > maxLength) {
      processedText = processedText.substring(0, maxLength) + '...';
    }
    
    return processedText;
  }

  private postprocessSummary(summary: string): string {
    // Clean up the summary
    let processedSummary = summary.trim();
    
    // Remove any potential prompt artifacts
    processedSummary = processedSummary.replace(/^(Summary:|SUMMARY:)/i, '').trim();
    
    // Ensure it ends with proper punctuation
    if (processedSummary.length > 0 && !/[.!?]$/.test(processedSummary)) {
      processedSummary += '.';
    }
    
    // Capitalize first letter if needed
    if (processedSummary.length > 0) {
      processedSummary = processedSummary.charAt(0).toUpperCase() + processedSummary.slice(1);
    }
    
    return processedSummary;
  }
}