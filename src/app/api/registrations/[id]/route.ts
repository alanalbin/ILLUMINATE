import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id || '').trim();

    let registration = await DataStore.getRegistrationById(cleanId);
    
    if (!registration && cleanId.includes('@')) {
      registration = await DataStore.getRegistrationByEmail(cleanId);
    }

    if (!registration && cleanId === 'latest') {
      const all = await DataStore.listRegistrations();
      registration = all.find((r) => r.paymentStatus !== 'verified') || all[0] || null;
    }

    const emailQuery = req.nextUrl.searchParams.get('email');
    if (!registration && emailQuery) {
      registration = await DataStore.getRegistrationByEmail(emailQuery.trim());
    }

    const phoneQuery = req.nextUrl.searchParams.get('phone');
    if (!registration && phoneQuery) {
      const all = await DataStore.listRegistrations();
      registration = all.find((r) => r.phone === phoneQuery.replace(/\D/g, '')) || null;
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      registration,
    });
  } catch (error: any) {
    console.error('Fetch registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error retrieving registration' },
      { status: 500 }
    );
  }
}
