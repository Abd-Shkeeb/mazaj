// src/app/api/kiosk/[cafeSlug]/session/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ cafeSlug: string }> }) {
  try {
    const { cafeSlug } = await params;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const fingerprint = request.headers.get('x-device-fingerprint') ?? undefined;

    if (!sessionId) {
      console.warn(`[Kiosk Session Validate API] Missing sessionId param for cafeSlug: ${cafeSlug}`);
      return NextResponse.json({ success: false, code: 'SESSION_MISSING', valid: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await db.kioskSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      console.warn(`[Kiosk Session Validate API] Session not found: ${sessionId}`);
      return NextResponse.json({ success: false, code: 'SESSION_INVALID', valid: false, error: 'Invalid session' }, { status: 200 });
    }

    // Verify cafe matches slug
    const cafe = await db.cafe.findUnique({ where: { slug: cafeSlug } });
    if (!cafe || session.cafeId !== cafe.id) {
      console.warn(`[Kiosk Session Validate API] Cafe mismatch or cafe slug not found. Session Cafe: ${session.cafeId}, cafeSlug: ${cafeSlug}`);
      return NextResponse.json({ success: false, code: 'SESSION_MISMATCH', valid: false, error: 'Session cafe mismatch' }, { status: 200 });
    }

    if ((session as any).status === 'USED') {
      console.warn(`[Kiosk Session Validate API] Session already used: ${sessionId}`);
      return NextResponse.json({ success: false, code: 'SESSION_USED', valid: false, error: 'Session already used' }, { status: 200 });
    }

    if (session.expiresAt < new Date()) {
      console.warn(`[Kiosk Session Validate API] Session expired: ${sessionId}`);
      return NextResponse.json({ success: false, code: 'SESSION_EXPIRED', valid: false, error: 'Session expired' }, { status: 200 });
    }

    if (session.deviceFingerprint && session.deviceFingerprint !== fingerprint) {
      console.warn(`[Kiosk Session Validate API] Fingerprint mismatch. Expected: ${session.deviceFingerprint}, Got: ${fingerprint}`);
      return NextResponse.json({ success: false, code: 'SESSION_MISMATCH', valid: false, error: 'Device fingerprint mismatch' }, { status: 200 });
    }

    return NextResponse.json({ success: true, valid: true, expiresAt: session.expiresAt });
  } catch (error: any) {
    const digest = `digest-${Math.random().toString(36).substr(2, 9)}`
    console.error(`[Kiosk Session Validate API] [Digest: ${digest}] CRITICAL ERROR:`, error.message || error)
    if (error.stack) {
      console.error(`[Kiosk Session Validate API] [Digest: ${digest}] STACK TRACE:`, error.stack)
    }
    return NextResponse.json({
      success: false,
      code: 'API_ERROR',
      error: error.message || 'Internal Server Error',
      digest,
    }, { status: 500 });
  }
}
