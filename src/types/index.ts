export interface RevenueSourceBreakdown {
  name: string;
  category: 'amm' | 'launcher' | 'smart_lp' | 'locker' | 'royalties' | 'desks' | 'mints' | 'other';
  percentage: string;
  description: string;
  estimated24hEth: number;
  estimated24hUsd: number;
}

export interface ClockInPotData {
  pendingEth: number;
  pendingUsd: number;
  minDropEth: number;
  minDropUsd: number;
  progressPct: number;
  phase: number;
  phaseName: string;
  brokerEngineEth: number;
  internEngineEth: number;
  safetyDepositEth: number;
  totalPotEth: number;
  totalPotUsd: number;
  runRate24hEth: number;
  runRate24hUsd: number;
  runRate7dUsd: number;
  runRate30dUsd: number;
  ethPriceUsd: number;
  updatedAt: string;
  revenueSources: RevenueSourceBreakdown[];
}

export interface DistributionRound {
  round: number;
  engine: string;
  engineKey: string;
  engineLabel: string;
  ethIn: string;
  ethInFormatted: number;
  usdIn: number;
  totalWeight: number;
  recipients: number;
  txHash: string;
  block: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface DailyDistributionSummary {
  date: string;
  totalEth: number;
  totalUsd: number;
  brokerEth: number;
  internEth: number;
  roundsCount: number;
  recipientsCount: number;
}

export interface TokenDeliveryTotal {
  symbol: string;
  stockAddress: string;
  decimals: number;
  totalUnits: string;
  totalFormatted: number;
  usdPrice: number;
  totalUsd: number;
  dropsCount: number;
}

export interface TbaBalanceItem {
  symbol: string;
  address: string;
  balanceRaw: string;
  balanceFormatted: string;
  usdPrice: number;
  usdValue: number;
}

export interface BrokerNFTItem {
  tokenId: string;
  isActivated: boolean;
  tierId: number;
  tierName: string;
  weightBps: number;
  multiplier: string;
  tbaAddress: string;
  tbaBalances: TbaBalanceItem[];
  tbaTotalUsd: number;
  internsInside: number;
  internsMinted: number;
}

export interface PendingCreditItem {
  token: string;
  symbol: string;
  amountRaw: string;
  amountFormatted: string;
  usdValue: number;
}

export interface InternNFTItem {
  tokenId: string;
  parentBrokerId: string;
  isActivated: boolean;
  tierId: number;
  tierName: string;
  activationMultiplier: string;
  weightBps: number;
  jobTitle: string;
  paySharePct: string;
  parentStatus?: string;
  parentBrokerTier?: string;
  effectivePaySharePct?: string;
  tbaAddress: string;
  tbaBalances: TbaBalanceItem[];
  tbaTotalUsd: number;
  pendingCredits: PendingCreditItem[];
  dependentCredits: PendingCreditItem[];
  pendingTotalUsd: number;
}

export interface RevenueProjections {
  walletWeight: number;
  networkWeight: number;
  sharePercentage: number;
  dailyEth: number;
  dailyUsd: number;
  weeklyEth: number;
  weeklyUsd: number;
  monthlyEth: number;
  monthlyUsd: number;
  annualEth: number;
  annualUsd: number;
  dailyStonk: number;
  weeklyStonk: number;
  monthlyStonk: number;
  annualStonk: number;
  internBaseDailyUsd: number;
  parentSliceDailyUsd: number;
  brokerDailyEth?: number;
  internEngineDailyEth?: number;
  parentCutDailyEth?: number;
  perTokenDaily: Array<{
    symbol: string;
    amount: number;
    usd: number;
  }>;
}

export interface WalletInspectionResult {
  walletAddress: string;
  brokersCount: number;
  activatedBrokersCount: number;
  internsCount: number;
  activatedInternsCount: number;
  totalActiveWeight: number;
  brokerActiveWeight?: number;
  internActiveWeight?: number;
  networkTotalWeight: number;
  sharePercentage: number;
  brokers: BrokerNFTItem[];
  interns: InternNFTItem[];
  totalTbaPortfolioUsd: number;
  totalPendingPayoutsUsd: number;
  totalPendingStonk: number;
  stonkPriceUsd: number;
  projections: RevenueProjections;
  cachedAt: string;
  fromCache: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  connected: boolean;
}
