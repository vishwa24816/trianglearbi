"use client";

import { useEffect, useState } from "react";
import { Zap, Percent } from "lucide-react";

import { ArbitrageTable } from "@/components/arbitrage-table";
import { useArbitrageScanner } from "@/hooks/use-arbitrage-scanner";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";

const tradingFeeOptions = [
  { label: "0.3%", value: 0.003 },
  { label: "0.2%", value: 0.002 },
  { label: "0.1%", value: 0.001 },
  { label: "0.08%", value: 0.0008 },
];

export function ArbitrageDashboard() {
  const [tradingFee, setTradingFee] = useState(tradingFeeOptions[0].value);
  const { paths, isLoading, alert } = useArbitrageScanner(tradingFee);
  const { toast } = useToast();

  useEffect(() => {
    if (alert) {
      toast({
        title: "⚡️ Significant Opportunity Alert",
        description: alert.message,
      });
    }
  }, [alert, toast]);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">ArbiSniffer</h1>
        </div>
        <p className="text-muted-foreground">
          Real-time Binance triangular arbitrage scanner
        </p>
      </header>
      
      <div className="mb-4 flex justify-end">
        <div className="grid w-full max-w-[180px] items-center gap-1.5">
          <Label htmlFor="trading-fee" className="flex items-center gap-2 text-xs text-muted-foreground">
            <Percent className="h-3 w-3" />
            Trading Fee
          </Label>
          <Select
            value={String(tradingFee)}
            onValueChange={(value) => setTradingFee(Number(value))}
          >
            <SelectTrigger id="trading-fee" className="h-9">
              <SelectValue placeholder="Select trading fee" />
            </SelectTrigger>
            <SelectContent>
              {tradingFeeOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <ArbitrageTable data={paths} />
      )}
    </main>
  );
}
