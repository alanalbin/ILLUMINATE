import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';

export async function GET() {
  try {
    const event = await DataStore.getEventConfig();
    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error: any) {
    console.error('Fetch event config error, returning defaults:', error);
    return NextResponse.json({
      success: true,
      event: DEFAULT_EVENT_CONFIG,
    });
  }
}
