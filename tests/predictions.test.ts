// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  buildAssetSnapshot,
  buildPortfolioSnapshot,
  forecastPrice,
  getHistory,
  listAssets
} from "@/server/services/predictions";

const horizons = [7, 30];

describe("predictions service", () => {
  it("lists supported assets", () => {
    const assets = listAssets();
    expect(assets).toHaveLength(5);
    expect(assets[0]).toMatchObject({ symbol: "BTC" });
  });

  it("returns historical samples", () => {
    const history = getHistory("BTC");
    expect(history).toHaveLength(7);
    expect(history[0]).toHaveProperty("date");
    expect(history[0]).toHaveProperty("close");
  });

  it("forecasts positive horizons", () => {
    const prediction = forecastPrice("ETH", 7);
    expect(prediction.symbol).toBe("ETH");
    expect(prediction.horizonDays).toBe(7);
    expect(typeof prediction.predictedPrice).toBe("number");
  });

  it("builds a snapshot for a single asset", () => {
    const snapshot = buildAssetSnapshot("SOL", horizons);
    expect(snapshot.symbol).toBe("SOL");
    expect(snapshot.history.length).toBeGreaterThan(0);
    expect(snapshot.predictions).toHaveLength(horizons.length);
  });

  it("builds a portfolio snapshot", () => {
    const portfolio = buildPortfolioSnapshot(horizons);
    expect(portfolio).toHaveLength(listAssets().length);
    expect(portfolio[0].predictions[0].horizonDays).toBe(horizons[0]);
  });
});
