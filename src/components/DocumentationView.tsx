'use client';

import React from 'react';
import { CONTRACTS, BROKER_TIERS, INTERN_TIERS } from '@/lib/stonkService';
import { ExternalLink, BookOpen, Layers, ShieldCheck, Cpu, Code2 } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-[#cfff04]/10 text-[#cfff04] border border-[#cfff04]/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              StonkBrokers Clock In & Revenue Architecture
            </h2>
            <p className="text-xs text-gray-400">
              Technical protocol specifications, smart contract addresses, activation math, and data routing
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          Clock In is the permissionless distribution engine of StonkBrokers on Robinhood Chain (chain ID 4663). Protocol fees in ETH collected from the suite are swapped into Robinhood tokenized stocks (AAPL, AMZN, NVDA, GOOGL, GME, TSLA, PLTR, AMD, USDG, $STONKBROKER) and delivered directly into the ERC-6551 token-bound wallets of activated StonkBroker NFTs and their Stonk Interns.
        </p>
      </div>

      {/* Contract Deployments Reference */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
        <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#cfff04]" />
          Verified Robinhood Chain Mainnet Contracts (ID 4663)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#242b38] text-gray-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Contract Role</th>
                <th className="py-2.5 px-3">Address</th>
                <th className="py-2.5 px-3 text-right">Blockscout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2430]">
              {[
                { name: 'Broker Clock In 3.0 Engine', addr: CONTRACTS.brokerClockIn },
                { name: 'Intern Clock In 3.0 Engine', addr: CONTRACTS.internClockIn },
                { name: 'Broker Activation Manager', addr: CONTRACTS.activationManager },
                { name: 'Intern Activation Manager', addr: CONTRACTS.internActivationManager },
                { name: 'StonkBrokers NFT (4,444 Supply)', addr: CONTRACTS.stonkBrokersCollection },
                { name: 'Stonk Interns NFT (8,888 Supply)', addr: CONTRACTS.stonkInternsCollection },
                { name: '$STONKBROKER Token', addr: CONTRACTS.stonkBrokerToken },
                { name: 'Safety Deposit Box Clock In', addr: CONTRACTS.safetyDepositClockIn },
                { name: 'Anvil NFT AMM Vault', addr: CONTRACTS.ammVault },
                { name: 'Canonical WETH', addr: CONTRACTS.weth },
              ].map((c, i) => (
                <tr key={i} className="hover:bg-[#181d27] transition">
                  <td className="py-2.5 px-3 font-semibold text-white">{c.name}</td>
                  <td className="py-2.5 px-3 mono text-gray-300">{c.addr}</td>
                  <td className="py-2.5 px-3 text-right">
                    <a
                      href={`https://robinhoodchain.blockscout.com/address/${c.addr}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#38bdf8] hover:underline inline-flex items-center gap-1 mono text-[11px]"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activation Tiers & Math */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brokers Ladder */}
        <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-[#cfff04]" />
            StonkBrokers Activation Ladder
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Soft-stake $STONKBROKER (burned/treasury) to activate a broker. Tier defines weight share in every round.
          </p>

          <div className="space-y-2.5">
            {Object.entries(BROKER_TIERS).map(([tierId, t]) => (
              <div
                key={tierId}
                className="bg-[#171c26] border border-[#263040] rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white text-xs">{t.name}</span>
                  <span className="text-[10px] text-gray-400 block mono">Tier {tierId}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#cfff04] mono">{t.multiplier}</span>
                  <span className="text-[10px] text-gray-500 block mono">
                    {t.multBps.toLocaleString()} bps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interns Ladder */}
        <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-[#a855f7]" />
            Stonk Interns Payroll Ladder
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Interns draw a pay share from their parent broker&#x27;s round plus their own independent Intern Clock In engine.
          </p>

          <div className="space-y-2.5">
            {Object.entries(INTERN_TIERS).map(([tierId, t]) => (
              <div
                key={tierId}
                className="bg-[#171c26] border border-[#263040] rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white text-xs">{t.name}</span>
                  <span className="text-[10px] text-gray-400 block">{t.rank}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#10b981] mono">{t.payShare}</span>
                  <span className="text-[10px] text-gray-500 block">payroll cut</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Routes & Integration Reference */}
      <div className="bg-[#13171f] border border-[#242b38] rounded-2xl p-6">
        <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-3">
          <Code2 className="w-5 h-5 text-[#38bdf8]" />
          Dashboard API Routes & Microservice Architecture
        </h3>

        <div className="space-y-3 mt-4 text-xs">
          <div className="bg-[#171c26] p-3 rounded-xl border border-[#252f40] flex items-center justify-between">
            <div className="mono text-white font-semibold">GET /api/pot</div>
            <div className="text-gray-400">Live accumulated Clock In pot, run rate, and 6 revenue sources</div>
          </div>
          <div className="bg-[#171c26] p-3 rounded-xl border border-[#252f40] flex items-center justify-between">
            <div className="mono text-white font-semibold">GET /api/rounds?limit=250</div>
            <div className="text-gray-400">All historical drop rounds, recipients, and daily aggregates</div>
          </div>
          <div className="bg-[#171c26] p-3 rounded-xl border border-[#252f40] flex items-center justify-between">
            <div className="mono text-white font-semibold">GET /api/tokens</div>
            <div className="text-gray-400">Cumulative token deliveries per Robinhood stock asset</div>
          </div>
          <div className="bg-[#171c26] p-3 rounded-xl border border-[#252f40] flex items-center justify-between">
            <div className="mono text-white font-semibold">GET /api/wallet/[address]</div>
            <div className="text-gray-400">Full wallet inspection: NFT counts, activation tiers, TBAs, and revenue projection</div>
          </div>
          <div className="bg-[#171c26] p-3 rounded-xl border border-[#252f40] flex items-center justify-between">
            <div className="mono text-white font-semibold">POST /api/sync</div>
            <div className="text-gray-400">Triggers onchain background cache refresh to Supabase</div>
          </div>
        </div>
      </div>
    </div>
  );
};
