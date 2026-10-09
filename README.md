# StonkBrokers Revenue & Clock In Dashboard

A Web3 financial terminal and revenue analytics dashboard for **StonkBrokers** on **Robinhood Chain mainnet (chain ID 4663)**.

Tracks the live accumulating **Clock In pot**, computes daily token distributions to activated **StonkBrokers** and **Stonk Interns**, inspects any given wallet with ERC-6551 Token-Bound Account (TBA) vault balances, models dynamic revenue projections, and caches computed metrics into a **Supabase** database.

---

## ⚡ Key Features

1. **Live Clock In Pot Command Center**:
   - Real-time uncranked ETH balance in the contracts (`Broker Clock In 3.0` & `Intern Clock In 3.0`).
   - Crank readiness gauge against the minimum drop threshold (`minDropWei`).
   - Breakdown of the 6 core incoming protocol revenue streams:
     - **Stonklauncher**: 16.5% of every token launch tax.
     - **Anvil NFT AMM**: 50% of the flat ~$2 ETH swap fee.
     - **Smart LP Volatility Farming**: 50% of the 10% performance fee across 170+ vaults.
     - **Safety Deposit Box**: Protocol fee flushes & vesting fees.
     - **Secondary Royalties**: 6.66% on StonkBrokers and 9.99% on Stonk Interns.
     - **Interns Desks & Mints**: 25% of the 9.99% fill fee and $20 mint releases.
   - 24h, 7-day, 30-day, and annualized revenue velocity.

2. **Daily Distributions & Historical Ledger**:
   - Interactive historical chart showing daily distributed volume in ETH and USD.
   - Cumulative delivery totals across all official Robinhood tokenized stocks (`AAPL`, `AMZN`, `NVDA`, `GOOGL`, `GME`, `TSLA`, `PLTR`, `AMD`, `USDG`, `$STONKBROKER`).
   - Searchable, filterable table of all onchain community-cranked rounds with direct links to the Robinhood Chain Blockscout explorer.

3. **Wallet Inspector & Dynamic Revenue Projections**:
   - Enter any Robinhood Chain wallet address.
   - Instantly retrieves:
     - StonkBrokers owned and activation status (`Floor Trader`, `Analyst`, `Portfolio Manager`, `Managing Director`, `Partner`).
     - Multiplier weights (1.00x to 3.33x).
     - Stonk Interns owned, parent broker IDs, onchain job titles, and pay shares (0.25% to 2.50%).
     - ERC-6551 Token-Bound Account (TBA) addresses and holdings inside each NFT vault.
   - **Dynamic Revenue Projection Calculator**:
     - Calculates the wallet's share percentage of the network pot.
     - Projects Daily, Weekly, Monthly, and Annual earnings in ETH and USD.
     - Interactive What-If Volume Surge slider (1x, 2x, 5x, 10x).
     - Per-token delivery breakdown based on electable assets.

4. **Supabase Caching Layer**:
   - Stores rounds, daily aggregates, and wallet queries in Supabase.
   - Prevents redundant onchain RPC queries.
   - Built-in graceful degradation: works with local cache out-of-the-box, with an in-UI setup modal to connect a Supabase project at any time.

---

## 🛠️ Robinhood Chain Contract Deployments

| Contract | Address | Explorer |
| :--- | :--- | :--- |
| **Broker Clock In 3.0** | `0xf4129019d8838f2555bdc8ecb3024a02145dbc58` | [Blockscout](https://robinhoodchain.blockscout.com/address/0xf4129019d8838f2555bdc8ecb3024a02145dbc58) |
| **Intern Clock In 3.0** | `0xf90a384936af8e6fd1c6c0f9ca804da5395bc059` | [Blockscout](https://robinhoodchain.blockscout.com/address/0xf90a384936af8e6fd1c6c0f9ca804da5395bc059) |
| **Broker Activation Manager** | `0xacd5ae3c060c1137fe2ee86b0ab2ef697456f664` | [Blockscout](https://robinhoodchain.blockscout.com/address/0xacd5ae3c060c1137fe2ee86b0ab2ef697456f664) |
| **Intern Activation Manager** | `0x668ea9e44e0ceb5b203067873e0b9bcdf2214b37` | [Blockscout](https://robinhoodchain.blockscout.com/address/0x668ea9e44e0ceb5b203067873e0b9bcdf2214b37) |
| **StonkBrokers NFT (4,444)** | `0x539cdd042c2f3d93ebc5be7dfff0c79f3b4fabf0` | [Blockscout](https://robinhoodchain.blockscout.com/address/0x539cdd042c2f3d93ebc5be7dfff0c79f3b4fabf0) |
| **Stonk Interns NFT (8,888)** | `0xfc4b0c4f464dc3037cf013934648a8a726d565a5` | [Blockscout](https://robinhoodchain.blockscout.com/address/0xfc4b0c4f464dc3037cf013934648a8a726d565a5) |
| **$STONKBROKER ERC-20** | `0xe934e36a439c94017b64a3fece66af12099abf50` | [Blockscout](https://robinhoodchain.blockscout.com/address/0xe934e36a439c94017b64a3fece66af12099abf50) |
| **Safety Deposit Clock In** | `0x55642a3f10f1af5145d3d59021b1d6b03bb8692c` | [Blockscout](https://robinhoodchain.blockscout.com/address/0x55642a3f10f1af5145d3d59021b1d6b03bb8692c) |
| **Canonical WETH** | `0x0bd7d308f8e1639fab988df18a8011f41eacad73` | [Blockscout](https://robinhoodchain.blockscout.com/address/0x0bd7d308f8e1639fab988df18a8011f41eacad73) |

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
# or build & start production server
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) (or custom port) with your browser.

### 3. Supabase Setup (Optional)

1. Open your Supabase project dashboard.
2. Go to the **SQL Editor** and execute the script in [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy your **Project URL** and **Anon Key**.
4. In the dashboard UI, click **"Supabase Setup"** in the top navigation bar, paste your credentials, and click **Save Settings** & **Sync Now to Supabase**.
   Alternatively, add them to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📡 Microservice API Endpoints

- `GET /api/pot` — Returns live Clock In pot balances, crank threshold progress, 24h run rates, and revenue source breakdown.
- `GET /api/rounds?limit=250` — Returns community cranked drop rounds, block numbers, recipient counts, and daily delivery aggregates.
- `GET /api/tokens` — Returns cumulative stock tokens delivered, live USD valuations, and drop counts.
- `GET /api/wallet/[address]` — Queries holdings, activation tiers, ERC-6551 TBA balances, and revenue projections for a wallet. Supports `?refresh=true` to force an onchain re-index.
- `POST /api/sync` — Triggers a cache refresh to Supabase.
