// src/app/api/kiosk/[cafeSlug]/session/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ cafeSlug: string }> }) {
  const { cafeSlug } = await params;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const fingerprint = request.headers.get('x-device-fingerprint') ?? undefined;

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const session = await db.kioskSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    return NextResponse.json({ valid: false, error: 'Invalid session' }, { status: 401 });
  }

  // Verify cafe matches slug
  const cafe = await db.cafe.findUnique({ where: { slug: cafeSlug } });
  if (!cafe || session.cafeId !== cafe.id) {
    return NextResponse.json({ valid: false, error: 'Session cafe mismatch' }, { status: 401 });
  }

  if (session.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: 'Session expired' }, { status: 401 });
  }

  if (session.deviceFingerprint && session.deviceFingerprint !== fingerprint) {
    return NextResponse.json({ valid: false, error: 'Device fingerprint mismatch' }, { status: 401 });
  }

  return NextResponse.json({ valid: true, expiresAt: session.expiresAt });
}
