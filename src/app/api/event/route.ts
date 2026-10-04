import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';
import { getLiveSeatsInfo } from '@/lib/seats/live-seats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [event, seats] = await Promise.all([
      DataStore.getEventConfig(),
      getLiveSeatsInfo(),
    ]);

    return NextResponse.json(
      {
        success: true,
        event,
        seats: {
          total: seats.total,
          paid: seats.paid,
          remaining: seats.remaining,
          percentFilled: seats.percentFilled,
        },
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
    console.error('Fetch event config error, returning defaults:', error);
    return NextResponse.json(
      {
        success: true,
        event: DEFAULT_EVENT_CONFIG,
        seats: {
          total: 70,
          paid: 5,
          remaining: 65,
          percentFilled: 7,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

