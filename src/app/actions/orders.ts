// src/app/actions/orders.ts
'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { headers, cookies } from 'next/headers'
import { getSessionAction } from '@/app/actions/auth'
import { isRateLimited } from '@/lib/rateLimit'
import { assertActiveSubscription } from '@/lib/subscription'

/**
 * Helper to verify order ownership for authenticated users.
 */
async function verifyOrderOwnership(orderId: number) {
  const session = await getSessionAction()
  if (!session) {
    throw new Error('Unauthorized / غير مصرح بالوصول - يرجى تسجيل الدخول')
  }

  const order = await db.order.findUnique({ where: { id: orderId } })

  if (!order) {
    throw new Error('Order not found / الطلب غير موجود')
  }

  if (order.cafeId !== session.cafeId) {
    throw new Error('Forbidden / غير مصرح لك بالتعديل على هذا الطلب')
  }

  // Ensure the cafe has an active subscription before allowing modifications
  await assertActiveSubscription(order.cafeId)

  return order
}

/**
 * Validate a Kiosk session before allowing order creation.
 * Throws an error if the session is missing, invalid, expired, belongs to another device,
 * or does not match the target cafe.
 */
export async function validateKioskSession(cafeId: string) {
  const headerList = await headers()
  const cookieStore = await cookies()
  const sessionId = headerList.get('x-kiosk-session-id') || cookieStore.get('kiosk-session-id')?.value
  const deviceFp = headerList.get('x-device-fingerprint') || cookieStore.get('kiosk-device-fp')?.value

  if (!sessionId) {
    throw new Error('Missing kiosk session ID')
  }

  const session = await (db as any).kioskSession.findUnique({
    where: { id: sessionId },
  })

  if (!session) {
    throw new Error('Invalid kiosk session')
  }

  if (session.status === 'USED') {
    throw new Error('Kiosk session already used')
  }

  if (session.expiresAt < new Date()) {
    throw new Error('Kiosk session expired')
  }

  if (session.deviceFingerprint && session.deviceFingerprint !== deviceFp) {
    throw new Error('Kiosk session used on another device')
  }

  if (session.cafeId !== cafeId) {
    throw new Error('Session cafe mismatch')
  }

  return session
}

/**
 * Create a new order. All requests must include a valid kiosk session.
 */
export async function createOrderAction(data: {
  drinkId: string
  drinkName: string
  price: number
  cafeId: string
  tableNumber?: string
}) {
  // Verify that the cafe has an active subscription
  await assertActiveSubscription(data.cafeId)

  // IP‑based rate limiting (max 10 orders per minute per IP)
  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for') ||
    headerList.get('x-real-ip') ||
    '127.0.0.1'
  if (isRateLimited(ip, 10)) {
    throw new Error('Too many requests / تم إرسال الكثير من الطلبات، يرجى الانتظار قليلاً')
  }

  // Validate kiosk session before proceeding
  const session = await validateKioskSession(data.cafeId)

  const order = await db.order.create({
    data: {
      drinkId: data.drinkId,
      drinkName: data.drinkName,
      price: data.price,
      cafeId: data.cafeId,
      tableNumber: data.tableNumber || null,
      status: 'PENDING',
    },
  })

  // Mark the kiosk session as USED to prevent further actions
  await (db as any).kioskSession.update({
    where: { id: session.id },
    data: { status: 'USED' },
  })

  // Revalidate the dashboard page after creation
  revalidatePath('/[locale]/dashboard', 'page')
  return order
}

/**
 * Update an order's status. Ownership is verified via `verifyOrderOwnership`.
 */
export async function updateOrderStatusAction(orderId: number, status: string) {
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

/**
 * Delete an order. Ownership is verified via `verifyOrderOwnership`.
 */
export async function deleteOrderAction(orderId: number) {
  await verifyOrderOwnership(orderId)

  const deleted = await db.order.delete({
    where: { id: orderId },
  })

  revalidatePath('/[locale]/dashboard', 'page')
  return deleted
}
