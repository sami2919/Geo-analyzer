import OpenAI from "openai";
import type { AIProvider, AIQueryRequest, AIQueryResponse } from "./types";

const client = new OpenAI();

export const openaiProvider: AIProvider = {
  name: "openai",
  async query({ query, systemPrompt }: AIQueryRequest): Promise<AIQueryResponse> {
    const start = Date.now();

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt ?? "You are a helpful shopping assistant. Answer the user's question with specific product and brand recommendations. Be detailed and mention specific brands by name.",
        },
        { role: "user", content: query },
      ],
      max_tokens: 1000,
    });

    return {
      text: response.choices[0].message.content ?? "",
      model: response.model,
      tokensUsed: response.usage?.total_tokens ?? 0,
      latencyMs: Date.now() - start,
      provider: "openai",
    };
  },
};
