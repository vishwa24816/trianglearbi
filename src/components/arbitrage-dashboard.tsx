"use client";

import { useEffect } from "react";
import { Zap } from "lucide-react";

import { ArbitrageTable } from "@/components/arbitrage-table";
import { useArbitrageScanner } from "@/hooks/use-arbitrage-scanner";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

export function ArbitrageDashboard() {
  const { paths, isLoading, alert } = useArbitrageScanner();
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
