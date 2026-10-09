'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClockInPotData,
  DailyDistributionSummary,
  DistributionRound,
  TokenDeliveryTotal,
  WalletInspectionResult,
} from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { PotOverview } from '@/components/PotOverview';
import { DistributionsLedger } from '@/components/DistributionsLedger';
import { WalletInspector } from '@/components/WalletInspector';
import { DocumentationView } from '@/components/DocumentationView';
import { SupabaseModal } from '@/components/SupabaseModal';
import { getSupabaseConfig } from '@/lib/supabase';
import { inspectWallet } from '@/lib/stonkService';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('pot');
  const [potData, setPotData] = useState<ClockInPotData | null>(null);
  const [rounds, setRounds] = useState<DistributionRound[]>([]);
  const [dailies, setDailies] = useState<DailyDistributionSummary[]>([]);
  const [tokens, setTokens] = useState<TokenDeliveryTotal[]>([]);
  const [targetWallet, setTargetWallet] = useState<string>('0x6e659392a047b21e0b91bd5da1e4fda9ac8f7e12');

  const [loadingPot, setLoadingPot] = useState<boolean>(true);
  const [loadingDistributions, setLoadingDistributions] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Load Pot Data
  const loadPot = useCallback(async () => {
    try {
      const res = await fetch('/api/pot');
      const json = await res.json();
      if (json.ok && json.data) {
        setPotData(json.data);
      }
    } catch (err) {
      console.error('Failed to load pot data:', err);
    } finally {
      setLoadingPot(false);
    }
  }, []);

  // Load Rounds & Tokens
  const loadDistributions = useCallback(async () => {
    try {
      const [roundsRes, tokensRes] = await Promise.all([
        fetch('/api/rounds?limit=250').then((r) => r.json()),
        fetch('/api/tokens').then((r) => r.json()),
      ]);

      if (roundsRes.ok && roundsRes.data) {
        setRounds(roundsRes.data.rounds || []);
        setDailies(roundsRes.data.dailies || []);
      }

      if (tokensRes.ok && tokensRes.data) {
        setTokens(tokensRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load distributions:', err);
    } finally {
      setLoadingDistributions(false);
    }
  }, []);

  // Check Supabase config on mount
  useEffect(() => {
    const cfg = getSupabaseConfig();
    setIsSupabaseConnected(cfg.isConfigured);
  }, []);

  // Initial Load
  useEffect(() => {
    loadPot();
    loadDistributions();

    // Auto-refresh pot every 45s
    const interval = setInterval(() => {
      loadPot();
    }, 45000);

    return () => clearInterval(interval);
  }, [loadPot, loadDistributions]);

  // Refresh All Action
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadPot(), loadDistributions()]);
    setIsRefreshing(false);
  };

  // Inspect Wallet Callback
  const handleInspectWallet = async (
    address: string,
    forceRefresh = false
  ): Promise<WalletInspectionResult | null> => {
    try {
      const res = await fetch(`/api/wallet/${address}${forceRefresh ? '?refresh=true' : ''}`);
      const json = await res.json();
      if (json.ok && json.data) {
        return json.data;
      }
      // Direct fallback
      return await inspectWallet(address, forceRefresh);
    } catch {
      return await inspectWallet(address, forceRefresh);
    }
  };

  const ethPrice = potData?.ethPriceUsd || 2486;

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#e2e8f0] relative">
      {/* Left Sidebar (fixed on desktop, slide-over drawer on mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ethPrice={ethPrice}
        stonkPrice={0.00496}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area Offset by Sidebar on Desktop */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Navigation Top Header */}
        <Navbar
          ethPrice={ethPrice}
          stonkPrice={0.00496}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
          onQuickSearch={(addr) => setTargetWallet(addr)}
          onRefreshAll={handleRefreshAll}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
          {activeTab === 'pot' && (
            <PotOverview potData={potData} loading={loadingPot} onRefresh={loadPot} />
          )}

          {activeTab === 'distributions' && (
            <DistributionsLedger
              rounds={rounds}
              dailies={dailies}
              tokens={tokens}
              loading={loadingDistributions}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletInspector
              initialAddress={targetWallet}
              onInspectWallet={handleInspectWallet}
            />
          )}

          {activeTab === 'docs' && <DocumentationView />}
        </main>

        {/* Terminal Footer */}
        <footer className="border-t border-[#1e2430] py-4 bg-[#0a0c10] text-xs text-gray-500 mb-14 lg:mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span>Robinhood Chain Mainnet (Chain ID 4663)</span>
              <span>•</span>
              <span className="mono">~100ms blocks</span>
            </div>

            <div className="flex items-center gap-4">
              <span>StonkBrokers Protocol BUSL 1.1</span>
              <span>•</span>
              <a
                href="https://robinhoodchain.blockscout.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#38bdf8] hover:underline"
              >
                Blockscout Explorer
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Supabase Settings & Sync Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => {
          setIsSupabaseModalOpen(false);
          const cfg = getSupabaseConfig();
          setIsSupabaseConnected(cfg.isConfigured);
        }}
        onSyncComplete={() => {
          loadPot();
          loadDistributions();
        }}
      />
    </div>
  );
}
