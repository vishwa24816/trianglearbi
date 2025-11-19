"use client";

import type { ArbitragePath } from "@/lib/types";
import { realTimeArbitrageAlerts } from "@/ai/flows/real-time-arbitrage-alerts";
import { useState, useEffect, useCallback } from "react";

const STABLECOINS = ["USDT", "USDC", "FDUSD", "TUSD"];

const initialPaths: Omit<ArbitragePath, "legs" | "profit" | "lastUpdated">[] = [
  // Existing
  { id: "1", path: ["USDT", "BTC", "USDC", "USDT"], pairs: ["BTC/USDT", "BTC/USDC", "USDC/USDT"] },
  { id: "1-rev", path: ["USDT", "USDC", "BTC", "USDT"], pairs: ["USDC/USDT", "BTC/USDC", "BTC/USDT"] },
  { id: "2", path: ["USDT", "ETH", "USDC", "USDT"], pairs: ["ETH/USDT", "ETH/USDC", "USDC/USDT"] },
  { id: "2-rev", path: ["USDT", "USDC", "ETH", "USDT"], pairs: ["USDC/USDT", "ETH/USDC", "ETH/USDT"] },
  { id: "3", path: ["USDT", "USDC", "FDUSD", "USDT"], pairs: ["USDC/USDT", "FDUSD/USDC", "FDUSD/USDT"] },
  { id: "3-rev", path: ["USDT", "FDUSD", "USDC", "USDT"], pairs: ["FDUSD/USDT", "FDUSD/USDC", "USDC/USDT"] },

  // New from user list
  { id: "4", path: ["USDT", "BNB", "FDUSD", "USDT"], pairs: ["BNB/USDT", "BNB/FDUSD", "FDUSD/USDT"] },
  { id: "4-rev", path: ["USDT", "FDUSD", "BNB", "USDT"], pairs: ["FDUSD/USDT", "BNB/FDUSD", "BNB/USDT"] },
  { id: "5", path: ["USDT", "USDC", "TUSD", "USDT"], pairs: ["USDC/USDT", "TUSD/USDC", "TUSD/USDT"] },
  { id: "5-rev", path: ["USDT", "TUSD", "USDC", "USDT"], pairs: ["TUSD/USDT", "TUSD/USDC", "USDC/USDT"] },
  { id: "6", path: ["USDT", "FDUSD", "TUSD", "USDT"], pairs: ["FDUSD/USDT", "TUSD/FDUSD", "TUSD/USDT"] },
  { id: "6-rev", path: ["USDT", "TUSD", "FDUSD", "USDT"], pairs: ["TUSD/USDT", "TUSD/FDUSD", "FDUSD/USDT"] },
  { id: "7", path: ["USDT", "BTC", "FDUSD", "USDT"], pairs: ["BTC/USDT", "BTC/FDUSD", "FDUSD/USDT"] },
  { id: "7-rev", path: ["USDT", "FDUSD", "BTC", "USDT"], pairs: ["FDUSD/USDT", "BTC/FDUSD", "BTC/USDT"] },
  { id: "8", path: ["USDT", "BTC", "TUSD", "USDT"], pairs: ["BTC/USDT", "BTC/TUSD", "TUSD/USDT"] },
  { id: "8-rev", path: ["USDT", "TUSD", "BTC", "USDT"], pairs: ["TUSD/USDT", "BTC/TUSD", "BTC/USDT"] },
  { id: "9", path: ["USDT", "BTC", "ETH", "USDT"], pairs: ["BTC/USDT", "ETH/BTC", "ETH/USDT"] },
  { id: "9-rev", path: ["USDT", "ETH", "BTC", "USDT"], pairs: ["ETH/USDT", "ETH/BTC", "BTC/USDT"] },
  { id: "10", path: ["USDT", "ETH", "FDUSD", "USDT"], pairs: ["ETH/USDT", "ETH/FDUSD", "FDUSD/USDT"] },
  { id: "10-rev", path: ["USDT", "FDUSD", "ETH", "USDT"], pairs: ["FDUSD/USDT", "ETH/FDUSD", "ETH/USDT"] },
  { id: "11", path: ["USDT", "ETH", "BNB", "USDT"], pairs: ["ETH/USDT", "BNB/ETH", "BNB/USDT"] },
  { id: "11-rev", path: ["USDT", "BNB", "ETH", "USDT"], pairs: ["BNB/USDT", "BNB/ETH", "ETH/USDT"] },
  { id: "12", path: ["USDT", "BNB", "USDC", "USDT"], pairs: ["BNB/USDT", "BNB/USDC", "USDC/USDT"] },
  { id: "12-rev", path: ["USDT", "USDC", "BNB", "USDT"], pairs: ["USDC/USDT", "BNB/USDC", "BNB/USDT"] },
  { id: "13", path: ["USDT", "BNB", "BTC", "USDT"], pairs: ["BNB/USDT", "BNB/BTC", "BTC/USDT"] },
  { id: "13-rev", path: ["USDT", "BTC", "BNB", "USDT"], pairs: ["BTC/USDT", "BNB/BTC", "BNB/USDT"] },
  { id: "14", path: ["USDT", "SOL", "USDC", "USDT"], pairs: ["SOL/USDT", "SOL/USDC", "USDC/USDT"] },
  { id: "14-rev", path: ["USDT", "USDC", "SOL", "USDT"], pairs: ["USDC/USDT", "SOL/USDC", "SOL/USDT"] },
  { id: "15", path: ["USDT", "XRP", "USDC", "USDT"], pairs: ["XRP/USDT", "XRP/USDC", "USDC/USDT"] },
  { id: "15-rev", path: ["USDT", "USDC", "XRP", "USDT"], pairs: ["USDC/USDT", "XRP/USDC", "XRP/USDT"] },
  { id: "16", path: ["USDT", "DOGE", "USDC", "USDT"], pairs: ["DOGE/USDT", "DOGE/USDC", "USDC/USDT"] },
  { id: "16-rev", path: ["USDT", "USDC", "DOGE", "USDT"], pairs: ["USDC/USDT", "DOGE/USDC", "DOGE/USDT"] },
];

