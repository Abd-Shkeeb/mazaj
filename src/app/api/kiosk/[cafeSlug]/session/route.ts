import { isRateLimitedKey } from '@/lib/rateLimiter';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addMinutes } from 'date-fns';

export async function POST(request: NextRequest, { params }: { params: Promise<{ cafeSlug: string }> }) {
  const { cafeSlug } = await params;
  console.log(`[POST /api/kiosk/${cafeSlug}/session] Incoming session request received.`);

  const fingerprint = request.headers.get('x-device-fingerprint') ?? undefined;
  console.log(`[POST /api/kiosk/${cafeSlug}/session] Device fingerprint:`, fingerprint);

  // Fetch cafe to get session duration
  const cafe = await db.cafe.findUnique({ where: { slug: cafeSlug } });
  if (!cafe) {
    console.error(`[POST /api/kiosk/${cafeSlug}/session] Cafe not found for slug: ${cafeSlug}`);
    return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
  }
  console.log(`[POST /api/kiosk/${cafeSlug}/session] Cafe matched. ID: ${cafe.id}`);

  // Check for active existing session (skip if newSession query/header is present to force a fresh session)
  const isForceNew = request.nextUrl.searchParams.get('newSession') === 'true' || request.headers.get('x-new-session') === 'true';
  const sessionId = request.cookies.get('kiosk-session-id')?.value;
  console.log(`[POST /api/kiosk/${cafeSlug}/session] checkExisting: sessionId=${sessionId}, isForceNew=${isForceNew}`);

  if (sessionId && !isForceNew) {
    const existingSession = await db.kioskSession.findUnique({
      where: { id: sessionId },
    });
    console.log(`[POST /api/kiosk/${cafeSlug}/session] DB Query Result for existing session:`, existingSession ? `status=${existingSession.status}, expiresAt=${existingSession.expiresAt}` : 'NULL');
    if (
      existingSession &&
      existingSession.expiresAt > new Date() &&
      (existingSession as any).status === 'ACTIVE' &&
      existingSession.cafeId === cafe.id &&
      (!existingSession.deviceFingerprint || existingSession.deviceFingerprint === fingerprint)
    ) {
      console.log(`[POST /api/kiosk/${cafeSlug}/session] Active session is valid. Reusing sessionId: ${existingSession.id}`);
      return NextResponse.json({ sessionId: existingSession.id, expiresAt: existingSession.expiresAt });
    } else {
      console.log(`[POST /api/kiosk/${cafeSlug}/session] Active session is invalid, expired, used or mismatch.`);
    }
  }

  // Rate limiting per cafe (max 5 creations per minute)
  if (isRateLimitedKey(cafe.id, 5)) {
    console.warn(`[POST /api/kiosk/${cafeSlug}/session] Rate limit triggered for cafe: ${cafe.id}`);
    return NextResponse.json({ error: 'Too many session creations' }, { status: 429 });
  }

  // Enforce 15 minutes session duration as default
  const sessionMinutes = cafe.kioskSessionMinutes ?? 15;
  const expiresAt = addMinutes(new Date(), sessionMinutes);
  console.log(`[POST /api/kiosk/${cafeSlug}/session] Creating new session in DB. durationMinutes: ${sessionMinutes}`);

  const session = await db.kioskSession.create({
    data: {
      cafeId: cafe.id,
      deviceFingerprint: fingerprint,
      expiresAt,
    },
    select: { id: true, expiresAt: true },
  });
  console.log(`[POST /api/kiosk/${cafeSlug}/session] Fresh Session created successfully. ID: ${session.id}, expiresAt: ${session.expiresAt}`);
  return NextResponse.json({ sessionId: session.id, expiresAt: session.expiresAt });
}
