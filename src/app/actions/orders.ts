'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { getSessionAction } from '@/app/actions/auth'
import { isRateLimited } from '@/lib/rateLimit'
import { assertActiveSubscription } from '@/lib/subscription'

// Helper to verify order ownership
async function verifyOrderOwnership(orderId: number) {
  const session = await getSessionAction()
  if (!session) {
    throw new Error('Unauthorized / غير مصرح بالوصول - يرجى تسجيل الدخول')
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error('Order not found / الطلب غير موجود')
  }

  if (order.cafeId !== session.cafeId) {
    throw new Error('Forbidden / غير مصرح لك بالتعديل على هذا الطلب')
  }

  // Assert active subscription for the cafe
  await assertActiveSubscription(order.cafeId)

  return order
}

export async function createOrderAction(data: {
  drinkId: string
  drinkName: string
  price: number
  cafeId: string
}) {
  // Assert active subscription first
  await assertActiveSubscription(data.cafeId)

  // 1. IP-based Rate Limiting (Limit to 10 order placements per minute per IP)
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'

  if (isRateLimited(ip, 10)) {
    throw new Error('Too many requests / تم إرسال الكثير من الطلبات، يرجى الانتظار قليلاً')
  }

  const order = await db.order.create({
    data: {
      drinkId: data.drinkId,
      drinkName: data.drinkName,
      price: data.price,
      cafeId: data.cafeId,
      status: 'PENDING',
    },
  })

  revalidatePath('/[locale]/dashboard', 'page')
  return order
}

export async function updateOrderStatusAction(orderId: number, status: string) {
  // Authorization Check (IDOR protection)
  await verifyOrderOwnership(orderId)

  const updated = await db.order.update({
    where: { id: orderId },
    data: { status },
  })

  if (status === 'COMPLETED') {
    await db.event.create({
      data: {
        cafeId: updated.cafeId,
        name: 'COMPLETE_ORDER',
      },
    })
  }

  revalidatePath('/[locale]/dashboard', 'page')
  return updated
}

export async function deleteOrderAction(orderId: number) {
  // Authorization Check (IDOR protection)
  await verifyOrderOwnership(orderId)

  const deleted = await db.order.delete({
    where: { id: orderId },
  })

  revalidatePath('/[locale]/dashboard', 'page')
  return deleted
}
