'use client';

import React from 'react';
import { ClockInPotData } from '@/types';
import {
  Zap,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Shield,
  Coins,
  Cpu,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface PotOverviewProps {
  potData: ClockInPotData | null;
  loading: boolean;
  onRefresh: () => void;
}

export const PotOverview: React.FC<PotOverviewProps> = ({ potData, loading }) => {
  if (loading || !potData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-[#13171f] rounded-xl border border-[#242b38]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-[#13171f] rounded-xl border border-[#242b38]"></div>
          <div className="h-32 bg-[#13171f] rounded-xl border border-[#242b38]"></div>
          <div className="h-32 bg-[#13171f] rounded-xl border border-[#242b38]"></div>
        </div>
      </div>
    );
  }

  const {
    brokerEngineEth,
    internEngineEth,
    totalPotEth,
    totalPotUsd,
    minDropEth,
    progressPct,
    runRate24hEth,
    runRate24hUsd,
    runRate7dUsd,
    runRate30dUsd,
    ethPriceUsd,
    revenueSources,
  } = potData;

  const annualizedRunRateUsd = runRate24hUsd * 365;

  return (
    <div className="space-y-6">
      {/* Hero Banner: Live Accumulating Pot */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121620] via-[#10141d] to-[#0c0e14] border-2 border-[#242b38] p-6 lg:p-8 card-glow">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#cfff04]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cfff04] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#cfff04]"></span>
              </span>
              <span className="text-xs font-bold text-[#cfff04] tracking-widest uppercase">
                Live Clock In Accumulation Pot
              </span>
              <span className="text-xs text-gray-400">• Community Crankable</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mono">
                {totalPotEth.toFixed(4)} <span className="text-2xl font-normal text-gray-400">ETH</span>
              </h1>
              <span className="text-xl sm:text-2xl font-semibold text-[#10b981] mono">
                ≈ ${totalPotUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Protocol fees flow continuously into the Clock In contracts from Stonklauncher taxes, Anvil NFT AMM swaps, Smart LP vaults, Safety Deposit Box, royalties, and Intern desks. When the minimum drop threshold is reached, any user can crank the round onchain.
            </p>
          </div>

          {/* Crank Readiness Card */}
          <div className="w-full lg:w-80 bg-[#161a23] border border-[#2b3342] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-300 font-medium">Round Crank Progress</span>
              <span className="mono font-bold text-[#cfff04]">{progressPct.toFixed(1)}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#0d0f14] h-3 rounded-full overflow-hidden border border-[#242b38] p-0.5">
              <div
                className="bg-gradient-to-r from-[#10b981] via-[#cfff04] to-[#f59e0b] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(207,255,4,0.4)]"
                style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
              <span>Current: {brokerEngineEth.toFixed(4)} ETH</span>
              <span>Min Target: {minDropEth.toFixed(3)} ETH</span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#242b38] flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Drop Status</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {progressPct >= 100 ? 'Ready to Crank' : 'Accumulating Fees'}
              </span>
            </div>
          </div>
        </div>

        {/* Contract Balances Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#242b38]/70">
          <div className="bg-[#141822]/80 border border-[#222836] rounded-lg p-3">
            <div className="text-[11px] text-gray-400 font-medium">Broker Clock In 3.0</div>
            <div className="text-base font-bold text-white mono mt-0.5">{brokerEngineEth.toFixed(4)} ETH</div>
            <div className="text-[10px] text-gray-500 mono truncate">0xf412...bc58</div>
          </div>

          <div className="bg-[#141822]/80 border border-[#222836] rounded-lg p-3">
            <div className="text-[11px] text-gray-400 font-medium">Intern Clock In 3.0</div>
            <div className="text-base font-bold text-white mono mt-0.5">{internEngineEth.toFixed(4)} ETH</div>
            <div className="text-[10px] text-gray-500 mono truncate">0xf90a...c059</div>
          </div>

          <div className="bg-[#141822]/80 border border-[#222836] rounded-lg p-3 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-gray-400 font-medium">Robinhood ETH Mark</div>
            <div className="text-base font-bold text-[#cfff04] mono mt-0.5">${ethPriceUsd.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500 mono">Chainlink Oracles</div>
          </div>
        </div>
      </div>

      {/* Revenue Velocity & Run Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
            <span>24h Fee Run Rate</span>
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-bold text-white mono">
            ${runRate24hUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-[#10b981] mt-1 mono font-medium">
            {runRate24hEth.toFixed(3)} ETH / 24 hours
          </div>
        </div>

        <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
            <span>7-Day Run Rate</span>
            <Zap className="w-4 h-4 text-[#cfff04]" />
          </div>
          <div className="text-2xl font-bold text-white mono">
            ${runRate7dUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-400 mt-1 mono">
            {(runRate24hEth * 7).toFixed(2)} ETH projected
          </div>
        </div>

        <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
            <span>30-Day Monthly Rate</span>
            <Layers className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-2xl font-bold text-white mono">
            ${runRate30dUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-400 mt-1 mono">
            {(runRate24hEth * 30).toFixed(1)} ETH projected
          </div>
        </div>

        <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
            <span>Annualized Pace</span>
            <ArrowUpRight className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-bold text-white mono">
            ${annualizedRunRateUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-[#f59e0b] mt-1 mono font-medium">
            {(runRate24hEth * 365).toFixed(0)} ETH / year
          </div>
        </div>
      </div>

      {/* Revenue Inflow Breakdown: Detailed Stream Architecture */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#cfff04]" />
              Incoming Revenue Streams
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Breakdown of how protocol value streams from across the StonkBrokers suite into the Clock In pot
            </p>
          </div>
          <span className="text-xs mono bg-[#1a202c] border border-[#2d3748] px-2.5 py-1 rounded text-gray-300">
            6 Core Protocol Pillars
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {revenueSources.map((source, idx) => {
            const icons = {
              launcher: <Flame className="w-4 h-4 text-[#f59e0b]" />,
              amm: <Coins className="w-4 h-4 text-[#cfff04]" />,
              smart_lp: <Layers className="w-4 h-4 text-[#38bdf8]" />,
              locker: <Shield className="w-4 h-4 text-[#38bdf8]" />,
              royalties: <Shield className="w-4 h-4 text-[#ec4899]" />,
              desks: <Cpu className="w-4 h-4 text-[#a855f7]" />,
              mints: <Zap className="w-4 h-4 text-[#10b981]" />,
              other: <Zap className="w-4 h-4 text-gray-400" />,
            };

            return (
              <div
                key={idx}
                className="bg-[#171c26] border border-[#273040] hover:border-[#3a475e] transition-all rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#202736] border border-[#2f394c]">
                        {icons[source.category] || icons.other}
                      </div>
                      <span className="font-semibold text-white text-sm">{source.name}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#252e3e] text-[#cfff04] mono border border-[#344259]">
                      {source.percentage}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {source.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#242b38] flex items-center justify-between text-xs">
                  <span className="text-gray-400">Est. 24h Inflow</span>
                  <div className="text-right">
                    <span className="font-bold text-white mono">
                      ${source.estimated24hUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-gray-500 block mono">
                      {source.estimated24hEth.toFixed(3)} ETH
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
