export interface TradeHistoryItem {
  id: string;
  date: string;
  timestamp: number;
  buyPrice: number;
  sellPrice: number;
  amountSold: number; // USDT
  investmentMXN: number; // Cost basis for the sold amount
  revenueMXN: number;
  profitMXN: number;
  roi: number;
  notes?: string;
}

export interface MonthlyLimitState {
  limitUSD: number;
  usedUSD: number;
  exchangeRate: number; // For display purposes (USD -> MXN reference)
  lastResetMonth: number; // 0-11
}

export interface GlobalInventory {
  totalUSDT: number;
  averageBuyPrice: number; // Weighted average (optional complexity, sticking to simpler current op for now)
}

export interface CalculationResult {
  profitMXN: number;
  roi: number;
  spread: number;
  totalRevenueMXN: number;
  remainingInventory: number;
}

export enum Tab {
  CALCULATOR = 'CALCULATOR',
  DASHBOARD = 'DASHBOARD'
}