import { db } from "@/db";
import { brands, visibilityScores, brandMentions, queryResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  // Get latest visibility scores for all brands
  const scores = await db
    .select({
      brandName: brands.name,
      brandId: brands.id,
      isCompetitor: brands.isCompetitor,
      mentionRate: visibilityScores.mentionRate,
      avgPosition: visibilityScores.avgPosition,
      sentimentScore: visibilityScores.sentimentScore,
      recommendationRate: visibilityScores.recommendationRate,
      provider: visibilityScores.provider,
      periodStart: visibilityScores.periodStart,
      periodEnd: visibilityScores.periodEnd,
    })
    .from(visibilityScores)
    .innerJoin(brands, eq(visibilityScores.brandId, brands.id))
    .where(eq(visibilityScores.workspaceId, workspaceId))
    .orderBy(desc(visibilityScores.computedAt));

  // Get recent mentions for the activity feed
  const recentMentions = await db
    .select({
      brandName: brands.name,
      mentioned: brandMentions.mentioned,
      sentiment: brandMentions.sentiment,
      context: brandMentions.context,
      recommended: brandMentions.recommended,
      provider: queryResults.provider,
      executedAt: queryResults.executedAt,
    })
    .from(brandMentions)
    .innerJoin(brands, eq(brandMentions.brandId, brands.id))
    .innerJoin(queryResults, eq(brandMentions.queryResultId, queryResults.id))
    .where(eq(brands.workspaceId, workspaceId))
    .orderBy(desc(queryResults.executedAt))
    .limit(50);

  return NextResponse.json({ scores, recentMentions });
}
