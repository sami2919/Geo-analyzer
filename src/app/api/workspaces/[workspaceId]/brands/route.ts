import { db } from "@/db";
import { brands } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createBrandSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  category: z.string().optional(),
  isCompetitor: z.boolean().default(false),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const result = await db
    .select()
    .from(brands)
    .where(eq(brands.workspaceId, workspaceId));

  return NextResponse.json(result);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const body = createBrandSchema.parse(await req.json());

  const [brand] = await db
    .insert(brands)
    .values({ ...body, workspaceId })
    .returning();

  return NextResponse.json(brand, { status: 201 });
}
