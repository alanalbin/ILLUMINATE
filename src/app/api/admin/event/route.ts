import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';

export async function POST(req: NextRequest) {
  try {
    const updates = await req.json();

    const updated = await DataStore.updateEventConfig(updates);

    await DataStore.recordAuditLog(
      'admin-coordinator',
      'coordinator@kmct.edu.in',
      'EVENT_CONFIG_UPDATED',
      'event',
      updated.id,
      { updatedFields: Object.keys(updates) }
    );

    return NextResponse.json({
      success: true,
      event: updated,
      message: 'Event settings updated successfully.',
    });
  } catch (error: any) {
    console.error('Update event config error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update event settings.' },
      { status: 500 }
    );
  }
}
