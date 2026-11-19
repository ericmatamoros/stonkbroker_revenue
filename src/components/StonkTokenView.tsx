'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StonkTokenStats, StonkTokenCandle } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Lock,
  Coins,
  RefreshCw,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  BarChart3,
  Layers,
  Users,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface StonkTokenViewProps {
  stats: StonkTokenStats | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const POLL_INTERVAL_SECONDS = 300; // 5 minutes (300s)

export const StonkTokenView: React.FC<StonkTokenViewProps> = ({
  stats,
  loading,
  onRefresh,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '15d' | '1m' | 'all'>('30d' === '30d' ? '1m' : '7d');
  const [chartMode, setChartMode] = useState<'price' | 'mcap' | 'volume'>('price');
  const [secondsUntilPull, setSecondsUntilPull] = useState<number>(POLL_INTERVAL_SECONDS);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  // 5-Minute Conditional Polling: ONLY runs while this tab component is mounted/open!
  useEffect(() => {
    setSecondsUntilPull(POLL_INTERVAL_SECONDS);

    const timer = setInterval(() => {
      setSecondsUntilPull((prev) => {
        if (prev <= 1) {
          setIsPulling(true);
          onRefresh().finally(() => setIsPulling(false));
          return POLL_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh]);

  const handleManualPull = async () => {
    setIsPulling(true);
    setSecondsUntilPull(POLL_INTERVAL_SECONDS);
    try {
      await onRefresh();
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 1800);
  };

  // Filter candles for selected timeframe: 7D, 15D, 1M (30D), or Lifetime (ALL)
  const chartData = useMemo<StonkTokenCandle[]>(() => {
    if (!stats) return [];
    const hourly = stats.candlesHourly || [];
    const daily = stats.candlesDaily || [];

    if (timeframe === '7d') {
      // 7 days = 168 hourly candles (or last 7 daily candles fallback)
      if (hourly.length >= 24) {
        return hourly.slice(-168);
      }
      return daily.slice(-8);
    }
    if (timeframe === '15d') {
      // 15 days = 360 hourly candles (or last 15 daily candles fallback)
      if (hourly.length >= 48) {
        return hourly.slice(-360);
      }
      return daily.slice(-16);
    }
    if (timeframe === '1m') {
      // 1 month = last 30 daily candles
      return daily.slice(-31);
    }
    // Lifetime = all daily candles since pool creation
    return daily;
  }, [stats, timeframe]);

  // Calculate period metrics from chartData
  const periodMetrics = useMemo(() => {
    if (!chartData.length || !stats) {
      return {
        startPrice: 0,
        endPrice: 0,
        highPrice: 0,
        lowPrice: 0,
        changePct: 0,
        totalVolumeUsd: 0,
      };
    }
    const startPrice = chartData[0].open || chartData[0].close;
    const endPrice = stats.priceUsd || chartData[chartData.length - 1].close;
    let highPrice = 0;
    let lowPrice = Number.MAX_VALUE;
    let totalVolumeUsd = 0;

    for (const c of chartData) {
      if (c.high > highPrice) highPrice = c.high;
      if (c.low > 0 && c.low < lowPrice) lowPrice = c.low;
      totalVolumeUsd += c.volumeUsd || 0;
    }
    if (lowPrice === Number.MAX_VALUE) lowPrice = endPrice;

    const changePct =
      startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;

    return {
      startPrice,
      endPrice,
      highPrice,
      lowPrice,
      changePct,
      totalVolumeUsd,
    };
  }, [chartData, stats]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  if (loading && !stats) {
    return (
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#cfff04] animate-spin mx-auto" />
        <div className="text-base font-bold text-white">
          Loading $STONKBROKER On-Chain Tokenomics & Price History...
        </div>
        <div className="text-xs text-gray-400">
          Querying Robinhood Chain RPC, Anvil AMM Escrow, and Uniswap V4 Pool Candles
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const isPositivePeriod = periodMetrics.changePct >= 0;
  const freeFloatPct =
    stats.initialMaxSupply > 0
      ? (stats.freeFloatExclDexTokens / stats.initialMaxSupply) * 100
      : 36.0;
  const dexPoolPct =
    stats.initialMaxSupply > 0
      ? (stats.dexLiquidityLockedTokens / stats.initialMaxSupply) * 100
      : 6.61;

  return (
    <div className="space-y-6">
      {/* Top Token Hero Header with 5-Minute Conditional Polling Indicator */}
      <div className="bg-gradient-to-br from-[#141923] via-[#11151e] to-[#0d1017] border border-[#263042] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Token Identity & Live Spot Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-11 h-11 rounded-xl bg-[#cfff04]/15 border-2 border-[#cfff04]/40 flex items-center justify-center text-[#cfff04] font-black text-lg mono shadow-[0_0_15px_rgba(207,255,4,0.2)]">
                $S
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mono">
                    $STONKBROKER
                  </h1>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#cfff04]/15 text-[#cfff04] border border-[#cfff04]/30">
                    Robinhood Chain ERC-20
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                  <span className="mono text-gray-300">
                    {stats.contractAddress.slice(0, 10)}...{stats.contractAddress.slice(-8)}
                  </span>
                  <button
                    onClick={() => handleCopy(stats.contractAddress)}
                    className="text-gray-400 hover:text-white transition"
                    title="Copy token contract address"
                  >
                    {copiedAddr === stats.contractAddress ? (
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span>•</span>
                  <a
                    href={`https://robinhoodchain.blockscout.com/token/${stats.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#38bdf8] hover:underline flex items-center gap-1"
                  >
                    <span>Blockscout</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <a
                    href={`https://dexscreener.com/robinhood/${stats.poolAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#cfff04] hover:underline flex items-center gap-1"
                  >
                    <span>DEXScreener</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Live Price & 5-Min Tab-Only Auto-Pull Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="bg-[#0d1017] border border-[#222a3a] rounded-xl px-4 py-3">
              <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">
                Live Spot Price
              </div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#cfff04] mono">
                  ${stats.priceUsd.toFixed(6)}
                </span>
                <span
                  className={`text-xs font-bold mono px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                    stats.priceChange24h >= 0
                      ? 'bg-[#10b981]/15 text-[#10b981]'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {stats.priceChange24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stats.priceChange24h >= 0 ? '+' : ''}
                  {stats.priceChange24h.toFixed(2)}% (24h)
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mono mt-0.5">
                {stats.priceEth.toFixed(8)} ETH • 1 Broker NFT (666,666) = $
                {stats.brokerBackingUsd.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            {/* 5-Minute Conditional Polling Control Box */}
            <div className="bg-[#0d1017] border border-[#1f2937] rounded-xl p-3 flex flex-col justify-between gap-2 min-w-[215px]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                  </span>
                  <span className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider">
                    5m Auto-Pull Active
                  </span>
                </div>
                <Clock className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="text-[11px] text-gray-400 leading-tight">
                Next price pull in{' '}
                <span className="text-white font-bold mono">
                  {formatCountdown(secondsUntilPull)}
                </span>
                <span className="block text-[10px] text-gray-500 mt-0.5">
                  Polls only while $STONKBROKER tab is open
                </span>
              </div>

              <button
                onClick={handleManualPull}
                disabled={isPulling}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#1c2433] hover:bg-[#263145] text-xs font-bold text-[#cfff04] border border-[#cfff04]/30 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`}
                />
                <span>
                  {isPulling ? 'Pulling Live Price...' : 'Pull Price Now'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supply, Circulating, Locked & Burned (>20%) KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Circulating Tokens */}
        <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Circulating Tokens
            </span>
            <div className="p-2 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mono">
            {(stats.circulatingTokens / 1e9).toFixed(3)}B
          </div>
          <div className="text-xs text-[#38bdf8] font-bold mono mt-0.5">
            {Math.round(stats.circulatingTokens).toLocaleString()} $STONKBROKER
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#1e2532] text-[11px] text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>% of Initial Max Supply:</span>
              <span className="text-white font-bold mono">
                {stats.circulatingPctOfInitial.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Circulating Market Cap:</span>
              <span className="text-[#10b981] font-bold mono">
                ${(stats.marketCapCirculatingUsd / 1e6).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span>Wallet Float (Excl. DEX):</span>
              <span className="text-gray-300 mono">
                {(stats.freeFloatExclDexTokens / 1e9).toFixed(3)}B ({freeFloatPct.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Locked Tokens (AMM Escrow + Protocol Contracts + DEX LP) */}
        <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Locked Tokens
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mono">
            {(stats.totalLockedTokens / 1e9).toFixed(3)}B
          </div>
          <div className="text-xs text-amber-400 font-bold mono mt-0.5">
            {Math.round(stats.totalLockedTokens).toLocaleString()} $STONKBROKER
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#1e2532] text-[11px] text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>% Locked (AMM Escrow):</span>
              <span className="text-amber-400 font-bold mono">
                {stats.lockedPctOfInitial.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Incl. DEX Pool Reserves:</span>
              <span className="text-white font-bold mono">
                {(stats.totalLockedWithDexTokens / 1e9).toFixed(3)}B (
                {(stats.lockedPctOfInitial + dexPoolPct).toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>AMM Vault NFT Inventory:</span>
              <span className="text-gray-300 mono">
                {stats.ammInventoryBrokers.toLocaleString()} Brokers
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Permanently Burned Tokens (>20% On-Chain Verified) */}
        <div className="bg-[#13171f] border-2 border-[#cfff04]/40 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_20px_rgba(207,255,4,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#cfff04] font-bold uppercase tracking-wider">
              Permanently Burned
            </span>
            <div className="p-2 rounded-lg bg-[#cfff04]/15 text-[#cfff04]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#cfff04] mono">
              {stats.burnedPctOfInitial.toFixed(2)}%
            </span>
            <span className="text-sm font-bold text-white mono">
              ({(stats.totalBurnedTokens / 1e6).toFixed(2)}M)
            </span>
          </div>
          <div className="text-xs text-gray-300 font-bold mono mt-0.5">
            {Math.round(stats.totalBurnedTokens).toLocaleString()} $STONKBROKER
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#1e2532] text-[11px] text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Contract Supply Burned:</span>
              <span className="text-white mono">
                {(stats.contractBurnedTokens / 1e6).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span>0x000...dEaD Balance:</span>
              <span className="text-white mono">
                {(stats.deadAddressBurnedTokens / 1e6).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span>Brokers Burned Equiv.:</span>
              <span className="text-[#cfff04] font-bold mono">
                {stats.brokersBurnedEquivalent.toFixed(1)} Brokers
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Combined Burned + Completely Locked */}
        <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Burned + Escrow Locked
            </span>
            <div className="p-2 rounded-lg bg-[#10b981]/10 text-[#10b981]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#10b981] mono">
            {stats.burnedPlusLockedPct.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-300 font-bold mono mt-0.5">
            {(stats.burnedPlusLockedTokens / 1e9).toFixed(3)}B /{' '}
            {(stats.initialMaxSupply / 1e9).toFixed(3)}B Max
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#1e2532] text-[11px] text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Initial Genesis Supply:</span>
              <span className="text-white mono">2,962,663,704</span>
            </div>
            <div className="flex justify-between">
              <span>Current Onchain Supply:</span>
              <span className="text-white mono">
                {Math.round(stats.currentTotalSupply).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>On-Chain Token Holders:</span>
              <span className="text-[#38bdf8] font-bold mono">
                {stats.holdersCount.toLocaleString()} wallets
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart Section: 7 Days, 15 Days, 1 Month & Lifetime */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#cfff04]" />
              <h2 className="text-lg font-bold text-white">
                $STONKBROKER Historical Price & Market Cap Chart
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Live Uniswap V4 Pool ({stats.poolAddress.slice(0, 10)}...) OHLCV feed • Auto-refreshes every 5 minutes while tab is active
            </p>
          </div>

          {/* Timeframe & Chart Mode Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe Selector: 7D, 15D, 1M, Lifetime */}
            <div className="bg-[#0d1017] border border-[#222a38] rounded-xl p-1 flex items-center gap-1">
              {[
                { id: '7d', label: '7 Days' },
                { id: '15d', label: '15 Days' },
                { id: '1m', label: '1 Month' },
                { id: 'all', label: 'Lifetime' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    timeframe === tf.id
                      ? 'bg-[#cfff04] text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Chart Mode Selector */}
            <div className="bg-[#0d1017] border border-[#222a38] rounded-xl p-1 flex items-center gap-1">
              {[
                { id: 'price', label: 'Price (USD)' },
                { id: 'mcap', label: 'Market Cap' },
                { id: 'volume', label: 'Price + Vol' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setChartMode(m.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    chartMode === m.id
                      ? 'bg-[#252f42] text-[#cfff04] border border-[#cfff04]/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Period Performance Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#0d1017] border border-[#1e2532] rounded-xl p-3.5">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
              Period Change ({timeframe.toUpperCase()})
            </span>
            <span
              className={`text-base font-extrabold mono mt-0.5 block ${
                isPositivePeriod ? 'text-[#10b981]' : 'text-rose-400'
              }`}
            >
              {isPositivePeriod ? '+' : ''}
              {periodMetrics.changePct.toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
              Period Start Price
            </span>
            <span className="text-base font-bold text-gray-200 mono mt-0.5 block">
              ${periodMetrics.startPrice.toFixed(6)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
              Period High
            </span>
            <span className="text-base font-bold text-[#10b981] mono mt-0.5 block">
              ${periodMetrics.highPrice.toFixed(6)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
              Period Low
            </span>
            <span className="text-base font-bold text-amber-400 mono mt-0.5 block">
              ${periodMetrics.lowPrice.toFixed(6)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
              Period DEX Volume
            </span>
            <span className="text-base font-bold text-[#38bdf8] mono mt-0.5 block">
              ${Math.round(periodMetrics.totalVolumeUsd).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'volume' ? (
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="stonkPriceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cfff04" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#cfff04" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
                <XAxis
                  dataKey="displayTime"
                  stroke="#64748b"
                  fontSize={11}
                  tickMargin={8}
                  minTickGap={28}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#cfff04"
                  fontSize={11}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `$${Number(v).toFixed(4)}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#38bdf8"
                  fontSize={10}
                  tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload as StonkTokenCandle;
                    return (
                      <div className="bg-[#0d1017] border border-[#2e384b] rounded-xl p-3 shadow-2xl text-xs space-y-1.5 font-mono">
                        <div className="font-bold text-white border-b border-[#1e2532] pb-1">
                          {d.displayTime} ({d.dateStr.split('T')[0]})
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Close Price:</span>
                          <span className="text-[#cfff04] font-bold">
                            ${d.close.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">High / Low:</span>
                          <span className="text-gray-200">
                            ${d.high.toFixed(5)} / ${d.low.toFixed(5)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Volume:</span>
                          <span className="text-[#38bdf8] font-bold">
                            ${Math.round(d.volumeUsd).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Circ. Market Cap:</span>
                          <span className="text-[#10b981]">
                            ${(d.marketCapUsd / 1e6).toFixed(2)}M
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="volumeUsd"
                  fill="#38bdf8"
                  opacity={0.25}
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="close"
                  stroke="#cfff04"
                  strokeWidth={2.2}
                  dot={false}
                />
              </ComposedChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="stonkAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositivePeriod ? '#cfff04' : '#fb7185'}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositivePeriod ? '#cfff04' : '#fb7185'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
                <XAxis
                  dataKey="displayTime"
                  stroke="#64748b"
                  fontSize={11}
                  tickMargin={8}
                  minTickGap={28}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) =>
                    chartMode === 'mcap'
                      ? `$${(Number(v) / 1e6).toFixed(2)}M`
                      : `$${Number(v).toFixed(4)}`
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload as StonkTokenCandle;
                    return (
                      <div className="bg-[#0d1017] border border-[#2e384b] rounded-xl p-3 shadow-2xl text-xs space-y-1.5 font-mono">
                        <div className="font-bold text-white border-b border-[#1e2532] pb-1">
                          {d.displayTime} ({d.dateStr.split('T')[0]})
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Price (Close):</span>
                          <span className="text-[#cfff04] font-bold">
                            ${d.close.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Open:</span>
                          <span className="text-gray-300">
                            ${d.open.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">High / Low:</span>
                          <span className="text-gray-200">
                            ${d.high.toFixed(6)} / ${d.low.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Circ. Market Cap:</span>
                          <span className="text-[#10b981] font-bold">
                            ${(d.marketCapUsd / 1e6).toFixed(2)}M
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Volume:</span>
                          <span className="text-[#38bdf8]">
                            ${Math.round(d.volumeUsd).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={chartMode === 'mcap' ? 'marketCapUsd' : 'close'}
                  stroke={isPositivePeriod ? '#cfff04' : '#fb7185'}
                  strokeWidth={2.2}
                  fill="url(#stonkAreaGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supply Distribution Bar & On-Chain Burn/Lock Audit Breakdown */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#cfff04]" />
              On-Chain Supply Distribution & Burn / Lock Verification
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Genesis Supply: 4,444 StonkBrokers × 666,666 $STONKBROKER = 2,962,663,704 $STONKBROKER
            </p>
          </div>
          <span className="text-xs font-mono text-[#cfff04] bg-[#cfff04]/10 border border-[#cfff04]/30 px-3 py-1 rounded-lg font-bold">
            {stats.burnedPctOfInitial.toFixed(2)}% Permanently Burned •{' '}
            {stats.lockedPctOfInitial.toFixed(2)}% Escrow Locked
          </span>
        </div>

        {/* Visual Segmented Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-xl overflow-hidden bg-[#0d1017] border border-[#222a38] flex">
            <div
              style={{ width: `${stats.burnedPctOfInitial}%` }}
              className="bg-[#cfff04] h-full transition-all"
              title={`Permanently Burned: ${stats.burnedPctOfInitial.toFixed(2)}%`}
            />
            <div
              style={{ width: `${stats.lockedPctOfInitial}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`AMM Escrow & Protocol Locked: ${stats.lockedPctOfInitial.toFixed(2)}%`}
            />
            <div
              style={{ width: `${dexPoolPct}%` }}
              className="bg-[#a855f7] h-full transition-all"
              title={`Uniswap V4 Liquidity Pool Reserves: ${dexPoolPct.toFixed(2)}%`}
            />
            <div
              style={{ width: `${freeFloatPct}%` }}
              className="bg-[#38bdf8] h-full transition-all"
              title={`Liquid Wallet Float: ${freeFloatPct.toFixed(2)}%`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#cfff04] flex-shrink-0" />
              <span className="text-gray-300">
                Burned:{' '}
                <strong className="text-white mono">
                  {stats.burnedPctOfInitial.toFixed(2)}%
                </strong>{' '}
                ({(stats.totalBurnedTokens / 1e6).toFixed(1)}M)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500 flex-shrink-0" />
              <span className="text-gray-300">
                AMM Escrow Locked:{' '}
                <strong className="text-white mono">
                  {stats.lockedPctOfInitial.toFixed(2)}%
                </strong>{' '}
                ({(stats.totalLockedTokens / 1e9).toFixed(2)}B)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#a855f7] flex-shrink-0" />
              <span className="text-gray-300">
                DEX Liquidity:{' '}
                <strong className="text-white mono">
                  {dexPoolPct.toFixed(2)}%
                </strong>{' '}
                ({(stats.dexLiquidityLockedTokens / 1e6).toFixed(1)}M)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#38bdf8] flex-shrink-0" />
              <span className="text-gray-300">
                Wallet Float:{' '}
                <strong className="text-white mono">
                  {freeFloatPct.toFixed(2)}%
                </strong>{' '}
                ({(stats.freeFloatExclDexTokens / 1e9).toFixed(2)}B)
              </span>
            </div>
          </div>
        </div>

        {/* Detailed On-Chain Supply & Lock Audit Table */}
        <div className="overflow-x-auto border border-[#1f2633] rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0d1017] text-gray-400 border-b border-[#1f2633]">
              <tr>
                <th className="py-2.5 px-4">Supply Bucket / Contract</th>
                <th className="py-2.5 px-4">Verification / Mechanism</th>
                <th className="py-2.5 px-4 text-right">$STONKBROKER Amount</th>
                <th className="py-2.5 px-4 text-right">USD Value</th>
                <th className="py-2.5 px-4 text-right">% of Genesis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#19202c]">
              <tr className="hover:bg-[#161c26]">
                <td className="py-2.5 px-4 font-bold text-[#cfff04]">
                  1. Contract Burned (Activation Fees)
                </td>
                <td className="py-2.5 px-4 text-gray-400">
                  50% of every Broker & Intern tier activation fee is burned (Initial − totalSupply)
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#cfff04]">
                  {Math.round(stats.contractBurnedTokens).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right text-gray-300">
                  ${Math.round(stats.contractBurnedTokens * stats.priceUsd).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#cfff04]">
                  {((stats.contractBurnedTokens / stats.initialMaxSupply) * 100).toFixed(2)}%
                </td>
              </tr>
              <tr className="hover:bg-[#161c26]">
                <td className="py-2.5 px-4 font-bold text-[#cfff04]">
                  2. Dead Address Burn (0x000...dEaD)
                </td>
                <td className="py-2.5 px-4 text-gray-400">
                  Tokens sent directly to 0x000000000000000000000000000000000000dEaD
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#cfff04]">
                  {Math.round(stats.deadAddressBurnedTokens).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right text-gray-300">
                  ${Math.round(stats.deadAddressBurnedTokens * stats.priceUsd).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#cfff04]">
                  {((stats.deadAddressBurnedTokens / stats.initialMaxSupply) * 100).toFixed(2)}%
                </td>
              </tr>
              <tr className="bg-[#cfff04]/5 hover:bg-[#cfff04]/10">
                <td className="py-2.5 px-4 font-extrabold text-white">
                  SUBTOTAL: PERMANENTLY BURNED
                </td>
                <td className="py-2.5 px-4 text-[#cfff04]">
                  Equivalent to {stats.brokersBurnedEquivalent.toFixed(1)} StonkBrokers permanently removed
                </td>
                <td className="py-2.5 px-4 text-right font-extrabold text-[#cfff04]">
                  {Math.round(stats.totalBurnedTokens).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-white">
                  ${Math.round(stats.totalBurnedTokens * stats.priceUsd).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-extrabold text-[#cfff04]">
                  {stats.burnedPctOfInitial.toFixed(2)}%
                </td>
              </tr>
              <tr className="hover:bg-[#161c26]">
                <td className="py-2.5 px-4 font-bold text-amber-400">
                  3. Anvil AMM Escrow Vault (0x799a...cf62)
                </td>
                <td className="py-2.5 px-4 text-gray-400">
                  Locked token escrow backing NFT swaps (666,666 per Broker NFT)
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-amber-400">
                  {Math.round(stats.ammEscrowLockedTokens).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right text-gray-300">
                  ${Math.round(stats.ammEscrowLockedTokens * stats.priceUsd).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-amber-400">
                  {((stats.ammEscrowLockedTokens / stats.initialMaxSupply) * 100).toFixed(2)}%
                </td>
              </tr>
              <tr className="hover:bg-[#161c26]">
                <td className="py-2.5 px-4 font-bold text-amber-400">
                  4. Clock In Reward Engines
                </td>
                <td className="py-2.5 px-4 text-gray-400">
                  Unclaimed $STONKBROKER held in Broker & Intern Clock In contracts
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-amber-400">
                  {Math.round(stats.protocolEnginesLockedTokens).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right text-gray-300">
                  ${Math.round(stats.protocolEnginesLockedTokens * stats.priceUsd).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-amber-400">
                  {((stats.protocolEnginesLockedTokens / stats.initialMaxSupply) * 100).toFixed(2)}%
                </td>
              </tr>
              <tr className="hover:bg-[#161c26]">
                <td className="py-2.5 px-4 font-bold text-[#c084fc]">
                  5. Uniswap V4 Pool Reserves
                </td>
                <td className="py-2.5 px-4 text-gray-400">
                  Active DEX liquidity paired with {stats.poolEthReserves.toFixed(1)} ETH (${(stats.liquidityUsd / 1e6).toFixed(2)}M TVL)
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#c084fc]">
                  {Math.round(stats.dexLiquidityLockedTokens).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right text-gray-300">
                  ${Math.round(stats.dexLiquidityLockedTokens * stats.priceUsd).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#c084fc]">
                  {dexPoolPct.toFixed(2)}%
                </td>
              </tr>
              <tr className="hover:bg-[#161c26]">
                <td className="py-2.5 px-4 font-bold text-[#38bdf8]">
                  6. Circulating Supply (Incl. DEX Liquidity)
                </td>
                <td className="py-2.5 px-4 text-gray-400">
                  Held across {stats.holdersCount.toLocaleString()} wallets, ERC-6551 TBAs & DEX pools
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#38bdf8]">
                  {Math.round(stats.circulatingTokens).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">
                  ${Math.round(stats.marketCapCirculatingUsd).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[#38bdf8]">
                  {stats.circulatingPctOfInitial.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