const initialPrices: { [key: string]: { bid: number; ask: number } } = {
  // Existing
  "BTC/USDT": { bid: 68000, ask: 68001 },
  "BTC/USDC": { bid: 68005, ask: 68006 },
  "USDC/USDT": { bid: 1.0, ask: 1.0 },
  "ETH/USDT": { bid: 3500, ask: 3501 },
  "ETH/USDC": { bid: 3502, ask: 3503 },
  "FDUSD/USDC": { bid: 1.0, ask: 1.0 },
  "FDUSD/USDT": { bid: 1.0, ask: 1.0 },

  // New
  "BNB/USDT": { bid: 580, ask: 580.5 },
  "BNB/FDUSD": { bid: 579.5, ask: 580 },
  "TUSD/USDT": { bid: 1.0, ask: 1.0 },
  "TUSD/USDC": { bid: 1.0, ask: 1.0 },
  "TUSD/FDUSD": { bid: 1.0, ask: 1.0 },
  "BTC/FDUSD": { bid: 68010, ask: 68012 },
  "BTC/TUSD": { bid: 68015, ask: 68017 },
  "ETH/BTC": { bid: 0.051, ask: 0.0511 },
  "ETH/FDUSD": { bid: 3505, ask: 3506 },
  "BNB/ETH": { bid: 0.165, ask: 0.166 },
  "BNB/USDC": { bid: 581, ask: 581.5 },
  "BNB/BTC": { bid: 0.0085, ask: 0.00855 },
  "SOL/USDT": { bid: 150, ask: 150.1 },
  "SOL/USDC": { bid: 150.2, ask: 150.3 },
  "XRP/USDT": { bid: 0.52, ask: 0.521 },
  "XRP/USDC": { bid: 0.522, ask: 0.523 },
  "DOGE/USDT": { bid: 0.15, ask: 0.151 },
  "DOGE/USDC": { bid: 0.152, ask: 0.153 },
};

