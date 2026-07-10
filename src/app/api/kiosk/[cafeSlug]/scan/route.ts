// src/app/api/kiosk/[cafeSlug]/scan/route.ts
// This is the TRUE entry point for QR code scans.
// The physical QR code must point to: /api/kiosk/[cafeSlug]/scan?table=4 (optional table number)
// This route:
//   1. Looks up the cafe
//   2. Invalidates any existing session cookie (USED or EXPIRED sessions are skipped)
//   3. Creates a FRESH ACTIVE KioskSession in the database
//   4. Sets the session cookie in the response
//   5. Redirects the browser to the kiosk page

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addMinutes } from 'date-fns';
import { isRateLimitedKey } from '@/lib/rateLimiter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cafeSlug: string }> }
) {
  const { cafeSlug } = await params;
  const url = new URL(request.url);
  const tableNumber = url.searchParams.get('table') ?? undefined;
  const locale = url.searchParams.get('locale') ?? 'ar';

  console.log(`[QR Scan Route] /api/kiosk/${cafeSlug}/scan called. tableNumber=${tableNumber}, locale=${locale}`);

  // 1. Find the cafe
  const cafe = await db.cafe.findUnique({ where: { slug: cafeSlug.toLowerCase().trim() } });
  if (!cafe) {
    console.error(`[QR Scan Route] Cafe not found for slug: ${cafeSlug}`);
    return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
  }
  console.log(`[QR Scan Route] Cafe matched. ID: ${cafe.id}`);

  // Rate limit: max 30 QR scans / new sessions per cafe per minute (generous to handle automatic server redirects)
  if (isRateLimitedKey(`scan:${cafe.id}`, 30)) {
    console.warn(`[QR Scan Route] Rate limit hit for cafe: ${cafe.id}`);
    return new NextResponse('Too many requests', { status: 429 });
  }

  // 3. Get the device fingerprint from header (optional, populated by the browser client if available)
  const fingerprint = request.headers.get('x-device-fingerprint') ?? undefined;

  // 4. Always create a FRESH session — ignore any existing cookie session
  const sessionMinutes = (cafe as any).kioskSessionMinutes ?? 15;
  const expiresAt = addMinutes(new Date(), sessionMinutes);

  const newSession = await db.kioskSession.create({
    data: {
      cafeId: cafe.id,
      deviceFingerprint: fingerprint,
      expiresAt,
      status: 'ACTIVE',
    },
    select: { id: true, expiresAt: true },
  });

  console.log(`[QR Scan Route] ✅ New session created. ID: ${newSession.id}, expiresAt: ${newSession.expiresAt}`);

  // 5. Build redirect URL to kiosk page
  const kioskPath = `/${locale}/${cafeSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;

  console.log(`[QR Scan Route] Redirecting to kiosk: ${kioskPath}`);

  // 6. Build response with redirect and set session cookies
  const response = NextResponse.redirect(new URL(kioskPath, request.url), { status: 302 });

  const maxAge = Math.floor((newSession.expiresAt.getTime() - Date.now()) / 1000);

  response.cookies.set('kiosk-session-id', newSession.id, {
    path: '/',
    maxAge,
    httpOnly: false, // Must be readable by client-side JS for validate calls
    sameSite: 'lax',
  });

  // Clear old device fingerprint cookie so client sets a fresh one
  response.cookies.delete('kiosk-device-fp');

  return response;
}
