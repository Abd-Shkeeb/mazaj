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
  // Rate limiting per cafe (max 5 creations per minute)
  if (isRateLimitedKey(cafe.id, 5)) {
    return NextResponse.json({ error: 'Too many session creations' }, { status: 429 });
  }
  const expiresAt = addMinutes(new Date(), cafe.kioskSessionMinutes ?? 45);
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
