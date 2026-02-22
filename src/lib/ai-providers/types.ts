export interface AIQueryRequest {
  query: string;
  systemPrompt?: string;
}

export interface AIQueryResponse {
  text: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  provider: "openai" | "anthropic" | "perplexity" | "gemini";
}

export interface AIProvider {
  name: string;
  query(request: AIQueryRequest): Promise<AIQueryResponse>;
}
