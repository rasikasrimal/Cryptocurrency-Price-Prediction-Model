import { z } from "zod";

const pricePointSchema = z.object({
  date: z.string(),
  close: z.number()
});

type PricePoint = z.infer<typeof pricePointSchema>;

type AssetSymbol = "BTC" | "ETH" | "SOL" | "ADA" | "XRP";

const assetMetadata: Record<AssetSymbol, { name: string; symbol: AssetSymbol }> = {
  BTC: { name: "Bitcoin", symbol: "BTC" },
  ETH: { name: "Ethereum", symbol: "ETH" },
  SOL: { name: "Solana", symbol: "SOL" },
  ADA: { name: "Cardano", symbol: "ADA" },
  XRP: { name: "XRP", symbol: "XRP" }
};

const historicalSamples: Record<AssetSymbol, PricePoint[]> = {
  BTC: [
    { date: "2024-04-01", close: 70542 },
    { date: "2024-04-08", close: 71210 },
    { date: "2024-04-15", close: 69854 },
    { date: "2024-04-22", close: 71590 },
    { date: "2024-04-29", close: 73210 },
    { date: "2024-05-06", close: 74890 },
    { date: "2024-05-13", close: 74105 }
  ],
  ETH: [
    { date: "2024-04-01", close: 3610 },
    { date: "2024-04-08", close: 3685 },
    { date: "2024-04-15", close: 3520 },
    { date: "2024-04-22", close: 3742 },
    { date: "2024-04-29", close: 3874 },
    { date: "2024-05-06", close: 4012 },
    { date: "2024-05-13", close: 3985 }
  ],
  SOL: [
    { date: "2024-04-01", close: 188 },
    { date: "2024-04-08", close: 195 },
    { date: "2024-04-15", close: 182 },
    { date: "2024-04-22", close: 205 },
    { date: "2024-04-29", close: 216 },
    { date: "2024-05-06", close: 224 },
    { date: "2024-05-13", close: 219 }
  ],
  ADA: [
    { date: "2024-04-01", close: 0.58 },
    { date: "2024-04-08", close: 0.61 },
    { date: "2024-04-15", close: 0.57 },
    { date: "2024-04-22", close: 0.63 },
    { date: "2024-04-29", close: 0.67 },
    { date: "2024-05-06", close: 0.7 },
    { date: "2024-05-13", close: 0.69 }
  ],
  XRP: [
    { date: "2024-04-01", close: 0.65 },
    { date: "2024-04-08", close: 0.66 },
    { date: "2024-04-15", close: 0.62 },
    { date: "2024-04-22", close: 0.68 },
    { date: "2024-04-29", close: 0.71 },
    { date: "2024-05-06", close: 0.74 },
    { date: "2024-05-13", close: 0.72 }
  ]
};

function assertSymbol(symbol: string): asserts symbol is AssetSymbol {
  if (!(symbol in historicalSamples)) {
    throw new Error(`Unsupported asset symbol: ${symbol}`);
  }
}

function toDaysSinceEpoch(date: string) {
  return Math.floor(new Date(date).getTime() / (1000 * 60 * 60 * 24));
}

function linearRegression(points: PricePoint[]) {
  const n = points.length;
  if (n === 0) {
    throw new Error("Cannot fit regression for an empty sample");
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of points) {
    const x = toDaysSinceEpoch(point.date);
    const y = point.close;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    throw new Error("Degenerate regression input");
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export interface PricePrediction {
  symbol: AssetSymbol;
  name: string;
  horizonDays: number;
  lastPrice: number;
  predictedPrice: number;
  expectedChangePct: number;
}

export interface AssetSnapshot {
  symbol: AssetSymbol;
  name: string;
  history: PricePoint[];
  predictions: PricePrediction[];
}

export function listAssets() {
  return Object.values(assetMetadata);
}

export function getHistory(symbol: string) {
  assertSymbol(symbol);
  return historicalSamples[symbol];
}

export function forecastPrice(symbol: string, horizonDays: number): PricePrediction {
  assertSymbol(symbol);
  const history = historicalSamples[symbol];
  const { slope, intercept } = linearRegression(history);
  const lastPoint = history[history.length - 1];
  const lastX = toDaysSinceEpoch(lastPoint.date);
  const futureX = lastX + horizonDays;
  const predictedPrice = intercept + slope * futureX;
  const roundedPrediction = Number(predictedPrice.toFixed(2));
  const expectedChangePct = Number((((roundedPrediction - lastPoint.close) / lastPoint.close) * 100).toFixed(2));

  return {
    ...assetMetadata[symbol],
    horizonDays,
    lastPrice: lastPoint.close,
    predictedPrice: roundedPrediction,
    expectedChangePct
  };
}

export function buildAssetSnapshot(symbol: string, horizons: number[]): AssetSnapshot {
  assertSymbol(symbol);
  const history = getHistory(symbol);
  const predictions = horizons.map((days) => forecastPrice(symbol, days));
  return {
    ...assetMetadata[symbol],
    history,
    predictions
  };
}

export function buildPortfolioSnapshot(horizons: number[]): AssetSnapshot[] {
  return listAssets().map((asset) => buildAssetSnapshot(asset.symbol, horizons));
}

