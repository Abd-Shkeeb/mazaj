'use server'

import db from '@/lib/db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { signPayload, verifyPayload } from '@/lib/session'

export async function loginAction(formData: { email: string; password?: string }) {
  const email = formData.email.toLowerCase().trim()
  const password = formData.password

  if (!password || password.trim() === '') {
    throw new Error('Password is required / كلمة المرور مطلوبة')
  }

  const user = await db.user.findUnique({
  where: { email },
  include: { cafe: true },
})

  // Determine if the user is a Super Admin based on the role stored in the DB.
  let isSuperAdmin = false;
  if (user) {
    // The User model has a `role` field ("USER", "ADMIN", "SUPER_ADMIN").
    isSuperAdmin = user.role === 'SUPER_ADMIN';
  }

  // If the user does not exist, reject the login attempt.
  if (!user) {
    throw new Error('User not found / البريد الإلكتروني غير مسجل');
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Incorrect password / كلمة المرور غير صحيحة')
  }

  if (!user.cafeId && !isSuperAdmin) {
    throw new Error('User is not associated with any cafe / هذا الحساب غير مرتبط بمقهى')
  }

  // Cryptographically sign the session data including the role
  const token = signPayload({
    userId: user.id,
    cafeId: user.cafeId || 'SUPER_ADMIN',
    email: user.email,
    role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
  })

  // Set secure HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set('mazaj_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  return {
    success: true,
    cafeSlug: user.cafe?.slug || 'super-admin',
    cafeId: user.cafeId || 'SUPER_ADMIN',
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('mazaj_session')
  return { success: true }
}

export async function getSessionAction() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('mazaj_session')
  if (!sessionCookie) return null

  // Verify cryptographic signature of the token
  return verifyPayload<{ userId: string; cafeId: string; email: string; role?: string }>(
    sessionCookie.value,
  )
}
