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

export interface TierStatItem {
  tierId: number;
  tierName: string;
  multiplier: string;
  activatedCount: number;
  deactivatedCount: number;
  totalMinted: number;
  activeWeight: number;
  sharePct: number;
}

export interface TierActivationBreakdown {
  interns: {
    totalActivated: number;
    totalDeactivated: number;
    totalWeight: number;
    tiers: TierStatItem[];
  };
  brokers: {
    totalActivated: number;
    totalDeactivated: number;
    totalWeight: number;
    tiers: TierStatItem[];
  };
}

export interface TierEvolutionDay {
  date: string;
  displayDate: string;
  brokerFeesUsd: number;
  internFeesUsd: number;
  totalFeesUsd: number;
  brokerFeesEth: number;
  internFeesEth: number;
  totalFeesEth: number;
  freshmanActive: number;
  sophomoreActive: number;
  juniorActive: number;
  seniorActive: number;
  alumnusActive: number;
  totalInternsActive: number;
  internsActivated: number;
  internsDeactivated: number;
  floorTraderActive: number;
  analystActive: number;
  portfolioManagerActive: number;
  managingDirectorActive: number;
  partnerActive: number;
  totalBrokersActive: number;
  brokersActivated: number;
  brokersDeactivated: number;
  roundsCount: number;
}

export interface WeekOverWeekItem {
  metric: string;
  currentWeek: string | number;
  previousWeek: string | number;
  diff: string | number;
  changePct: number;
  isPositive: boolean;
}

export interface HistoricalDistributionsResult {
  rounds: DistributionRound[];
  dailies: DailyDistributionSummary[];
  tierStats: TierActivationBreakdown;
  evolution: TierEvolutionDay[];
  wowGrowth: WeekOverWeekItem[];
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

export interface ProjectionRateSnapshot {
  dailyUsd: number;
  dailyStonk: number;
  dailyEth: number;
  internBaseDailyUsd: number;
  parentSliceDailyUsd: number;
  brokerDailyUsd: number;
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
  rates?: {
    pace24h: ProjectionRateSnapshot;
    avg7d: ProjectionRateSnapshot;
    avg30d: ProjectionRateSnapshot;
  };
  perTokenDaily: Array<{
    symbol: string;
    amount: number;
    usd: number;
  }>;
}

export interface WalletTransactionEvent {
  type: 'buy' | 'sell' | 'mint' | 'activate';
  title: string;
  assetName: string;
  tokenId: string;
  weightDelta: number;
}

export interface WalletAccrualDay {
  date: string;
  displayDate: string;
  internsHeld: number;
  brokersHeld: number;
  walletWeight: number;
  sharePct: number;
  baseAccruedUsd: number;
  parentSliceAccruedUsd: number;
  brokerAccruedUsd: number;
  dailyAccruedUsd: number;
  dailyAccruedStonk: number;
  dailyAccruedEth: number;
  cumulativeAccruedUsd: number;
  cumulativeAccruedStonk: number;
  avgPerInternUsd?: number;
  events?: WalletTransactionEvent[];
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
  history30d?: WalletAccrualDay[];
  cachedAt: string;
  fromCache: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  connected: boolean;
}
