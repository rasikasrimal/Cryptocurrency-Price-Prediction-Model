import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({ args: z.record(z.unknown()).default({}) });

export async function POST(
  request: Request,
  { params }: { params: { tool: string } }
) {
  const body = await request.json();
  const parsed = requestSchema.parse(body);
  const jobId = crypto.randomUUID();
  return NextResponse.json({ jobId, tool: params.tool, args: parsed.args }, { status: 202 });
}
