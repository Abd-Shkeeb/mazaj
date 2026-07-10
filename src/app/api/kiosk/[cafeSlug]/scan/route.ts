// src/app/api/kiosk/[cafeSlug]/scan/route.ts
// TRUE entry point for QR code scans.
// The physical QR code (generated in dashboard) must point to:
//   https://[domain]/api/kiosk/[cafeSlug]/scan?locale=ar&table=4 (table is optional)
//
// This route:
//   1. Looks up the cafe
//   2. Always creates a FRESH ACTIVE KioskSession in the database
//   3. Sets the kiosk-session-id cookie in the redirect response
//   4. Redirects the browser to the kiosk page (/[locale]/[cafeSlug])
//
// Because this is a proper Route Handler (not a Server Component), it CAN set cookies.

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addMinutes } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cafeSlug: string }> }
) {
  const { cafeSlug } = await params;
  const url = new URL(request.url);
  const tableNumber = url.searchParams.get('table') ?? undefined;
  const locale = url.searchParams.get('locale') ?? 'ar';

  console.log(`[QR Scan Route] Received scan for cafe: ${cafeSlug}, locale: ${locale}, table: ${tableNumber}`);

  // 1. Find the cafe
  const cafe = await db.cafe.findUnique({ where: { slug: cafeSlug.toLowerCase().trim() } });
  if (!cafe) {
    console.error(`[QR Scan Route] Cafe not found: ${cafeSlug}`);
    return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
  }

  // 2. Always create a FRESH ACTIVE session — regardless of any existing cookie
  const sessionMinutes = (cafe as any).kioskSessionMinutes ?? 15;
  const expiresAt = addMinutes(new Date(), sessionMinutes);

  const newSession = await db.kioskSession.create({
    data: {
      cafeId: cafe.id,
      expiresAt,
      status: 'ACTIVE',
    },
    select: { id: true, expiresAt: true },
  });

  console.log(`[QR Scan Route] ✅ Session created: ${newSession.id}, expires: ${newSession.expiresAt}`);

  // 3. Build redirect to kiosk page
  const kioskPath = `/${locale}/${cafeSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;
  const response = NextResponse.redirect(new URL(kioskPath, request.url), { status: 302 });

  // 4. Set the session cookie in the redirect response (browser will send it on next request)
  const maxAge = Math.floor((newSession.expiresAt.getTime() - Date.now()) / 1000);
  response.cookies.set('kiosk-session-id', newSession.id, {
    path: '/',
    maxAge,
    httpOnly: false, // readable by client JS for validate calls
    sameSite: 'lax',
  });
  // Clear old fingerprint so client generates a fresh one
  response.cookies.delete('kiosk-device-fp');

  console.log(`[QR Scan Route] Redirecting to: ${kioskPath} with session cookie set.`);
  return response;
}
