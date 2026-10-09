import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ClockInPotData,
  DailyDistributionSummary,
  DistributionRound,
  TokenDeliveryTotal,
  WalletInspectionResult,
} from '@/types';

// Storage keys for local fallback caching
const LOCAL_STORAGE_KEY_SUPABASE = 'sb_user_supabase_config';
const LOCAL_STORAGE_KEY_WALLETS = 'sb_wallet_cache_local';
const LOCAL_STORAGE_KEY_ROUNDS = 'sb_rounds_cache_local';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let currentKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SUPABASE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return { url: parsed.url, anonKey: parsed.anonKey, isConfigured: true };
        }
      }
    } catch {
      // ignore
    }
  }

  const isConfigured = Boolean(currentUrl && currentKey && currentUrl.startsWith('http'));
  return { url: currentUrl, anonKey: currentKey, isConfigured };
}

export function saveUserSupabaseConfig(url: string, anonKey: string) {
  currentUrl = url.trim();
  currentKey = anonKey.trim();
  cachedClient = null; // reset client

  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_SUPABASE,
        JSON.stringify({ url: currentUrl, anonKey: currentKey })
      );
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_SUPABASE);
    }
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (cachedClient && currentUrl === url && currentKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// -------------------------------------------------------------
// CACHING FUNCTIONS (Supabase with LocalStorage fallback)
// -------------------------------------------------------------

/**
 * Cache distribution rounds to Supabase / Local storage
 */
export async function cacheDistributionRounds(rounds: DistributionRound[]): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const rows = rounds.map((r) => ({
        id: `${r.engineKey}-${r.round}`,
        round: r.round,
        engine: r.engine,
        engine_key: r.engineKey,
        engine_label: r.engineLabel,
        eth_in: r.ethInFormatted,
        usd_in: r.usdIn,
        total_weight: r.totalWeight,
        recipients: r.recipients,
        tx_hash: r.txHash,
        block_number: r.block,
        date: r.date,
      }));

      // Upsert in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        await client.from('distribution_rounds').upsert(batch, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('Supabase cache error (rounds):', e);
    }
  }

  // Also maintain local fallback storage
  if (typeof window !== 'undefined') {
    try {
      const topRounds = rounds.slice(0, 300);
      localStorage.setItem(LOCAL_STORAGE_KEY_ROUNDS, JSON.stringify(topRounds));
    } catch {
      // ignore quota errors
    }
  }
}

/**
 * Fetch cached distribution rounds from Supabase
 */
export async function getCachedDistributionRounds(): Promise<DistributionRound[] | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('distribution_rounds')
        .select('*')
        .order('round', { ascending: false })
        .limit(500);

      if (!error && data && data.length > 0) {
        return data.map((r) => ({
          round: r.round,
          engine: r.engine,
          engineKey: r.engine_key,
          engineLabel: r.engine_label,
          ethIn: String(r.eth_in),
          ethInFormatted: Number(r.eth_in),
          usdIn: Number(r.usd_in),
          totalWeight: Number(r.total_weight),
          recipients: Number(r.recipients),
          txHash: r.tx_hash,
          block: Number(r.block_number),
          date: r.date,
          timestamp: new Date(r.date).getTime(),
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch error (rounds):', e);
    }
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ROUNDS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Cache daily aggregates to Supabase
 */
export async function cacheDailyDistributions(dailies: DailyDistributionSummary[]): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const rows = dailies.map((d) => ({
      date: d.date,
      total_eth: d.totalEth,
      total_usd: d.totalUsd,
      broker_eth: d.brokerEth,
      intern_eth: d.internEth,
      rounds_count: d.roundsCount,
      recipients_count: d.recipientsCount,
      updated_at: new Date().toISOString(),
    }));

    await client.from('daily_distributions').upsert(rows, { onConflict: 'date' });
  } catch (e) {
    console.warn('Supabase cache error (daily):', e);
  }
}

/**
 * Cache token cumulative delivery totals
 */
export async function cacheTokenDeliveries(tokens: TokenDeliveryTotal[]): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const rows = tokens.map((t) => ({
      symbol: t.symbol,
      stock_address: t.stockAddress,
      decimals: t.decimals,
      total_units: t.totalFormatted,
      usd_price: t.usdPrice,
      total_usd: t.totalUsd,
      drops_count: t.dropsCount,
      updated_at: new Date().toISOString(),
    }));

    await client.from('token_deliveries').upsert(rows, { onConflict: 'symbol' });
  } catch (e) {
    console.warn('Supabase cache error (tokens):', e);
  }
}

/**
 * Save snapshot of live Clock In Pot
 */
export async function recordPotSnapshot(pot: ClockInPotData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('clock_in_pots').insert({
      pending_eth: pot.pendingEth,
      pending_usd: pot.pendingUsd,
      min_drop_eth: pot.minDropEth,
      progress_pct: pot.progressPct,
      broker_engine_eth: pot.brokerEngineEth,
      intern_engine_eth: pot.internEngineEth,
      run_rate_24h_usd: pot.runRate24hUsd,
      eth_price_usd: pot.ethPriceUsd,
      revenue_sources: pot.revenueSources,
    });
  } catch (e) {
    console.warn('Supabase cache error (pot snapshot):', e);
  }
}

/**
 * Cache wallet inspection result
 */
export async function cacheWalletInspection(result: WalletInspectionResult): Promise<void> {
  const client = getSupabaseClient();
  const address = result.walletAddress.toLowerCase();

  if (client) {
    try {
      await client.from('wallet_cache').upsert(
        {
          wallet_address: address,
          brokers_count: result.brokersCount,
          activated_brokers_count: result.activatedBrokersCount,
          interns_count: result.internsCount,
          activated_interns_count: result.activatedInternsCount,
          total_active_weight: result.totalActiveWeight,
          network_share_pct: result.sharePercentage,
          data: result,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wallet_address' }
      );
    } catch (e) {
      console.warn('Supabase cache error (wallet):', e);
    }
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_WALLETS);
      const map: Record<string, WalletInspectionResult> = stored ? JSON.parse(stored) : {};
      map[address] = { ...result, cachedAt: new Date().toISOString(), fromCache: true };
      localStorage.setItem(LOCAL_STORAGE_KEY_WALLETS, JSON.stringify(map));
    } catch {
      // ignore
    }
  }
}

/**
 * Retrieve cached wallet inspection result
 */
export async function getCachedWalletInspection(
  walletAddress: string,
  maxAgeMs = 10 * 60 * 1000 // 10 minutes cache validity
): Promise<WalletInspectionResult | null> {
  const address = walletAddress.toLowerCase();
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('wallet_cache')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (!error && data && data.data) {
        const age = Date.now() - new Date(data.updated_at).getTime();
        if (age < maxAgeMs) {
          const res = data.data as WalletInspectionResult;
          res.fromCache = true;
          res.cachedAt = data.updated_at;
          return res;
        }
      }
    } catch {
      // proceed to local fallback
    }
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_WALLETS);
      if (stored) {
        const map: Record<string, WalletInspectionResult> = JSON.parse(stored);
        const item = map[address];
        if (item && item.cachedAt) {
          const age = Date.now() - new Date(item.cachedAt).getTime();
          if (age < maxAgeMs) {
            return { ...item, fromCache: true };
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}
