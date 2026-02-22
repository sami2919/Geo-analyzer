import { executeQueryBatch } from "@/lib/pipeline/execute-queries";
import { computeVisibilityScores } from "@/lib/analysis/compute-scores";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000); // last 24h

  const results = await executeQueryBatch(workspaceId);
  await computeVisibilityScores(workspaceId, periodStart, periodEnd);

  return NextResponse.json({ results });
}
