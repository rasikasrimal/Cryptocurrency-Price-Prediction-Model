import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildAssetSnapshot,
  buildPortfolioSnapshot,
  listAssets
} from "@/server/services/predictions";
import {
  predictionsResponseSchema,
  singleAssetResponseSchema
} from "@/types/predictions";

const querySchema = z.object({
  horizon: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number.parseInt(item, 10))
        .filter((value) => Number.isFinite(value) && value > 0)
    )
    .optional(),
  symbol: z.string().optional()
});

const DEFAULT_HORIZONS = [7, 30];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.parse({
    horizon: searchParams.get("horizon") ?? undefined,
    symbol: searchParams.get("symbol") ?? undefined
  });

  const horizons = parsed.horizon?.length ? parsed.horizon : DEFAULT_HORIZONS;
  const availableAssets = listAssets();

  if (parsed.symbol) {
    const snapshot = buildAssetSnapshot(parsed.symbol, horizons);
    const response = singleAssetResponseSchema.parse({
      generatedAt: new Date().toISOString(),
      horizons,
      asset: snapshot,
      availableAssets
    });
    return NextResponse.json(response);
  }

  const assets = buildPortfolioSnapshot(horizons);
  const response = predictionsResponseSchema.parse({
    generatedAt: new Date().toISOString(),
    horizons,
    availableAssets,
    assets
  });
  return NextResponse.json(response);
}
