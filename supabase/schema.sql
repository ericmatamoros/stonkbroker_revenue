-- StonkBrokers Revenue & Clock In Dashboard Cache Schema
-- Run this in your Supabase SQL Editor to initialize caching tables

-- 1. Clock In Pot historical snapshots
CREATE TABLE IF NOT EXISTS clock_in_pots (
  id BIGSERIAL PRIMARY KEY,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pending_eth NUMERIC(28, 18) NOT NULL,
  pending_usd NUMERIC(16, 2) NOT NULL,
  min_drop_eth NUMERIC(28, 18) NOT NULL,
  progress_pct NUMERIC(6, 2) NOT NULL,
  broker_engine_eth NUMERIC(28, 18) NOT NULL,
  intern_engine_eth NUMERIC(28, 18) NOT NULL,
  run_rate_24h_usd NUMERIC(16, 2) NOT NULL,
  eth_price_usd NUMERIC(16, 2) NOT NULL,
  revenue_sources JSONB
);

CREATE INDEX IF NOT EXISTS idx_clock_in_pots_recorded_at ON clock_in_pots(recorded_at DESC);

-- 2. Distribution Rounds (Drops)
CREATE TABLE IF NOT EXISTS distribution_rounds (
  id VARCHAR(64) PRIMARY KEY, -- e.g. "directed-f41290-77"
  round INTEGER NOT NULL,
  engine VARCHAR(64) NOT NULL,
  engine_key VARCHAR(64) NOT NULL,
  engine_label VARCHAR(128) NOT NULL,
  eth_in NUMERIC(28, 18) NOT NULL,
  usd_in NUMERIC(16, 2) NOT NULL,
  total_weight NUMERIC(20, 0) NOT NULL,
  recipients INTEGER NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dist_rounds_date ON distribution_rounds(date DESC);
CREATE INDEX IF NOT EXISTS idx_dist_rounds_engine ON distribution_rounds(engine_key);

-- 3. Daily Distributions Aggregates (pre-computed cache)
CREATE TABLE IF NOT EXISTS daily_distributions (
  date DATE PRIMARY KEY,
  total_eth NUMERIC(28, 18) NOT NULL,
  total_usd NUMERIC(16, 2) NOT NULL,
  broker_eth NUMERIC(28, 18) NOT NULL,
  intern_eth NUMERIC(28, 18) NOT NULL,
  rounds_count INTEGER NOT NULL,
  recipients_count INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Cumulative Token Deliveries
CREATE TABLE IF NOT EXISTS token_deliveries (
  symbol VARCHAR(32) PRIMARY KEY,
  stock_address VARCHAR(42),
  decimals INTEGER NOT NULL DEFAULT 18,
  total_units NUMERIC(36, 18) NOT NULL,
  usd_price NUMERIC(16, 4) NOT NULL,
  total_usd NUMERIC(16, 2) NOT NULL,
  drops_count INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Wallet Portfolio & Projection Cache
CREATE TABLE IF NOT EXISTS wallet_cache (
  wallet_address VARCHAR(42) PRIMARY KEY,
  brokers_count INTEGER NOT NULL,
  activated_brokers_count INTEGER NOT NULL,
  interns_count INTEGER NOT NULL,
  activated_interns_count INTEGER NOT NULL,
  total_active_weight NUMERIC(20, 0) NOT NULL,
  network_share_pct NUMERIC(10, 6) NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_cache_updated ON wallet_cache(updated_at DESC);

-- Enable RLS (Row Level Security) with public read access
ALTER TABLE clock_in_pots ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read clock_in_pots" ON clock_in_pots FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert clock_in_pots" ON clock_in_pots FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read distribution_rounds" ON distribution_rounds FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert distribution_rounds" ON distribution_rounds FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read daily_distributions" ON daily_distributions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous upsert daily_distributions" ON daily_distributions FOR ALL USING (true);

CREATE POLICY "Allow anonymous read token_deliveries" ON token_deliveries FOR SELECT USING (true);
CREATE POLICY "Allow anonymous upsert token_deliveries" ON token_deliveries FOR ALL USING (true);

CREATE POLICY "Allow anonymous read wallet_cache" ON wallet_cache FOR SELECT USING (true);
CREATE POLICY "Allow anonymous upsert wallet_cache" ON wallet_cache FOR ALL USING (true);
