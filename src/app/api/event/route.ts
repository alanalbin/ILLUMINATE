import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';

export async function GET() {
  try {
    const event = await DataStore.getEventConfig();
    const metrics = await DataStore.getDashboardMetrics();
    const totalSeats = event.capacity || event.minimumTarget || 70;
    const paidSeats = metrics.paidRegistrations || 0;
    const remainingSeats = Math.max(0, totalSeats - paidSeats);

    return NextResponse.json({
      success: true,
      event,
      seats: {
        total: totalSeats,
        paid: paidSeats,
        remaining: remainingSeats,
        percentFilled: Math.min(100, Math.round((paidSeats / totalSeats) * 100)),
      },
    });
  } catch (error: any) {
    console.error('Fetch event config error, returning defaults:', error);
    return NextResponse.json({
      success: true,
      event: DEFAULT_EVENT_CONFIG,
      seats: {
        total: 70,
        paid: 0,
        remaining: 70,
        percentFilled: 0,
      },
    });
  }
}
