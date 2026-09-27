import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';

export async function GET(req: NextRequest) {
  try {
    const metrics = await DataStore.getDashboardMetrics();
    const event = await DataStore.getEventConfig();

    return NextResponse.json({
      success: true,
      metrics,
      event,
    });
  } catch (error: any) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}
