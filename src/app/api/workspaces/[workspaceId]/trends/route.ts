import { db } from "@/db";
import { brands, visibilityScores } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  // Get all visibility scores over time
  const scores = await db
    .select({
      brandName: brands.name,
      isCompetitor: brands.isCompetitor,
      mentionRate: visibilityScores.mentionRate,
      periodStart: visibilityScores.periodStart,
    })
    .from(visibilityScores)
    .innerJoin(brands, eq(visibilityScores.brandId, brands.id))
    .where(eq(visibilityScores.workspaceId, workspaceId))
    .orderBy(desc(visibilityScores.periodStart));

  // Group by period and compute primary brand vs competitor average
  const byPeriod = new Map<string, { mentionRates: number[]; competitorRates: number[] }>();

  for (const score of scores) {
    const dateKey = format(score.periodStart, "yyyy-MM-dd");
    const existing = byPeriod.get(dateKey) ?? { mentionRates: [], competitorRates: [] };

    if (score.isCompetitor) {
      existing.competitorRates.push(score.mentionRate);
    } else {
      existing.mentionRates.push(score.mentionRate);
    }

    byPeriod.set(dateKey, existing);
  }

  const trendData = Array.from(byPeriod.entries())
    .map(([date, data]) => ({
      date,
      mentionRate: data.mentionRates.length > 0
        ? data.mentionRates.reduce((a, b) => a + b, 0) / data.mentionRates.length
        : 0,
      competitorAvg: data.competitorRates.length > 0
        ? data.competitorRates.reduce((a, b) => a + b, 0) / data.competitorRates.length
        : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(trendData);
}
