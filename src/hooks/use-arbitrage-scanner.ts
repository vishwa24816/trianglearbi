"use client";

import type { ArbitragePath } from "@/lib/types";
import { realTimeArbitrageAlerts } from "@/ai/flows/real-time-arbitrage-alerts";
import { useState, useEffect, useCallback } from "react";

const initialPaths: Omit<ArbitragePath, "legs" | "profit" | "lastUpdated">[] = [
  {
    id: "1",
    path: ["USDT", "BTC", "USDC", "USDT"],
    pairs: ["BTC/USDT", "BTC/USDC", "USDC/USDT"],
  },
  {
    id: "2",
    path: ["USDT", "ETH", "USDC", "USDT"],
    pairs: ["ETH/USDT", "ETH/USDC", "USDC/USDT"],
  },
  {
    id: "3",
    path: ["USDT", "USDC", "FDUSD", "USDT"],
    pairs: ["USDC/USDT", "FDUSD/USDC", "FDUSD/USDT"],
  },
];

const initialPrices: { [key: string]: { bid: number; ask: number } } = {
  "BTC/USDT": { bid: 68000, ask: 68001 },
  "BTC/USDC": { bid: 68005, ask: 68006 },
  "USDC/USDT": { bid: 0.999, ask: 1.001 },
  "ETH/USDT": { bid: 3500, ask: 3501 },
  "ETH/USDC": { bid: 3502, ask: 3503 },
  "FDUSD/USDC": { bid: 1.0, ask: 1.001 },
  "FDUSD/USDT": { bid: 0.999, ask: 1.0 },
};

const TRADING_FEE = 0.001; // 0.1%

export function useArbitrageScanner() {
  const [paths, setPaths] = useState<ArbitragePath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ id: string; message: string } | null>(
    null
  );

  const calculateProfit = useCallback((path: ArbitragePath): number => {
    const [p1, p2, p3] = path.path;
    const [l1, l2, l3] = path.legs;
    let finalAmount = 1000; // Start with 1000 of the initial currency

    // USDT -> BTC -> USDC -> USDT
    if (p1 === "USDT" && p2 === "BTC" && p3 === "USDC") {
      const amountB = (finalAmount / l1.ask) * (1 - TRADING_FEE); // USDT -> BTC
      const amountC = (amountB * l2.bid) * (1 - TRADING_FEE);     // BTC -> USDC
      finalAmount = (amountC * l3.bid) * (1 - TRADING_FEE);       // USDC -> USDT
    }
    // USDT -> ETH -> USDC -> USDT
    else if (p1 === "USDT" && p2 === "ETH" && p3 === "USDC") {
      const amountB = (finalAmount / l1.ask) * (1 - TRADING_FEE); // USDT -> ETH
      const amountC = (amountB * l2.bid) * (1 - TRADING_FEE);     // ETH -> USDC
      finalAmount = (amountC * l3.bid) * (1 - TRADING_FEE);       // USDC -> USDT
    }
     // USDT -> USDC -> FDUSD -> USDT
    else if (p1 === 'USDT' && p2 === 'USDC' && p3 === 'FDUSD') {
        const amountB = (finalAmount * l1.bid) * (1 - TRADING_FEE); // USDT -> USDC (Pair is USDC/USDT)
        const amountC = (amountB / l2.ask) * (1 - TRADING_FEE);     // USDC -> FDUSD
        finalAmount = (amountC * l3.bid) * (1 - TRADING_FEE);       // FDUSD -> USDT
    }


    return ((finalAmount - 1000) / 1000) * 100;
  }, []);

  useEffect(() => {
    const prices = { ...initialPrices };
    let profitablePathIteration = 0;

    const interval = setInterval(async () => {
      // Simulate price fluctuations
      for (const symbol in prices) {
        const price = prices[symbol];
        const volatility = 0.0005; // 0.05%
        const change = (Math.random() - 0.5) * price.ask * volatility;
        price.bid += change;
        price.ask += change;
        if (price.bid >= price.ask) {
          price.ask = price.bid + price.ask * 0.0001;
        }
      }
      
      // Occasionally create a profitable opportunity for demonstration
      profitablePathIteration++;
      if (profitablePathIteration > 5 && profitablePathIteration < 10) {
        // Make USDT->BTC->USDC->USDT profitable
        prices["BTC/USDC"].bid = prices["BTC/USDT"].ask * 1.005;
      } else {
        prices["BTC/USDC"].bid = initialPrices["BTC/USDC"].bid;
      }


      const updatedPaths = initialPaths.map((p) => {
        const legs = p.pairs.map((pairSymbol) => ({
          symbol: pairSymbol,
          ...prices[pairSymbol],
        }));
        const newPath = { ...p, legs, profit: 0, lastUpdated: Date.now() };
        newPath.profit = calculateProfit(newPath);
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
  }, [calculateProfit, isLoading]);

  return { paths, isLoading, alert };
}
