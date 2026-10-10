'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, RefreshCw, Menu, Database, ExternalLink, Sparkles } from 'lucide-react';

interface NavbarProps {
  ethPrice: number;
  stonkPrice?: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSupabase: () => void;
  isSupabaseConnected: boolean;
  onQuickSearch: (address: string) => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  ethPrice,
  stonkPrice = 0.00496,
  activeTab,
  setActiveTab,
  onOpenSupabase,
  isSupabaseConnected,
  onQuickSearch,
  onRefreshAll,
  isRefreshing,
  onToggleMobileMenu,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onQuickSearch(searchInput.trim());
      setActiveTab('wallet');
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#1e2432] bg-[#0c0e14]/90 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Mobile Brand & Hamburger Button */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-xl text-gray-300 hover:text-white bg-[#141923] border border-[#1e2432] transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#f59e0b]/50 bg-[#f97316] flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="StonkStatistics Logo"
                  fill
                  sizes="32px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <span className="font-extrabold text-white text-base font-mono tracking-tight leading-none block">
                  StonkStatistics
                </span>
                <span className="text-[10px] text-[#cfff04] font-medium leading-none">
                  Robinhood Chain
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Inspect wallet (0x6e659392a047b21e0b91bd5da1e4fda9ac8f7e12...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#12161f] border border-[#1e2432] text-xs text-white placeholder-gray-500 rounded-xl pl-10 pr-24 py-2.5 focus:outline-none focus:border-[#cfff04]/50 focus:ring-1 focus:ring-[#cfff04]/30 font-mono transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1c2331] hover:bg-[#283246] text-gray-200 text-xs font-semibold px-3 py-1 rounded-lg border border-[#2e394f] transition"
              >
                Inspect
              </button>
            </form>
          </div>

          {/* Desktop Right Quick Badges & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Ticker Pills on Desktop */}
            <div className="hidden xl:flex items-center gap-2 text-xs">
              <div className="px-2.5 py-1.5 rounded-lg bg-[#12161f] border border-[#1e2432] flex items-center gap-1.5 font-mono">
                <span className="text-gray-400">$STONKBROKER:</span>
                <span className="text-[#cfff04] font-semibold">${stonkPrice.toFixed(5)}</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-[#12161f] border border-[#1e2432] flex items-center gap-1.5 font-mono">
                <span className="text-gray-400">ETH:</span>
                <span className="text-white font-semibold">${Math.round(ethPrice).toLocaleString('en-US')}</span>
              </div>
            </div>

            {/* Refresh All */}
            <button
              onClick={onRefreshAll}
              disabled={isRefreshing}
              title="Refresh all statistics"
              className="p-2 sm:px-3 sm:py-2 text-xs text-gray-300 hover:text-white bg-[#12161f] border border-[#1e2432] hover:border-gray-500 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#cfff04]' : ''}`} />
              <span className="hidden sm:inline font-medium">Sync</span>
            </button>

            {/* Supabase status toggle on desktop */}
            <button
              onClick={onOpenSupabase}
              className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-medium transition ${
                isSupabaseConnected
                  ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/20'
                  : 'bg-[#12161f] text-gray-300 border-[#1e2432] hover:border-gray-500'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConnected ? 'Cached' : 'Supabase'}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConnected ? 'bg-[#10b981]' : 'bg-gray-500'
                }`}
              />
            </button>

            {/* Main Suite Link */}
            <a
              href="https://www.stonkbrokers.cash"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 text-xs text-[#cfff04] bg-[#cfff04]/10 hover:bg-[#cfff04]/20 border border-[#cfff04]/30 px-3 py-2 rounded-xl font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#cfff04]" />
              <span>Main Suite</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Mobile Search Bar Row (expandable below header on small screens) */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Inspect Robinhood Chain wallet (0x...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#12161f] border border-[#1e2432] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-20 py-2 focus:outline-none focus:border-[#cfff04]/50 font-mono"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#1c2331] text-gray-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#2e394f]"
            >
              Inspect
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};
