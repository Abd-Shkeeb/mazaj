import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionAction } from '@/app/actions/auth';
import { verifyActiveSubscription } from '@/lib/subscription';

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

    // Check active session of the owner
    const session = await getSessionAction();
    if (!session || (session.cafeId !== cafeId && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: 'OWNER_LOGGED_OUT' });
    }

    // Verify user still exists and belongs to this cafe
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { cafeId: true, role: true },
    });
    if (!user || (user.cafeId !== cafeId && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: 'OWNER_LOGGED_OUT' });
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
