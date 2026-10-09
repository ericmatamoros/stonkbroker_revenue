import { NextResponse } from 'next/server';
import { fetchHistoricalDistributions, fetchLiveClockInPot, fetchTokenDeliveries } from '@/lib/stonkService';

export async function POST() {
  try {
    const [pot, roundsData, tokens] = await Promise.all([
      fetchLiveClockInPot(),
      fetchHistoricalDistributions(500),
      fetchTokenDeliveries(),
    ]);

    return NextResponse.json({
      ok: true,
      message: 'Supabase sync completed successfully',
      stats: {
        potPendingEth: pot.pendingEth,
        potPendingUsd: pot.pendingUsd,
        roundsSynced: roundsData.rounds.length,
        dailyBucketsSynced: roundsData.dailies.length,
        tokensTracked: tokens.length,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Sync failed' }, { status: 500 });
  }
}
