// src/infrastructure/llm/LlamaLLMService.ts
import fs from "fs";
import path from "path";
import { SummaryService } from "../../shared/types";
import { InternalServerError } from "../../shared/errors/AppError";

import type { LlamaChatSession } from "node-llama-cpp";
type GetLlamaFn = typeof import("node-llama-cpp").getLlama;

// --------------------------------------------------------------------
// Config
// --------------------------------------------------------------------
const MODEL_PATH =
  process.env.MODEL_PATH ||
  path.resolve(__dirname, "../../../models/llama-2-7b-chat.Q4_K_S.gguf");
const CONTEXT_SIZE = 2048;
process.env.LLAMA_NUM_THREADS ||= "8"; // optional override

// --------------------------------------------------------------------
// Lazy ES-module loader — only hits import() once
// --------------------------------------------------------------------
type LlamaExports = typeof import("node-llama-cpp");

let llamaExports: LlamaExports | null = null;
let chatSession: LlamaChatSession | null = null;

async function loadLlamaExports(): Promise<LlamaExports> {
  if (!llamaExports) {
    llamaExports = (await import("node-llama-cpp")) as LlamaExports;
  }
  return llamaExports;
}

async function getSession(): Promise<LlamaChatSession> {
  if (chatSession) return chatSession;

  if (!fs.existsSync(MODEL_PATH)) {
    throw new InternalServerError(`GGUF model not found at ${MODEL_PATH}`);
  }

  const { getLlama } = await loadLlamaExports();
  const llama = await (getLlama as GetLlamaFn)();

  const model = await llama.loadModel({ modelPath: MODEL_PATH });
  const context = await model.createContext({ contextSize: CONTEXT_SIZE });

  const { LlamaChatSession } = await loadLlamaExports();
  chatSession = new LlamaChatSession({
    contextSequence: context.getSequence(),
  });
  return chatSession;
}

// --------------------------------------------------------------------
// Concrete service that your DI / SummaryService already expects
// --------------------------------------------------------------------
export class LlamaLLMService implements SummaryService {
  async summarize(text: string): Promise<string> {
    if (!text?.trim()) throw new Error("Text cannot be empty");

    const prompt =
      "SYSTEM: Respond with exactly one sentence—no greeting, no intro.\n" +
      `USER: Summarise in one sentence (≤ 40 words):\n\n${text.trim()}`;

    try {
      const session = await getSession();
      const reply = await session.prompt(prompt, {
        maxTokens: 60,
        temperature: 0.5,
      });

      const cleaned =
        reply
          .replace(/^[^\n]*\n/, "")
          .split(".")[0]
          .trim() + ".";
      return cleaned.endsWith(".") ? cleaned : cleaned + ".";
    } catch (err) {
      console.error("[LlamaLLMService] error", err);
      throw new InternalServerError("Failed to generate summary with Llama");
    }
  }

  async dispose(): Promise<void> {
    /* no-op */
  }
}
