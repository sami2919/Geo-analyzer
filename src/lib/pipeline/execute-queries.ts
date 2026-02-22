import { db } from "@/db";
import { brands, searchQueries, queryResults, brandMentions } from "@/db/schema";
import { providers } from "@/lib/ai-providers";
import { extractMentions } from "@/lib/analysis/extract-mentions";
import { eq, and } from "drizzle-orm";

export async function executeQueryBatch(workspaceId: string) {
  // 1. Get all active queries and brands for this workspace
  const activeQueries = await db
    .select()
    .from(searchQueries)
    .where(
      and(
        eq(searchQueries.workspaceId, workspaceId),
        eq(searchQueries.isActive, true)
      )
    );

  const workspaceBrands = await db
    .select()
    .from(brands)
    .where(eq(brands.workspaceId, workspaceId));

  const brandNames = workspaceBrands.map((b) => b.name);

  // 2. For each query, run against all providers
  const results = [];

  for (const query of activeQueries) {
    for (const [providerName, provider] of Object.entries(providers)) {
      try {
        const response = await provider.query({ query: query.query });

        const [result] = await db
          .insert(queryResults)
          .values({
            searchQueryId: query.id,
            provider: providerName as "openai" | "anthropic" | "perplexity" | "gemini",
            rawResponse: response.text,
            modelUsed: response.model,
            tokensUsed: response.tokensUsed,
            latencyMs: response.latencyMs,
          })
          .returning();

        const extracted = await extractMentions(response.text, brandNames);

        for (const mention of extracted.mentions) {
          const brand = workspaceBrands.find(
            (b) => b.name.toLowerCase() === mention.brandName.toLowerCase()
          );
          if (!brand) continue;

          await db.insert(brandMentions).values({
            queryResultId: result.id,
            brandId: brand.id,
            mentioned: mention.mentioned,
            position: mention.position,
            sentiment: mention.sentiment,
            context: mention.context,
            recommended: mention.recommended,
          });
        }

        results.push({ query: query.query, provider: providerName, success: true });
      } catch (error) {
        console.error(`Failed: ${query.query} on ${providerName}`, error);
        results.push({ query: query.query, provider: providerName, success: false, error });
      }
    }
  }

  return results;
}
