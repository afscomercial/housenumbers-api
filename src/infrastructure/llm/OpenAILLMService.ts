import OpenAI from "openai";
import { SummaryService } from "../../shared/types";
import { InternalServerError } from "../../shared/errors/AppError";

export class OpenAILLMService implements SummaryService {
  private openai: OpenAI;

  constructor() {
    const apiKey =
      process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async summarize(text: string): Promise<string> {
    if (!text?.trim()) {
      throw new Error("Text cannot be empty");
    }

    try {
      console.log("[OpenAILLMService] Generating summary...");
      const startTime = Date.now();

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates concise summaries. Respond with exactly one sentence that summarizes the main point. No greeting, no intro, just the summary sentence.",
          },
          {
            role: "user",
            content: `summarize this text in one sentence (25-40 words):\n\n${text.trim()}`,
          },
        ],
        max_tokens: 60,
        temperature: 0.5,
      });

      const summary = completion.choices[0]?.message?.content?.trim();

      if (!summary) {
        throw new Error("No summary generated");
      }

      const responseTime = Date.now() - startTime;
      console.log(`[OpenAILLMService] Summary generated in ${responseTime}ms`);
      console.log(`[OpenAILLMService] Result: "${summary}"`);

      return summary;
    } catch (error) {
      console.error("[OpenAILLMService] Error generating summary:", error);

      if (error instanceof Error) {
        throw new InternalServerError(
          `Failed to generate summary: ${error.message}`
        );
      }

      throw new InternalServerError("Failed to generate summary with OpenAI");
    }
  }

  async dispose(): Promise<void> {
    // No cleanup needed for OpenAI client
    console.log("[OpenAILLMService] Service disposed");
  }
}
