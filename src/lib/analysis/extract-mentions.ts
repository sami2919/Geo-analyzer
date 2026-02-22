import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic();

const mentionSchema = z.object({
  mentions: z.array(
    z.object({
      brandName: z.string(),
      mentioned: z.boolean(),
      position: z.number().nullable(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      recommended: z.boolean(),
      context: z.string(),
    })
  ),
});

export type ExtractedMentions = z.infer<typeof mentionSchema>;

export async function extractMentions(
  responseText: string,
  brandNames: string[]
): Promise<ExtractedMentions> {
  // Pass 1: Quick regex check for which brands appear at all
  const possiblyMentioned = brandNames.filter((name) =>
    responseText.toLowerCase().includes(name.toLowerCase())
  );

  // Pass 2: LLM-powered structured extraction for deeper analysis
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Analyze this AI-generated response for brand mentions. For each brand listed below, determine:
1. Whether it was mentioned (true/false)
2. Its position in the response (1 = first brand mentioned, 2 = second, etc., null if not mentioned)
3. Sentiment of the mention (positive/neutral/negative)
4. Whether it was explicitly recommended (true/false)
5. The exact sentence or context where it appears

Brands to check: ${brandNames.join(", ")}

AI Response:
"""
${responseText}
"""

Respond with ONLY valid JSON matching this format:
{
  "mentions": [
    {
      "brandName": "string",
      "mentioned": boolean,
      "position": number | null,
      "sentiment": "positive" | "neutral" | "negative",
      "recommended": boolean,
      "context": "string"
    }
  ]
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
  return mentionSchema.parse(JSON.parse(cleaned));
}
