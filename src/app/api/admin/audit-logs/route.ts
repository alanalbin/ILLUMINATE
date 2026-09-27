import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';

export async function GET() {
  try {
    const logs = await DataStore.getAuditLogs(60);
    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error('Audit logs API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve audit logs' },
      { status: 500 }
    );
  }
}
