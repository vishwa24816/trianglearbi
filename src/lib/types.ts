export type ArbitragePath = {
  id: string;
  path: string[];
  pairs: string[];
  legs: {
    symbol: string;
    bid: number;
    ask: number;
  }[];
  profit: number;
  lastUpdated: number;
};
