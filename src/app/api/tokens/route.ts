import { NextResponse } from 'next/server';
import { fetchTokenDeliveries } from '@/lib/stonkService';

export async function GET() {
  try {
    const data = await fetchTokenDeliveries();
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to fetch tokens' }, { status: 500 });
  }
}
