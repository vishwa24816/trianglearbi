"use client";

import * as React from "react";
import type { ArbitragePath } from "@/lib/types";
import {
  ArrowDown,
  ArrowUp,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";

type SortConfig = {
  key: keyof ArbitragePath | "lastUpdated";
  direction: "ascending" | "descending";
};

function formatProfit(profit: number) {
  const sign = profit > 0 ? "+" : "";
  return `${sign}${profit.toFixed(4)}%`;
}

export function ArbitrageTable({ data }: { data: ArbitragePath[] }) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: "profit",
    direction: "descending",
  });

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: SortConfig["key"]) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortConfig["key"]) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="rounded-lg border">
      <Accordion type="single" collapsible className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12"></TableHead> {/* For accordion trigger */}
              <TableHead>Path</TableHead>
              <TableHead className="w-48 text-right">
                <Button variant="ghost" onClick={() => requestSort("profit")}>
                  Profit / Loss
                  {getSortIcon("profit")}
                </Button>
              </TableHead>
              <TableHead className="w-48 text-right">
                <Button
                  variant="ghost"
                  onClick={() => requestSort("lastUpdated")}
                >
                  Last Updated
                  {getSortIcon("lastUpdated")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        
        {sortedData.map((path) => (
          <AccordionItem value={path.id} key={path.id} className="border-b">
             <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="w-12">
                      <AccordionTrigger className="p-0 w-full justify-center [&>svg]:ml-2" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        {path.path[0]}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        {path.path[1]}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        {path.path[2]}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        {path.path[3]}
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn("w-48 text-right font-mono", {
                        "text-primary": path.profit > 0,
                        "text-destructive": path.profit < 0,
                        "text-muted-foreground": path.profit === 0,
                      })}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {path.profit > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {formatProfit(path.profit)}
                      </div>
                    </TableCell>
                    <TableCell className="w-48 text-right text-muted-foreground">
                      {formatDistanceToNow(path.lastUpdated, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                </TableBody>
             </Table>
            <AccordionContent>
              <div className="bg-muted/30 p-4">
                <h4 className="mb-2 font-semibold">Trade Legs</h4>
                <ul className="space-y-2">
                  {path.legs.map((leg, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-md bg-background/50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="font-semibold">{leg.symbol}</span>
                      </div>
                      <div className="font-mono text-sm">
                        <span className="text-muted-foreground">Bid: </span>
                        <span>{leg.bid.toFixed(4)}</span>
                        <span className="mx-2 text-muted-foreground">|</span>
                        <span className="text-muted-foreground">Ask: </span>
                        <span>{leg.ask.toFixed(4)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
