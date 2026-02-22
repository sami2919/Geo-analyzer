import OpenAI from "openai";
import type { AIProvider, AIQueryRequest, AIQueryResponse } from "./types";

const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export const perplexityProvider: AIProvider = {
  name: "perplexity",
  async query({ query, systemPrompt }: AIQueryRequest): Promise<AIQueryResponse> {
    const start = Date.now();

    const response = await client.chat.completions.create({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: systemPrompt ?? "You are a helpful shopping assistant. Answer with specific brand recommendations.",
        },
        { role: "user", content: query },
      ],
      max_tokens: 1000,
    });

    return {
      text: response.choices[0].message.content ?? "",
      model: "sonar-pro",
      tokensUsed: response.usage?.total_tokens ?? 0,
      latencyMs: Date.now() - start,
      provider: "perplexity",
    };
  },
};
