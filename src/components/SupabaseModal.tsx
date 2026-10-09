'use client';

import React, { useState, useEffect } from 'react';
import { getSupabaseConfig, saveUserSupabaseConfig } from '@/lib/supabase';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserSupabaseConfig(url, anonKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing latest rounds, pot data, and tokens to Supabase...');
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setSyncStatus(`Sync Success: ${data.stats.roundsSynced} rounds & ${data.stats.tokensTracked} tokens cached.`);
        if (onSyncComplete) onSyncComplete();
      } else {
        setSyncStatus(`Sync Notice: ${data.error || 'Check Supabase table permissions'}`);
      }
    } catch (err: any) {
      setSyncStatus(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const sqlSchema = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS clock_in_pots (
  id BIGSERIAL PRIMARY KEY,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  pending_eth NUMERIC,
  pending_usd NUMERIC,
  min_drop_eth NUMERIC,
  progress_pct NUMERIC,
  broker_engine_eth NUMERIC,
  intern_engine_eth NUMERIC,
  run_rate_24h_usd NUMERIC,
  eth_price_usd NUMERIC,
  revenue_sources JSONB
);

CREATE TABLE IF NOT EXISTS distribution_rounds (
  id VARCHAR(64) PRIMARY KEY,
  round INTEGER,
  engine VARCHAR(64),
  engine_key VARCHAR(64),
  engine_label VARCHAR(128),
  eth_in NUMERIC,
  usd_in NUMERIC,
  total_weight NUMERIC,
  recipients INTEGER,
  tx_hash VARCHAR(66),
  block_number BIGINT,
  date DATE
);

CREATE TABLE IF NOT EXISTS wallet_cache (
  wallet_address VARCHAR(42) PRIMARY KEY,
  brokers_count INTEGER,
  activated_brokers_count INTEGER,
  interns_count INTEGER,
  activated_interns_count INTEGER,
  total_active_weight NUMERIC,
  network_share_pct NUMERIC,
  data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121620] border-2 border-[#2b3548] rounded-2xl max-w-2xl w-full p-6 relative card-glow max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg bg-[#181d28] border border-[#273040]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              Supabase Database Cache Configuration
            </h3>
            <p className="text-xs text-gray-400">
              Persist computed rounds, historical pot snapshots, and wallet inspections to eliminate redundant computations
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#171c26] border border-[#2a3446] text-sm text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#cfff04]/60 mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-[#171c26] border border-[#2a3446] text-sm text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#cfff04]/60 mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#cfff04] hover:bg-[#bceb00] text-black font-bold text-xs uppercase tracking-wider transition shadow-[0_0_12px_rgba(207,255,4,0.3)]"
              >
                Save Settings
              </button>
              {isSaved && (
                <span className="text-xs text-[#10b981] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-[#1d2432] hover:bg-[#283244] text-white border border-[#313e54] text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#cfff04]' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now to Supabase'}
            </button>
          </div>
        </form>

        {syncStatus && (
          <div className="mt-4 p-3 rounded-lg bg-[#18202c] border border-[#2d394d] text-xs mono text-gray-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10b981] flex-shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Database SQL Schema Preview */}
        <div className="mt-6 pt-6 border-t border-[#242b38]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Quick SQL Setup Script
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sqlSchema);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2000);
              }}
              className="text-xs text-[#cfff04] hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {copiedSql ? 'Copied SQL!' : 'Copy SQL'}
            </button>
          </div>
          <pre className="p-3 bg-[#0c0e14] border border-[#202634] rounded-xl text-[11px] mono text-gray-400 overflow-x-auto max-h-40">
            {sqlSchema}
          </pre>
        </div>
      </div>
    </div>
  );
};
