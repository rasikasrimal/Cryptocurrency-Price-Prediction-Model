import { z } from "zod";

export const assetMetadataSchema = z.object({
  symbol: z.string(),
  name: z.string()
});

export const pricePointSchema = z.object({
  date: z.string(),
  close: z.number()
});

export const pricePredictionSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  horizonDays: z.number(),
  lastPrice: z.number(),
  predictedPrice: z.number(),
  expectedChangePct: z.number()
});

export const assetSnapshotSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  history: z.array(pricePointSchema),
  predictions: z.array(pricePredictionSchema)
});

export const predictionsResponseSchema = z.object({
  generatedAt: z.string(),
  horizons: z.array(z.number()),
  availableAssets: z.array(assetMetadataSchema),
  assets: z.array(assetSnapshotSchema)
});

export const singleAssetResponseSchema = z.object({
  generatedAt: z.string(),
  horizons: z.array(z.number()),
  availableAssets: z.array(assetMetadataSchema),
  asset: assetSnapshotSchema
});

export type AssetMetadata = z.infer<typeof assetMetadataSchema>;
export type PricePoint = z.infer<typeof pricePointSchema>;
export type PricePrediction = z.infer<typeof pricePredictionSchema>;
export type AssetSnapshot = z.infer<typeof assetSnapshotSchema>;
export type PredictionsResponse = z.infer<typeof predictionsResponseSchema>;
export type SingleAssetResponse = z.infer<typeof singleAssetResponseSchema>;
