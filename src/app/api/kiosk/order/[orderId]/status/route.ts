// src/app/api/kiosk/order/[orderId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const idNum = parseInt(orderId, 10)
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: idNum },
      select: {
        id: true,
        status: true,
        drinkName: true,
        price: true,
        createdAt: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, status: order.status, order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
