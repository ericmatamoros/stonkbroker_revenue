'use client';

import React from 'react';
import Image from 'next/image';
import {
  Zap,
  UserCheck,
  Activity,
  BookOpen,
  Database,
  ExternalLink,
  RefreshCw,
  X,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ethPrice: number;
  stonkPrice?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isSupabaseConnected: boolean;
  onOpenSupabase: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  ethPrice,
  stonkPrice = 0.00496,
  isOpenMobile,
  onCloseMobile,
  isSupabaseConnected,
  onOpenSupabase,
  onRefreshAll,
  isRefreshing,
}) => {
  const navItems = [
    {
      id: 'pot',
      label: 'Clock In Pot',
      subtitle: 'Real-time Accumulated Pool',
      icon: Zap,
      badge: 'LIVE',
    },
    {
      id: 'wallet',
      label: 'Wallet Inspector',
      subtitle: 'Interns, Shares & Projections',
      icon: UserCheck,
      badge: 'PRO',
    },
    {
      id: 'distributions',
      label: 'Distributions Ledger',
      subtitle: 'Daily Delivery History',
      icon: Activity,
    },
    {
      id: 'docs',
      label: 'Contracts & Specs',
      subtitle: 'Robinhood Chain Architecture',
      icon: BookOpen,
    },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0c0e14] border-r border-[#1e2432] text-[#e2e8f0]">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#1e2432]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-[#f59e0b]/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex-shrink-0 bg-[#f97316]">
              <Image
                src="/logo.png"
                alt="StonkStatistics Logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-tight text-lg leading-tight font-mono">
                  StonkStatistics
                </span>
              </div>
              <span className="text-[11px] text-[#cfff04] font-medium tracking-tight leading-snug">
                Your statistics for the Stonkbroker ecosystem
              </span>
            </div>
          </div>

          {/* Close mobile button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#181d26] transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Network Pill */}
        <div className="mt-3.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#12161f] border border-[#1e2432] text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span className="font-medium">Robinhood Chain</span>
            <span className="text-gray-500 font-mono">#4663</span>
          </div>
          <span className="text-[#10b981] font-mono text-[10px] font-semibold uppercase tracking-wider">
            ~100ms
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Terminal Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full text-left rounded-xl px-3 py-2.5 transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-[#cfff04] text-black font-semibold shadow-[0_0_15px_rgba(207,255,4,0.25)]'
                  : 'text-gray-300 hover:bg-[#141923] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg transition ${
                    isActive
                      ? 'bg-black text-[#cfff04]'
                      : 'bg-[#181e2b] text-gray-400 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div
                    className={`text-sm tracking-tight leading-snug font-medium ${
                      isActive ? 'text-black font-bold' : 'text-gray-200'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-[10px] line-clamp-1 ${
                      isActive ? 'text-black/80 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider ${
                    isActive
                      ? 'bg-black text-[#cfff04]'
                      : 'bg-[#1e2432] text-[#cfff04] border border-[#cfff04]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Live Ecosystem Tickers Card */}
        <div className="mt-6 pt-4 border-t border-[#1e2432]/70 px-1">
          <div className="px-2 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
            <span>Market Tickers</span>
            <TrendingUp className="w-3 h-3 text-[#cfff04]" />
          </div>

          <div className="space-y-2">
            {/* $STONKBROKER Price */}
            <div className="bg-[#12161f] border border-[#1e2432] rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#cfff04]/10 border border-[#cfff04]/30 flex items-center justify-center text-[10px] font-bold text-[#cfff04]">
                  $S
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight">STONKBROKER</div>
                  <div className="text-[9px] text-gray-400">Official Token</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-[#cfff04] leading-tight">
                  ${stonkPrice.toFixed(5)}
                </div>
                <div className="text-[9px] text-[#10b981] font-mono">0.0000020 ETH</div>
              </div>
            </div>

            {/* $ETH Price */}
            <div className="bg-[#12161f] border border-[#1e2432] rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[10px] font-bold text-[#38bdf8]">
                  Ξ
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight">Ethereum</div>
                  <div className="text-[9px] text-gray-400">Robinhood L2 Gas</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white leading-tight">
                  ${ethPrice.toLocaleString()}
                </div>
                <div className="text-[9px] text-gray-400 font-mono">Chain Native</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls & External Links */}
      <div className="p-3.5 border-t border-[#1e2432] bg-[#090b0f] space-y-2">
        {/* Supabase Status Toggle */}
        <button
          onClick={onOpenSupabase}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition ${
            isSupabaseConnected
              ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/20'
              : 'bg-[#12161f] text-gray-300 border-[#1e2432] hover:border-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseConnected ? 'Supabase Synced' : 'Connect Supabase'}</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConnected ? 'bg-[#10b981] animate-pulse' : 'bg-gray-500'
            }`}
          />
        </button>

        {/* Global Refresh */}
        <button
          onClick={onRefreshAll}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-[#12161f] hover:bg-[#181d26] border border-[#1e2432] hover:border-gray-500 text-gray-200 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#cfff04]' : ''}`} />
          <span>{isRefreshing ? 'Refreshing Data...' : 'Sync All Metrics'}</span>
        </button>

        {/* External Links */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <a
            href="https://www.stonkbrokers.cash"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[10px] text-gray-400 hover:text-white bg-[#12161f] border border-[#1e2432] hover:border-gray-600 transition"
          >
            <span>StonkBrokers</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a
            href="https://robinhoodchain.blockscout.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[10px] text-[#38bdf8] hover:text-[#7dd3fc] bg-[#12161f] border border-[#1e2432] hover:border-gray-600 transition"
          >
            <span>Blockscout</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-Over */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
