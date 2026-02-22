import { db } from "@/db";
import { workspaces } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = createWorkspaceSchema.parse(await req.json());

  const [workspace] = await db
    .insert(workspaces)
    .values({ name: body.name })
    .returning();

  return NextResponse.json(workspace, { status: 201 });
}