export function useArbitrageScanner(tradingFee: number) {
  const [paths, setPaths] = useState<ArbitragePath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ id: string; message: string } | null>(
    null
  );

  const calculateProfit = useCallback((path: ArbitragePath, fee: number): number => {
    const startAmount = 1000;
    
    let currentAmount = startAmount;
    let currentAsset = path.path[0];
    
    for (let i = 0; i < path.legs.length; i++) {
        const leg = path.legs[i];
        const nextAsset = path.path[i+1];
        const [base, quote] = leg.symbol.split('/');

        let rate: number;

        if (STABLECOINS.includes(base) && STABLECOINS.includes(quote)) {
            rate = 1.0;
            currentAmount = currentAmount * rate * (1 - fee);
        } else {
            if (currentAsset === quote && nextAsset === base) { // Buy base with quote: e.g. USDT -> BTC with BTC/USDT
                currentAmount = (currentAmount / leg.ask) * (1 - fee);
            } else if (currentAsset === base && nextAsset === quote) { // Sell base for quote: e.g. BTC -> USDT with BTC/USDT
                currentAmount = (currentAmount * leg.bid) * (1 - fee);
            } else {
                // This handles cases where the path doesn't perfectly match the pair order,
                // e.g., path is A->B but pair is B/A. We need to invert the price.
                 if (currentAsset === base) { // e.g. path BTC -> ETH, pair ETH/BTC. Should be a sell.
                     currentAmount = (currentAmount * leg.bid) * (1 - fee);
                 } else { // e.g. path ETH -> BTC, pair ETH/BTC. Should be a buy.
                     currentAmount = (currentAmount / leg.ask) * (1 - fee);
                 }
            }
        }
       currentAsset = nextAsset;
    }

    return ((currentAmount - startAmount) / startAmount) * 100;
  }, []);

  useEffect(() => {
    const prices = { ...initialPrices };
    let profitablePathIteration = 0;

    const interval = setInterval(async () => {
      // Simulate price fluctuations
      for (const symbol in prices) {
        const [base, quote] = symbol.split('/');
        if (STABLECOINS.includes(base) && STABLECOINS.includes(quote)) {
          continue; // Don't fluctuate stable-stable pairs
        }
        
        if (Object.prototype.hasOwnProperty.call(prices, symbol)) {
            const price = prices[symbol];
            const volatility = 0.0005; // 0.05%
            const change = (Math.random() - 0.5) * price.ask * volatility;
            price.bid += change;
            price.ask += change;
            if (price.bid >= price.ask) {
              price.ask = price.bid + price.ask * 0.0001;
            }
        }
      }
      
      // Occasionally create a profitable opportunity for demonstration
      profitablePathIteration++;
      if (profitablePathIteration > 5 && profitablePathIteration < 10) {
        // Make USDT->BTC->USDC->USDT profitable
        prices["BTC/USDC"].bid = prices["BTC/USDT"].ask * (1 + tradingFee * 3 + 0.005);
      } else {
        prices["BTC/USDC"].bid = initialPrices["BTC/USDC"].bid;
      }


      const updatedPaths = initialPaths.map((p) => {
        const legs = p.pairs.map((pairSymbol) => ({
          symbol: pairSymbol,
          ...(prices[pairSymbol] || { bid: 0, ask: 0 }),
        }));
        const newPath = { ...p, legs, profit: 0, lastUpdated: Date.now() };
        newPath.profit = calculateProfit(newPath, tradingFee);
        return newPath;
      });

      setPaths(updatedPaths);
      if (isLoading) setIsLoading(false);
      
      // Check for AI alert
      for (const path of updatedPaths) {
        if (path.profit > 0.1) { // Threshold for AI check
          const bidAskPrices = path.legs.map(l => `${l.symbol}: Bid ${l.bid.toFixed(4)}, Ask ${l.ask.toFixed(4)}`).join('; ');
          try {
            const result = await realTimeArbitrageAlerts({
              arbitragePath: path.path.join('→'),
              potentialProfit: path.profit,
              bidAskPrices,
            });

            if (result.shouldAlert && result.alertMessage) {
              setAlert({ id: path.id + Date.now(), message: result.alertMessage });
            }
          } catch (error) {
            console.error("Error calling GenAI flow:", error);
          }
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [calculateProfit, isLoading, tradingFee]);

  return { paths, isLoading, alert };
}
