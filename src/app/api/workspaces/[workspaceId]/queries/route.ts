import { db } from "@/db";
import { searchQueries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createQuerySchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const result = await db
    .select()
    .from(searchQueries)
    .where(eq(searchQueries.workspaceId, workspaceId));

  return NextResponse.json(result);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const body = createQuerySchema.parse(await req.json());

  const [query] = await db
    .insert(searchQueries)
    .values({ ...body, workspaceId })
    .returning();

  return NextResponse.json(query, { status: 201 });
}
