import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'illuminate2026';

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();

    if (!passcode || passcode !== ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Invalid administrative security credential.' },
        { status: 401 }
      );
    }

    // In a production setup with Firebase Auth, a custom token or session cookie is created.
    // Here we issue an authenticated admin session token.
    const token = `adm_${Buffer.from(ADMIN_SECRET + ':' + Date.now()).toString('base64')}`;

    const res = NextResponse.json({
      success: true,
      message: 'Admin authorization granted.',
      role: 'superadmin',
    });

    res.cookies.set('illuminate_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Admin authentication error.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  res.cookies.delete('illuminate_admin_session');
  return res;
}
