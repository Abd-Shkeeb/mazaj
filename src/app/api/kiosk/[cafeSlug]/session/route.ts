import { isRateLimitedKey } from '@/lib/rateLimiter';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addMinutes } from 'date-fns';

export async function POST(request: NextRequest, { params }: { params: Promise<{ cafeSlug: string }> }) {
  const { cafeSlug } = await params;
  console.warn(`[POST /api/kiosk/${cafeSlug}/session] Rejected. Direct programmatic session creation is forbidden. Sessions must be initialized via the scan route.`);
  return NextResponse.json(
    { error: 'Forbidden. Kiosk sessions can only be created by physically scanning the QR code.' },
    { status: 403 }
  );
}
