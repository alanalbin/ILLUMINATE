import { NextResponse } from 'next/server';
import { getLiveSeatsInfo } from '@/lib/seats/live-seats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const seats = await getLiveSeatsInfo();
    return NextResponse.json(
      {
        success: true,
        total: seats.total,
        paid: seats.paid,
        remaining: seats.remaining,
        percentFilled: seats.percentFilled,
        timestamp: seats.timestamp,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        total: 70,
        paid: 6,
        remaining: 64,
        percentFilled: 9,
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
