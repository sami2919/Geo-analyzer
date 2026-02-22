import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, AIQueryRequest, AIQueryResponse } from "./types";

const client = new Anthropic();

export const anthropicProvider: AIProvider = {
  name: "anthropic",
  async query({ query, systemPrompt }: AIQueryRequest): Promise<AIQueryResponse> {
    const start = Date.now();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt ?? "You are a helpful shopping assistant. Answer the user's question with specific product and brand recommendations. Be detailed and mention specific brands by name.",
      messages: [{ role: "user", content: query }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      text,
      model: response.model,
      tokensUsed: (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0),
      latencyMs: Date.now() - start,
      provider: "anthropic",
    };
  },
};
