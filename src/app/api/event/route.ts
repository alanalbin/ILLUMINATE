import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';

export async function GET() {
  try {
    const event = await DataStore.getEventConfig();
    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error: any) {
    console.error('Fetch event config error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error retrieving event details' },
      { status: 500 }
    );
  }
}
