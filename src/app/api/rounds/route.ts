import { NextRequest, NextResponse } from 'next/server';
import { fetchHistoricalDistributions } from '@/lib/stonkService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '250', 10);
    const data = await fetchHistoricalDistributions(limit);
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to fetch rounds' }, { status: 500 });
  }
}
