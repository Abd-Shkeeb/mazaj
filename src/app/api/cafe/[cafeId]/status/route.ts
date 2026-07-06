import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionAction } from '@/app/actions/auth';
import { verifyActiveSubscription } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ cafeId: string }> }) {
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
  } catch (error) {
    console.error('Error fetching cafe status:', error);
    return NextResponse.json({ status: 'ERROR' }, { status: 500 });
  }
}
