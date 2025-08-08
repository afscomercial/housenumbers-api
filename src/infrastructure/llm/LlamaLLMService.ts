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
const CONTEXT_SIZE = 256;  // Much smaller for faster inference

// Force CPU threading configuration for Railway
process.env.LLAMA_NUM_THREADS = "8"; // Use all available vCPUs
process.env.LLAMA_BATCH_SIZE = "128"; // Much smaller batch size
process.env.OMP_NUM_THREADS = "8"; // OpenMP threads

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
  if (chatSession) {
    console.log("[getSession] Returning existing chat session");
    return chatSession;
  }

  console.log(`[getSession] Initializing new session, MODEL_PATH: ${MODEL_PATH}`);
  
  if (!fs.existsSync(MODEL_PATH)) {
    console.error(`[getSession] Model file not found at: ${MODEL_PATH}`);
    throw new InternalServerError(`GGUF model not found at ${MODEL_PATH}`);
  }

  const modelStats = fs.statSync(MODEL_PATH);
  console.log(`[getSession] Model file size: ${(modelStats.size / 1024 / 1024 / 1024).toFixed(2)} GB`);

  console.log("[getSession] Loading Llama exports...");
  const { getLlama } = await loadLlamaExports();
  
  console.log("[getSession] Getting Llama instance...");
  const startTime = Date.now();
  const llama = await (getLlama as GetLlamaFn)({
    logLevel: "info" as any
  });
  console.log(`[getSession] Llama instance created in ${Date.now() - startTime}ms`);

  console.log("[getSession] Loading model...");
  const modelStartTime = Date.now();
  const model = await llama.loadModel({ 
    modelPath: MODEL_PATH,
    gpuLayers: 0, // Force CPU only
  });
  console.log(`[getSession] Model loaded in ${Date.now() - modelStartTime}ms`);

  console.log(`[getSession] Creating context with size ${CONTEXT_SIZE}...`);
  const contextStartTime = Date.now();
  const context = await model.createContext({ contextSize: CONTEXT_SIZE });
  console.log(`[getSession] Context created in ${Date.now() - contextStartTime}ms`);

  console.log("[getSession] Creating chat session...");
  const { LlamaChatSession } = await loadLlamaExports();
  chatSession = new LlamaChatSession({
    contextSequence: context.getSequence(),
  });
  
  const totalTime = Date.now() - startTime;
  console.log(`[getSession] Chat session initialized successfully in ${totalTime}ms`);
  return chatSession;
}

// --------------------------------------------------------------------
// Concrete service that your DI / SummaryService already expects
// --------------------------------------------------------------------
export class LlamaLLMService implements SummaryService {
  private processingQueue: Array<{
    text: string;
    resolve: (value: string) => void;
    reject: (error: Error) => void;
  }> = [];
  private isProcessing = false;
  private hasGenerated = false;

  async summarize(text: string): Promise<string> {
    if (!text?.trim()) throw new Error("Text cannot be empty");

    return new Promise((resolve, reject) => {
      const firstRunPadding = 180_000;
      // Add timeout
      const timeoutId = setTimeout(() => {
        console.error("[LlamaLLMService] Timeout reached - checking memory usage");
        const memUsage = process.memoryUsage();
        console.error("Memory usage:", {
          rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`
        });
        reject(new InternalServerError("Summary generation timed out after 60 seconds"));
      }, this.hasGenerated ? 60_000 : firstRunPadding);

      const wrappedResolve = (value: string) => {
        clearTimeout(timeoutId);
        resolve(value);
      };

      const wrappedReject = (error: Error) => {
        clearTimeout(timeoutId);
        reject(error);
      };

      this.processingQueue.push({
        text,
        resolve: wrappedResolve,
        reject: wrappedReject
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.processingQueue.length > 0) {
      const { text, resolve, reject } = this.processingQueue.shift()!;
      
      try {
        console.log(`[LlamaLLMService] Processing queue item (${this.processingQueue.length} remaining)`);
        const result = await this.generateSummary(text);
        resolve(result);
      } catch (error) {
        console.error("[LlamaLLMService] Queue processing error:", error);
        reject(error instanceof Error ? error : new InternalServerError("Unknown error"));
      }
    }
    
    this.isProcessing = false;
  }

  private async generateSummary(text: string): Promise<string> {
    const prompt =
      "SYSTEM: Respond with exactly one sentence—no greeting, no intro.\n" +
      `USER: Summarise in one sentence (≤ 40 words):\n\n${text.trim()}`;

    try {
      console.log("[generateSummary] Getting session...");
      const session = await getSession();
      
      console.log("[generateSummary] Starting prompt generation...");
      const t0 = Date.now();
      
     const reply = await session.prompt(prompt, {
      maxTokens:   30,      // tight budget → faster
      temperature: 0.3,     // more deterministic
    });
      
      console.log(`[generateSummary] Prompt completed in ${Date.now() - t0} ms`);
      console.log(`[generateSummary] Raw reply: "${reply}"`);

      const cleaned =
        reply
          .replace(/^[^\n]*\n/, "")
          .split(".")[0]
          .trim() + ".";
      
      console.log(`[generateSummary] Cleaned result: "${cleaned}"`);
      this.hasGenerated = true;

      return cleaned;
    } catch (err) {
      console.error("[LlamaLLMService] generation error → falling back", err);
      
      // fallback: truncate original text to 20 words
      const words    = text.trim().split(/\s+/);
      const fallback = words.slice(0, 20).join(" ") + (words.length > 20 ? "…" : ".");
      return `Summary: ${fallback}`;
    }
  }

  async dispose(): Promise<void> {
    /* no-op */
  }
}
