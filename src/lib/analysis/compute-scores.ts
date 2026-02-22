import { db } from "@/db";
import { brandMentions, queryResults, visibilityScores, brands } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function computeVisibilityScores(
  workspaceId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const workspaceBrands = await db
    .select()
    .from(brands)
    .where(eq(brands.workspaceId, workspaceId));

  for (const brand of workspaceBrands) {
    const stats = await db
      .select({
        totalResults: sql<number>`count(*)`,
        totalMentioned: sql<number>`sum(case when ${brandMentions.mentioned} then 1 else 0 end)`,
        avgPosition: sql<number>`avg(case when ${brandMentions.mentioned} then ${brandMentions.position} end)`,
        positiveMentions: sql<number>`sum(case when ${brandMentions.sentiment} = 'positive' then 1 else 0 end)`,
        negativeMentions: sql<number>`sum(case when ${brandMentions.sentiment} = 'negative' then 1 else 0 end)`,
        totalRecommended: sql<number>`sum(case when ${brandMentions.recommended} then 1 else 0 end)`,
      })
      .from(brandMentions)
      .innerJoin(queryResults, eq(brandMentions.queryResultId, queryResults.id))
      .where(
        and(
          eq(brandMentions.brandId, brand.id),
          gte(queryResults.executedAt, periodStart),
          lte(queryResults.executedAt, periodEnd)
        )
      );

    const s = stats[0];
    if (!s || s.totalResults === 0) continue;

    const mentionRate = s.totalMentioned / s.totalResults;
    const sentimentScore =
      s.totalMentioned > 0
        ? (s.positiveMentions - s.negativeMentions) / s.totalMentioned
        : 0;
    const recommendationRate = s.totalRecommended / s.totalResults;

    await db.insert(visibilityScores).values({
      brandId: brand.id,
      workspaceId,
      mentionRate,
      avgPosition: s.avgPosition,
      sentimentScore,
      recommendationRate,
      periodStart,
      periodEnd,
    });
  }
}
