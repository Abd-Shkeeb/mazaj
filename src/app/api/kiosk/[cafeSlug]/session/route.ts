import { isRateLimitedKey } from '@/lib/rateLimiter';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addMinutes } from 'date-fns';

export async function POST(request: NextRequest, { params }: { params: Promise<{ cafeSlug: string }> }) {
  const { cafeSlug } = await params;

  const fingerprint = request.headers.get('x-device-fingerprint') ?? undefined;
  // Fetch cafe to get session duration
  const cafe = await db.cafe.findUnique({ where: { slug: cafeSlug } });
  if (!cafe) {
    return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
  }

  // Check for active existing session (skip if newSession query/header is present to force a fresh session)
  const isForceNew = request.nextUrl.searchParams.get('newSession') === 'true' || request.headers.get('x-new-session') === 'true';
  const sessionId = request.cookies.get('kiosk-session-id')?.value;
  if (sessionId && !isForceNew) {
    const existingSession = await db.kioskSession.findUnique({
      where: { id: sessionId },
    });
    if (
      existingSession &&
      existingSession.expiresAt > new Date() &&
      (existingSession as any).status === 'ACTIVE' &&
      existingSession.cafeId === cafe.id &&
      (!existingSession.deviceFingerprint || existingSession.deviceFingerprint === fingerprint)
    ) {
      return NextResponse.json({ sessionId: existingSession.id, expiresAt: existingSession.expiresAt });
    }
  }

  // Rate limiting per cafe (max 5 creations per minute)
  if (isRateLimitedKey(cafe.id, 5)) {
    return NextResponse.json({ error: 'Too many session creations' }, { status: 429 });
  }
  // Enforce 15 minutes session duration as default
  const sessionMinutes = cafe.kioskSessionMinutes ?? 15;
  const expiresAt = addMinutes(new Date(), sessionMinutes);
  const session = await db.kioskSession.create({
    data: {
      cafeId: cafe.id,
      deviceFingerprint: fingerprint,
      expiresAt,
    },
    select: { id: true, expiresAt: true },
  });
  return NextResponse.json({ sessionId: session.id, expiresAt: session.expiresAt });
}
