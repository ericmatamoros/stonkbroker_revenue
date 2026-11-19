import { NextResponse } from 'next/server';
import { fetchStonkTokenStats } from '@/lib/stonkService';

export async function GET() {
  try {
    const data = await fetchStonkTokenStats();
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to fetch $STONKBROKER statistics' },
      { status: 500 }
    );
  }
}
