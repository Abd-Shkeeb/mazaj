import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import db from '@/lib/db';
import { getSessionAction } from '@/app/actions/auth';
import { verifyActiveSubscription } from '@/lib/subscription';

export async function GET(request: NextRequest, { params }: { params: Promise<{ cafeId: string }> }) {
  const { cafeId } = await params;

  try {
    const cafe = await db.cafe.findUnique({
      where: { id: cafeId },
      select: { subscriptionStatus: true },
    });
    if (!cafe) {
      return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
    }

    // Check subscription status
    const subStatus = await verifyActiveSubscription(cafeId);
    if (subStatus === 'EXPIRED' || subStatus === 'SUSPENDED' || subStatus === 'CANCELLED') {
      return NextResponse.json({ status: subStatus });
    }

    return NextResponse.json({ status: 'ACTIVE' });
  } catch (error: any) {
    console.error('[KioskStatusCheck] Error fetching cafe status:', error);
    if (error.stack) {
      console.error('[KioskStatusCheck] STACK TRACE:', error.stack);
    }
    return NextResponse.json({ status: 'ERROR', message: error.message }, { status: 500 });
  }
}
