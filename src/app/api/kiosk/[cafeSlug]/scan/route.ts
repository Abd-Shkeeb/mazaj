// src/app/api/kiosk/[cafeSlug]/scan/route.ts
// Entry point for QR code scans — creates a new ACTIVE KioskSession and redirects to the kiosk page.
// Also handles automatic server redirects from page.tsx when an existing session is USED/EXPIRED.

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addMinutes } from 'date-fns';
import { isRateLimited } from '@/lib/rateLimit';

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

  // 2. Check if the existing session cookie is still ACTIVE — reuse it, don't create a new one unnecessarily
  const existingSessionId = request.cookies.get('kiosk-session-id')?.value;
  if (existingSessionId) {
    const existing = await db.kioskSession.findUnique({ where: { id: existingSessionId } });
    if (
      existing &&
      (existing as any).status === 'ACTIVE' &&
      existing.expiresAt > new Date() &&
      existing.cafeId === cafe.id
    ) {
      console.log(`[QR Scan Route] Reusing existing ACTIVE session: ${existingSessionId}`);
      const kioskPath = `/${locale}/${cafeSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;
      return NextResponse.redirect(new URL(kioskPath, request.url), { status: 302 });
    }
  }

  // 3. Create a FRESH session
  const fingerprint = request.headers.get('x-device-fingerprint') ?? undefined;
  const sessionMinutes = (cafe as any).kioskSessionMinutes ?? 15;
  const expiresAt = addMinutes(new Date(), sessionMinutes);

  const newSession = await db.kioskSession.create({
    data: { cafeId: cafe.id, deviceFingerprint: fingerprint, expiresAt, status: 'ACTIVE' },
    select: { id: true, expiresAt: true },
  });

  console.log(`[QR Scan Route] ✅ New session created. ID: ${newSession.id}, expiresAt: ${newSession.expiresAt}`);

  // 4. Redirect to kiosk page with session cookie set
  const kioskPath = `/${locale}/${cafeSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;
  console.log(`[QR Scan Route] Redirecting to kiosk: ${kioskPath}`);

  const response = NextResponse.redirect(new URL(kioskPath, request.url), { status: 302 });
  const maxAge = Math.floor((newSession.expiresAt.getTime() - Date.now()) / 1000);

  response.cookies.set('kiosk-session-id', newSession.id, {
    path: '/',
    maxAge,
    httpOnly: false, // Must be readable by client-side JS for validate calls
    sameSite: 'lax',
  });

  return response;
}
