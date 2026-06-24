// src/app/actions/userManagement.ts
'use server'

import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getSessionAction } from '@/app/actions/auth'
import { verifyOwnerSession } from '@/app/actions/dashboard'
import { assertCanAddUser, assertActiveSubscription } from '@/lib/subscription'

// List users for current cafe (excluding password hash)
export async function listUsersAction(page: number = 1, limit: number = 20) {
  const session = await getSessionAction()
  if (!session) throw new Error('Unauthorized')
  const cafeId = session.cafeId
  // Ensure cafe is active
  await assertActiveSubscription(cafeId)
  const skip = (page - 1) * limit
  const users = await db.user.findMany({
    where: { cafeId },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })
  return users
}

// Create a new staff user linked to the same cafe
export async function createUserAction(data: {
  name: string
  email: string
  password: string
}) {
  const session = await getSessionAction()
  if (!session) throw new Error('Unauthorized')
  const cafeId = session.cafeId

  // Verify owner session to ensure only owner can add users
  await verifyOwnerSession(cafeId)

  // Enforce plan limits
  await assertCanAddUser(cafeId)

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      
      cafeId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      
      createdAt: true,
    },
  })
  return user
}

// Delete a user (cannot delete self or owner)
export async function deleteUserAction(userId: string) {
  const session = await getSessionAction()
  if (!session) throw new Error('Unauthorized')
  const cafeId = session.cafeId

  // Verify ownership of cafe
  await verifyOwnerSession(cafeId)

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, cafeId: true },
  })
  if (!targetUser) throw new Error('User not found')
  if (targetUser.cafeId !== cafeId) throw new Error('Forbidden')

  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
