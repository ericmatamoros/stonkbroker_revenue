import { NextRequest, NextResponse } from 'next/server';
import { inspectWallet } from '@/lib/stonkService';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ ok: false, error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const refresh = request.nextUrl.searchParams.get('refresh') === 'true';
    const data = await inspectWallet(address, refresh);
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Wallet inspection failed' }, { status: 500 });
  }
}
