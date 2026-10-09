'use client';

import React, { useState, useEffect } from 'react';
import { WalletInspectionResult } from '@/types';
import {
  Search,
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  TrendingUp,
  Sliders,
  DollarSign,
  Briefcase,
  Users,
  Database,
  RefreshCw,
  Coins,
} from 'lucide-react';

interface WalletInspectorProps {
  initialAddress?: string;
  onInspectWallet: (address: string, forceRefresh?: boolean) => Promise<WalletInspectionResult | null>;
}

export const WalletInspector: React.FC<WalletInspectorProps> = ({
  initialAddress,
  onInspectWallet,
}) => {
  const [addressInput, setAddressInput] = useState(
    initialAddress || '0x6e659392a047b21e0b91bd5da1e4fda9ac8f7e12'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WalletInspectionResult | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [volumeMultiplier, setVolumeMultiplier] = useState<number>(1);
  const [payoutMode, setPayoutMode] = useState<'stonk' | 'basket'>('stonk');
  const [activeTab, setActiveTab] = useState<'brokers' | 'interns'>('brokers');

  const executeSearch = async (addrToSearch: string, forceRefresh = false) => {
    if (!addrToSearch || !/^0x[a-fA-F0-9]{40}$/.test(addrToSearch.trim())) {
      alert('Please enter a valid Robinhood Chain Ethereum address (0x...)');
      return;
    }
    setLoading(true);
    try {
      const data = await onInspectWallet(addrToSearch.trim(), forceRefresh);
      setResult(data);
      if (data) {
        if (data.brokersCount === 0 && data.internsCount > 0) {
          setActiveTab('interns');
        } else {
          setActiveTab('brokers');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAddress) {
      setAddressInput(initialAddress);
      executeSearch(initialAddress);
    } else {
      executeSearch('0x6e659392a047b21e0b91bd5da1e4fda9ac8f7e12');
    }
  }, [initialAddress]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Search Box */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#cfff04]" />
              Wallet Revenue & Holdings Inspector
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Analyze StonkBrokers, Interns, Activation Tiers, ERC-6551 TBA vault balances, and Clock In revenue projections
            </p>
          </div>

          {/* Sample quick buttons */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-gray-400 text-[11px]">Quick presets:</span>
            <button
              onClick={() => {
                const sample = '0x6e659392a047b21e0b91bd5da1e4fda9ac8f7e12';
                setAddressInput(sample);
                executeSearch(sample);
              }}
              className="px-2.5 py-1 rounded bg-[#1c222e] hover:bg-[#252e3e] text-[#cfff04] mono border border-[#cfff04]/30 transition text-[11px] font-semibold"
            >
              My Wallet (15 Interns)
            </button>
            <button
              onClick={() => {
                const sample = '0x9c0c1c4c50657e8f5e04c0bfb6d653b724e83048';
                setAddressInput(sample);
                executeSearch(sample);
              }}
              className="px-2 py-1 rounded bg-[#1c222e] hover:bg-[#252e3e] text-gray-300 mono border border-[#2b3648] transition text-[11px]"
            >
              Top Broker Holder
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(addressInput);
          }}
          className="mt-4 flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Robinhood Chain wallet address (0x...)"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full bg-[#171c26] border border-[#283244] text-sm text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#cfff04]/60 mono shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#cfff04] hover:bg-[#bceb00] text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(207,255,4,0.3)]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Searching...
                </>
              ) : (
                'Inspect Wallet'
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => executeSearch(addressInput, true)}
              title="Force refresh from onchain contracts"
              className="p-2.5 rounded-xl bg-[#1a202c] hover:bg-[#242b38] text-gray-300 border border-[#2d3748] transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#cfff04]' : ''}`} />
            </button>
          </div>
        </form>

        {/* Cache status tag */}
        {result && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-[#1e2430] pt-3">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>
                {result.fromCache ? (
                  <span className="text-[#38bdf8]">Loaded from Supabase cache</span>
                ) : (
                  <span className="text-[#10b981]">Freshly queried onchain & cached to Supabase</span>
                )}
              </span>
            </div>
            <span className="mono text-[11px] text-gray-500">
              Updated: {new Date(result.cachedAt).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>StonkBrokers Owned</span>
                <Briefcase className="w-4 h-4 text-[#cfff04]" />
              </div>
              <div className="text-2xl font-black text-white mono">{result.brokersCount}</div>
              <div className="text-xs text-[#10b981] font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {result.activatedBrokersCount} Activated
              </div>
            </div>

            <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Stonk Interns Owned</span>
                <Users className="w-4 h-4 text-[#a855f7]" />
              </div>
              <div className="text-2xl font-black text-white mono">{result.internsCount}</div>
              <div className="text-xs text-gray-400 mt-1">
                {result.activatedInternsCount} on payroll
              </div>
            </div>

            <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Active Weight</span>
                <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div className="text-2xl font-black text-[#38bdf8] mono">
                {result.totalActiveWeight.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1 mono">
                {result.sharePercentage.toFixed(3)}% of network
              </div>
            </div>

            <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>TBA Vault Assets</span>
                <Coins className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-2xl font-black text-[#10b981] mono">
                ${result.totalTbaPortfolioUsd.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Holding stock tokens & $STONK
              </div>
            </div>
          </div>

          {/* Live Unclaimed Clock In Payouts Banner (Matching Official Suite) */}
          {result.totalPendingStonk > 0 && (
            <div className="bg-gradient-to-r from-[#172010] via-[#141b11] to-[#12161f] border-2 border-[#cfff04]/40 rounded-2xl p-5 shadow-[0_0_20px_rgba(207,255,4,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#cfff04]/10 border border-[#cfff04]/30 flex items-center justify-center font-black text-[#cfff04] text-xl shadow">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#cfff04]">
                      Clock In Available (Unclaimed Payouts)
                    </span>
                    <span className="text-[10px] bg-[#cfff04] text-black font-black px-1.5 py-0.5 rounded">
                      {result.interns.filter((i) => i.pendingCredits && i.pendingCredits.length > 0).length} Interns Ready
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white mono mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>
                      {result.totalPendingStonk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $STONKBROKER
                    </span>
                    <span className="text-sm font-semibold text-[#10b981]">
                      ≈ ${result.totalPendingPayoutsUsd.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Live contract pending rewards: 25.42 $STONK per Freshman (1.00x), 50.83 $STONK per Senior (2.00x) + active parent slices.
                  </div>
                </div>
              </div>

              <a
                href="https://www.stonkbrokers.cash/clock-in"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#cfff04] hover:bg-[#bceb00] text-black font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-[0_0_15px_rgba(207,255,4,0.4)] whitespace-nowrap self-stretch md:self-auto justify-center"
              >
                <span>Clock In on Main Suite</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Revenue Projections Engine */}
          <div className="bg-gradient-to-br from-[#151a24] to-[#10141d] border-2 border-[#2b3548] rounded-2xl p-6 card-glow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#cfff04]" />
                  Clock In Revenue Projections
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Calibrated onchain daily run-rate across {result.internsCount} Interns ({result.totalActiveWeight.toLocaleString()} weight, {result.sharePercentage.toFixed(3)}% of network)
                </p>

                {/* Engine Source Breakdown Pills */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] bg-[#a855f7]/15 text-[#c084fc] border border-[#a855f7]/30 px-2 py-0.5 rounded font-medium">
                    Intern Pot Base: ${(result.projections.internBaseDailyUsd || 0).toFixed(2)}/day (406.7 $STONK)
                  </span>
                  {(result.projections.parentSliceDailyUsd || 0) > 0 && (
                    <span className="text-[11px] bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 px-2 py-0.5 rounded font-medium">
                      Active Parent Slices: +${(result.projections.parentSliceDailyUsd || 0).toFixed(2)}/day (~{((result.projections.parentSliceDailyUsd || 0) / (result.stonkPriceUsd || 0.004955)).toFixed(0)} $STONK)
                    </span>
                  )}
                  {(result.projections.brokerDailyEth || 0) > 0 && (
                    <span className="text-[11px] bg-[#cfff04]/15 text-[#cfff04] border border-[#cfff04]/30 px-2 py-0.5 rounded font-medium">
                      Broker Clock In: +${((result.projections.brokerDailyEth || 0) * 2486).toFixed(2)}/day
                    </span>
                  )}
                </div>
              </div>

              {/* Controls: Payout Mode + Surge Slider */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Payout asset toggle */}
                <div className="bg-[#1b2230] border border-[#2c374c] rounded-xl p-1 flex items-center gap-1">
                  <button
                    onClick={() => setPayoutMode('stonk')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      payoutMode === 'stonk'
                        ? 'bg-[#cfff04] text-black shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    100% $STONK Mode
                  </button>
                  <button
                    onClick={() => setPayoutMode('basket')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      payoutMode === 'basket'
                        ? 'bg-[#cfff04] text-black shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Electable Basket
                  </button>
                </div>

                {/* What-if volume slider */}
                <div className="bg-[#1b2230] border border-[#2c374c] rounded-xl p-2 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[#cfff04]" />
                  <span className="text-xs text-gray-300 font-medium">Surge:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 5, 10].map((m) => (
                      <button
                        key={m}
                        onClick={() => setVolumeMultiplier(m)}
                        className={`px-2 py-0.5 rounded text-xs mono font-bold transition ${
                          volumeMultiplier === m
                            ? 'bg-[#cfff04] text-black'
                            : 'bg-[#232c3d] text-gray-400 hover:text-white'
                        }`}
                      >
                        {m}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Projected Timeframe Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#181f2c] border border-[#273244] rounded-xl p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">Daily Projected</div>
                <div className="text-2xl font-bold text-white mono">
                  ${(result.projections.dailyUsd * volumeMultiplier).toFixed(2)}
                </div>
                <div className="text-xs text-[#cfff04] mono mt-1 font-bold">
                  ≈ {((result.projections.dailyStonk || 0) * volumeMultiplier).toFixed(0)} $STONKBROKER / day
                </div>
                <div className="text-[11px] text-gray-400 mono mt-0.5">
                  {(result.projections.dailyEth * volumeMultiplier).toFixed(5)} ETH / day
                </div>
              </div>

              <div className="bg-[#181f2c] border border-[#273244] rounded-xl p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">Weekly Projected</div>
                <div className="text-2xl font-bold text-white mono">
                  ${(result.projections.weeklyUsd * volumeMultiplier).toFixed(2)}
                </div>
                <div className="text-xs text-[#cfff04] mono mt-1 font-bold">
                  ≈ {((result.projections.weeklyStonk || 0) * volumeMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })} $STONK / week
                </div>
                <div className="text-[11px] text-gray-400 mono mt-0.5">
                  {(result.projections.weeklyEth * volumeMultiplier).toFixed(4)} ETH / week
                </div>
              </div>

              <div className="bg-[#181f2c] border border-[#273244] rounded-xl p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">Monthly Projected</div>
                <div className="text-2xl font-bold text-white mono">
                  ${(result.projections.monthlyUsd * volumeMultiplier).toFixed(2)}
                </div>
                <div className="text-xs text-[#cfff04] mono mt-1 font-bold">
                  ≈ {((result.projections.monthlyStonk || 0) * volumeMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })} $STONK / mo
                </div>
                <div className="text-[11px] text-gray-400 mono mt-0.5">
                  {(result.projections.monthlyEth * volumeMultiplier).toFixed(3)} ETH / month
                </div>
              </div>

              <div className="bg-[#181f2c] border border-[#273244] rounded-xl p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">Annual Projected</div>
                <div className="text-2xl font-bold text-[#cfff04] mono">
                  ${(result.projections.annualUsd * volumeMultiplier).toFixed(2)}
                </div>
                <div className="text-xs text-[#cfff04] mono mt-1 font-bold">
                  ≈ {((result.projections.annualStonk || 0) * volumeMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })} $STONK / yr
                </div>
                <div className="text-[11px] text-gray-400 mono mt-0.5">
                  {(result.projections.annualEth * volumeMultiplier).toFixed(2)} ETH / year
                </div>
              </div>
            </div>

            {/* Asset Delivery Breakdown */}
            <div className="mt-4 pt-4 border-t border-[#232c3d]">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-2">
                <span>
                  {payoutMode === 'stonk'
                    ? 'Active Payout Delivery: 100% $STONKBROKER (Real spot price $0.004955)'
                    : 'Electable Multi-Asset Diversification Menu:'}
                </span>
                <span className="text-gray-400 font-normal">
                  {payoutMode === 'stonk' ? 'As selected on official suite' : 'Calculated electable token units'}
                </span>
              </div>

              {payoutMode === 'stonk' ? (
                <div className="bg-[#181f2c] border border-[#263142] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#cfff04]/10 border border-[#cfff04]/30 flex items-center justify-center font-bold text-[#cfff04] text-xs">
                      $SB
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white mono">
                        {((result.projections.dailyStonk || 0) * volumeMultiplier).toFixed(2)} $STONKBROKER per day
                      </div>
                      <div className="text-xs text-gray-400">
                        Spot price: ${(result.stonkPriceUsd || 0.004955).toFixed(6)} USD • Onchain DEX source
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-[#10b981] mono">
                      ${(result.projections.dailyUsd * volumeMultiplier).toFixed(2)} USD / day
                    </div>
                    <div className="text-xs text-gray-400 mono">
                      ${(result.projections.monthlyUsd * volumeMultiplier).toFixed(2)} / month
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {result.projections.perTokenDaily.map((item, idx) => (
                    <div key={idx} className="bg-[#19202c] border border-[#252f40] rounded-lg p-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white mono">{item.symbol}</span>
                        <span className="text-gray-400 mono">
                          ${(item.usd * volumeMultiplier).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#38bdf8] mono mt-0.5 truncate">
                        ≈ {(item.amount * volumeMultiplier).toFixed(item.symbol === '$STONKBROKER' ? 0 : 4)}{' '}
                        units
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Holdings Detail Tabs: Brokers vs Interns */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#242b38] pb-2">
              <button
                onClick={() => setActiveTab('brokers')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'brokers'
                    ? 'bg-[#cfff04] text-black shadow-[0_0_10px_rgba(207,255,4,0.3)]'
                    : 'text-gray-400 hover:text-white bg-[#13171f]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                StonkBrokers ({result.brokers.length})
              </button>

              <button
                onClick={() => setActiveTab('interns')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'interns'
                    ? 'bg-[#cfff04] text-black shadow-[0_0_10px_rgba(207,255,4,0.3)]'
                    : 'text-gray-400 hover:text-white bg-[#13171f]'
                }`}
              >
                <Users className="w-4 h-4" />
                Stonk Interns ({result.interns.length})
              </button>
            </div>

            {/* Brokers List */}
            {activeTab === 'brokers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.brokers.map((broker) => (
                  <div
                    key={broker.tokenId}
                    className="bg-[#13171f] border border-[#242b38] hover:border-[#38465c] rounded-xl p-4 flex flex-col justify-between transition"
                  >
                    <div>
                      {/* Top Broker Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-[#1c222c] border border-[#cfff04]/30 flex items-center justify-center font-bold text-white mono text-sm shadow">
                            #{broker.tokenId}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">Broker #{broker.tokenId}</div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-0.5 ${
                                broker.isActivated
                                  ? 'bg-[#cfff04]/10 text-[#cfff04] border-[#cfff04]/30'
                                  : 'bg-gray-800 text-gray-400 border-gray-700'
                              }`}
                            >
                              {broker.tierName} • {broker.multiplier}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs mono font-bold text-gray-300">
                          {broker.weightBps.toLocaleString()} weight
                        </span>
                      </div>

                      {/* TBA Account Details */}
                      <div className="mt-4 p-2.5 bg-[#171c26] border border-[#252e3e] rounded-lg">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                          <span>ERC-6551 TBA Vault</span>
                          <button
                            onClick={() => handleCopy(broker.tbaAddress)}
                            className="text-[#38bdf8] hover:text-white flex items-center gap-1 mono"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedAddress === broker.tbaAddress ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="text-[11px] text-gray-300 mono truncate">
                          {broker.tbaAddress}
                        </div>

                        {/* TBA Balances inside */}
                        <div className="mt-2 pt-2 border-t border-[#242b38] space-y-1">
                          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            Vault Holdings
                          </div>
                          {broker.tbaBalances.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-gray-300 mono">{item.symbol}</span>
                              <span className="text-white font-bold mono">
                                {item.balanceFormatted}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#242b38] flex items-center justify-between text-[11px] text-gray-400">
                      <span>Companion Interns:</span>
                      <span className="text-white font-semibold">2 inside wallet</span>
                    </div>
                  </div>
                ))}

                {result.brokers.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-[#13171f] rounded-xl border border-[#242b38]">
                    No StonkBrokers found in this wallet.
                  </div>
                )}
              </div>
            )}

            {/* Interns List */}
            {activeTab === 'interns' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.interns.map((intern) => (
                  <div
                    key={intern.tokenId}
                    className="bg-[#13171f] border border-[#242b38] hover:border-[#a855f7]/40 rounded-xl p-4 flex flex-col justify-between transition"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-[#201828] border border-[#a855f7]/30 flex items-center justify-center font-bold text-[#c084fc] mono text-sm shadow">
                            #{intern.tokenId}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">Intern #{intern.tokenId}</div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-0.5 bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30">
                              {intern.tierName} ({intern.activationMultiplier || '1.00x'}) • {intern.jobTitle}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs mono font-bold block ${
                              intern.parentStatus === 'Active' ? 'text-[#10b981]' : 'text-amber-400'
                            }`}
                          >
                            {intern.parentStatus === 'Active'
                              ? `${intern.paySharePct} pay share`
                              : '0% (Parent Inactive)'}
                          </span>
                          <span
                            className={`text-[10px] font-medium flex items-center justify-end gap-1 mt-0.5 ${
                              intern.parentStatus === 'Active' ? 'text-[#10b981]' : 'text-gray-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                intern.parentStatus === 'Active' ? 'bg-[#10b981]' : 'bg-amber-400'
                              }`}
                            />
                            {intern.parentStatus === 'Active' ? 'Active Payroll' : `${intern.paySharePct} nominal`}
                          </span>
                        </div>
                      </div>

                      {/* Live Pending Clock In Payout Box (Matching Screenshot) */}
                      {intern.pendingCredits && intern.pendingCredits.length > 0 && (
                        <div className="mt-3 p-2 bg-[#1b2516] border border-[#cfff04]/30 rounded-lg flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-1.5 text-xs text-[#cfff04] font-bold mono">
                            <span className="w-2 h-2 rounded-full bg-[#cfff04] animate-pulse" />
                            <span>Clock In: {intern.pendingCredits[0].amountFormatted} $STONKBROKER</span>
                          </div>
                          <span className="text-xs text-gray-300 mono font-semibold">
                            ≈ ${intern.pendingCredits[0].usdValue.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Dependent Credits (Parent Broker Slice) */}
                      {intern.dependentCredits && intern.dependentCredits.length > 0 && (
                        <div className="mt-1 px-2 py-1 bg-[#131b24] border border-[#38bdf8]/20 rounded-md flex items-center justify-between text-[11px] mono">
                          <span className="text-[#38bdf8]">
                            Parent Slice: +{intern.dependentCredits[0].amountFormatted} {intern.dependentCredits[0].symbol}
                          </span>
                          <span className="text-gray-400">
                            ≈ ${intern.dependentCredits[0].usdValue.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* TBA Account & Vault Holdings */}
                      <div className="mt-4 p-2.5 bg-[#171c26] border border-[#252e3e] rounded-lg">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                          <span>ERC-6551 TBA Vault</span>
                          <button
                            onClick={() => handleCopy(intern.tbaAddress)}
                            className="text-[#38bdf8] hover:text-white flex items-center gap-1 mono"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedAddress === intern.tbaAddress ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="text-[11px] text-gray-300 mono truncate">
                          {intern.tbaAddress}
                        </div>

                        {/* TBA Balances inside Intern Vault */}
                        <div className="mt-2.5 pt-2 border-t border-[#242b38] space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                            <span className="text-gray-400">Vault Holdings</span>
                            <span className="text-[#10b981] mono font-bold">
                              ${intern.tbaTotalUsd.toFixed(2)} USD
                            </span>
                          </div>
                          {intern.tbaBalances && intern.tbaBalances.length > 0 ? (
                            intern.tbaBalances.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between text-xs bg-[#12161f] px-2 py-1 rounded border border-[#1e2533]"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="text-white font-semibold mono">{item.symbol}</span>
                                  <span className="text-[10px] text-gray-400 mono">
                                    (${item.usdValue.toFixed(3)})
                                  </span>
                                </div>
                                <span className="text-[#cfff04] font-bold mono">
                                  {item.balanceFormatted}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-gray-500 italic py-0.5">
                              No token balance currently in vault
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#242b38] flex items-center justify-between text-[11px] text-gray-400">
                      <span>Parent Broker:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-semibold mono">#{intern.parentBrokerId}</span>
                        {intern.parentBrokerTier && (
                          <span className="text-[10px] bg-[#1c222e] text-gray-300 px-1.5 py-0.5 rounded border border-[#273244]">
                            {intern.parentBrokerTier}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {result.interns.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-[#13171f] rounded-xl border border-[#242b38]">
                    No Stonk Interns found in this wallet.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
