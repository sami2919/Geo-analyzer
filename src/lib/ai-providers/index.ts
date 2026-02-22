import { anthropicProvider } from "./anthropic";
import type { AIProvider } from "./types";

export const providers: Record<string, AIProvider> = {
  anthropic: anthropicProvider,
};

export * from "./types";
