'use client';

import React, { useState, useMemo } from 'react';
import { DailyDistributionSummary, DistributionRound, TokenDeliveryTotal } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Search,
  ExternalLink,
  Coins,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface DistributionsLedgerProps {
  rounds: DistributionRound[];
  dailies: DailyDistributionSummary[];
  tokens: TokenDeliveryTotal[];
  loading: boolean;
}

export const DistributionsLedger: React.FC<DistributionsLedgerProps> = ({
  rounds,
  dailies,
  tokens,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [engineFilter, setEngineFilter] = useState<'all' | 'broker' | 'intern'>('all');
  const [chartMetric, setChartMetric] = useState<'usd' | 'eth'>('usd');
  const [chartDays, setChartDays] = useState<number>(30);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filtered rounds
  const filteredRounds = useMemo(() => {
    return rounds.filter((r) => {
      const matchesSearch =
        searchTerm === '' ||
        String(r.round).includes(searchTerm) ||
        r.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.block).includes(searchTerm);

      const matchesEngine =
        engineFilter === 'all' ||
        (engineFilter === 'broker' && !r.engineLabel.includes('Intern')) ||
        (engineFilter === 'intern' && r.engineLabel.includes('Intern'));

      return matchesSearch && matchesEngine;
    });
  }, [rounds, searchTerm, engineFilter]);

  // Paginated rounds
  const paginatedRounds = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRounds.slice(start, start + itemsPerPage);
  }, [filteredRounds, currentPage]);

  const totalPages = Math.ceil(filteredRounds.length / itemsPerPage);

  // Chart data sliced
  const chartData = useMemo(() => {
    const reversed = [...dailies].reverse();
    return reversed.slice(-chartDays).map((d) => ({
      date: d.date.slice(5), // MM-DD
      fullDate: d.date,
      value: chartMetric === 'usd' ? d.totalUsd : d.totalEth,
      broker: chartMetric === 'usd' ? d.brokerEth * 2486 : d.brokerEth,
      intern: chartMetric === 'usd' ? d.internEth * 2486 : d.internEth,
      rounds: d.roundsCount,
      recipients: d.recipientsCount,
    }));
  }, [dailies, chartDays, chartMetric]);

  // Totals calculations
  const totalEthDelivered = useMemo(
    () => rounds.reduce((acc, r) => acc + r.ethInFormatted, 0),
    [rounds]
  );
  const totalUsdDelivered = totalEthDelivered * 2486;

  if (loading && rounds.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-[#13171f] rounded-2xl border border-[#242b38]"></div>
        <div className="h-96 bg-[#13171f] rounded-2xl border border-[#242b38]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-5">
          <div className="text-xs text-gray-400 font-medium mb-1">Total Lifetime Distributed</div>
          <div className="text-3xl font-black text-white mono">
            ${totalUsdDelivered.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-[#10b981] mt-1 mono font-medium">
            {totalEthDelivered.toFixed(2)} ETH swapped to stocks & $STONK
          </div>
        </div>

        <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-5">
          <div className="text-xs text-gray-400 font-medium mb-1">Total Rounds Cranked</div>
          <div className="text-3xl font-black text-[#cfff04] mono">
            {rounds.length.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Permissionless community cranked executions
          </div>
        </div>

        <div className="bg-[#13171f] border border-[#242b38] rounded-xl p-5">
          <div className="text-xs text-gray-400 font-medium mb-1">Tokens in Stock Menu</div>
          <div className="text-3xl font-black text-[#38bdf8] mono">
            {tokens.length} Assets
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Robinhood tokenized stocks + $STONKBROKER + USDG
          </div>
        </div>
      </div>

      {/* Daily Delivered Amounts Chart */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#cfff04]" />
              Daily Amount Delivered to Activated Holders
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Cumulative ETH converted and delivered to broker & intern ERC-6551 vaults per day
            </p>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center gap-2">
            <div className="bg-[#181d26] p-1 rounded-lg border border-[#242b38] flex items-center text-xs">
              <button
                onClick={() => setChartMetric('usd')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  chartMetric === 'usd' ? 'bg-[#cfff04] text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setChartMetric('eth')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  chartMetric === 'eth' ? 'bg-[#cfff04] text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                ETH
              </button>
            </div>

            <div className="bg-[#181d26] p-1 rounded-lg border border-[#242b38] flex items-center text-xs">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-2 py-1 rounded font-medium transition ${
                    chartDays === d ? 'bg-[#2b3342] text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cfff04" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#cfff04" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2430" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => (chartMetric === 'usd' ? `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` : `${v.toFixed(1)}`)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#181d27] border border-[#2b3342] p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-bold text-white mono">{data.fullDate}</div>
                        <div className="text-[#cfff04] font-bold mono">
                          Total: {chartMetric === 'usd' ? `$${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${data.value.toFixed(4)} ETH`}
                        </div>
                        <div className="text-gray-400">
                          Rounds: <span className="text-white mono">{data.rounds}</span> • Recipients: <span className="text-white mono">{data.recipients}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#cfff04"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Delivered Assets Breakdown */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#38bdf8]" />
              Cumulative Stock & Token Distributions
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Historical totals swapped and credited into holder ERC-6551 wallets across all rounds
            </p>
          </div>
          <span className="text-xs text-gray-400 mono">
            {tokens.reduce((acc, t) => acc + t.dropsCount, 0).toLocaleString()} token drop credits
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {tokens.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#161b24] border border-[#242c3b] hover:border-[#38bdf8]/40 rounded-xl p-3 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm mono">{t.symbol}</span>
                  <span className="text-[10px] text-gray-500 mono">{t.dropsCount} drops</span>
                </div>
                <div className="text-base font-bold text-[#38bdf8] mono mt-1">
                  {t.totalFormatted.toLocaleString(undefined, {
                    minimumFractionDigits: t.decimals === 18 && t.totalFormatted < 100 ? 2 : 0,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-[#202735] flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Est. USD</span>
                <span className="font-semibold text-gray-200 mono">
                  ${t.totalUsd > 0 ? t.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Rounds Ledger Table */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#cfff04]" />
              Historical Rounds Ledger
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Every round tallied, swapped, and distributed on Robinhood Chain
            </p>
          </div>

          {/* Search & Engine Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search round or tx..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#181d26] border border-[#242b38] text-xs text-white placeholder-gray-500 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#cfff04]/50 mono"
              />
            </div>

            <div className="bg-[#181d26] p-0.5 rounded-lg border border-[#242b38] flex items-center text-xs">
              <button
                onClick={() => {
                  setEngineFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  engineFilter === 'all' ? 'bg-[#2b3342] text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setEngineFilter('broker');
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  engineFilter === 'broker' ? 'bg-[#2b3342] text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Brokers
              </button>
              <button
                onClick={() => {
                  setEngineFilter('intern');
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  engineFilter === 'intern' ? 'bg-[#2b3342] text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Interns
              </button>
            </div>
          </div>
        </div>

        {/* Rounds Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#242b38] text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Round</th>
                <th className="py-2.5 px-3">Engine</th>
                <th className="py-2.5 px-3">ETH Dropped</th>
                <th className="py-2.5 px-3">USD Value</th>
                <th className="py-2.5 px-3">Recipients</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Block</th>
                <th className="py-2.5 px-3 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2430]">
              {paginatedRounds.map((r, idx) => (
                <tr key={idx} className="hover:bg-[#181d27] transition">
                  <td className="py-2.5 px-3 font-bold text-white mono">#{r.round}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        r.engineLabel.includes('Intern')
                          ? 'bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30'
                          : 'bg-[#cfff04]/10 text-[#cfff04] border-[#cfff04]/30'
                      }`}
                    >
                      {r.engineLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white mono">{r.ethInFormatted.toFixed(4)} ETH</td>
                  <td className="py-2.5 px-3 text-[#10b981] font-semibold mono">${r.usdIn.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-gray-300 mono">{r.recipients.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-gray-400 mono">{r.date}</td>
                  <td className="py-2.5 px-3 text-gray-400 mono">{r.block}</td>
                  <td className="py-2.5 px-3 text-right">
                    {r.txHash ? (
                      <a
                        href={`https://robinhoodchain.blockscout.com/tx/${r.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#38bdf8] hover:text-[#7dd3fc] mono text-[11px]"
                      >
                        <span>{r.txHash.slice(0, 6)}...{r.txHash.slice(-4)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedRounds.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No distribution rounds found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#242b38] text-xs">
            <span className="text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredRounds.length)} of {filteredRounds.length} rounds
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-[#181d26] border border-[#242b38] rounded disabled:opacity-40 hover:text-white"
              >
                Previous
              </button>
              <span className="mono text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-[#181d26] border border-[#242b38] rounded disabled:opacity-40 hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
