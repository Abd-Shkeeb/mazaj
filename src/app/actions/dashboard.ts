'use server'

import db from '@/lib/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { getSessionAction } from '@/app/actions/auth'
import { assertActiveSubscription, assertCanAddDrink, assertCanAddUser } from '@/lib/subscription'
import { clearDrinkCache } from '@/lib/drinkCache'

// Helper to verify cafe owner session
export async function verifyOwnerSession(targetCafeId: string) {
  const session = await getSessionAction()
  if (!session) {
    throw new Error('Unauthorized / غير مصرح بالوصول - يرجى تسجيل الدخول')
  }
  if (session.cafeId !== targetCafeId) {
    throw new Error('Forbidden / غير مصرح لك بالتعديل على هذا المقهى')
  }

  // Assert active subscription
  await assertActiveSubscription(targetCafeId)

  return session
}

// Helper to verify drink ownership
async function verifyDrinkOwnership(drinkId: string) {
  const session = await getSessionAction()
  if (!session) {
    throw new Error('Unauthorized / غير مصرح بالوصول - يرجى تسجيل الدخول')
  }

  const drink = await db.drink.findUnique({
    where: { id: drinkId },
  })

  if (!drink) {
    throw new Error('Drink not found / المشروب غير موجود')
  }

  if (drink.cafeId !== session.cafeId) {
    throw new Error('Forbidden / غير مصرح لك بالتعديل على هذا المشروب')
  }

  // Assert active subscription
  await assertActiveSubscription(drink.cafeId)

  return drink
}

// Drink CRUD operations
export async function addDrinkAction(data: {
  nameAr: string
  nameEn: string
  description: string
  price: number
  category: string
  image?: string
  isAvailable?: boolean
  caffeine: number
  energy: number
  sweetness: number
  isHot: boolean
  cafeId: string
}) {
  // Authorization Check
  await verifyOwnerSession(data.cafeId)

  // Check Plan limits
  await assertCanAddDrink(data.cafeId)

  // Duplicate name check (case-insensitive) within the same cafe
  const existing = await db.drink.findMany({
    where: { cafeId: data.cafeId },
  })
  const isDuplicate = existing.some(
    d =>
      d.nameAr.toLowerCase().trim() === data.nameAr.toLowerCase().trim() ||
      d.nameEn.toLowerCase().trim() === data.nameEn.toLowerCase().trim()
  )
  if (isDuplicate) {
    throw new Error('A drink with this name already exists in this cafe / المشروب بهذا الاسم موجود بالفعل في هذا المقهى')
  }

  await db.drink.create({
    data: {
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image || null,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      caffeine: data.caffeine,
      energy: data.energy,
      sweetness: data.sweetness,
      isHot: data.isHot,
      cafeId: data.cafeId,
    },
  })

  revalidatePath('/[locale]/dashboard', 'page')
  clearDrinkCache(data.cafeId)
}

export async function updateDrinkAction(
  id: string,
  data: {
    nameAr?: string
    nameEn?: string
    description?: string
    price?: number
    category?: string
    image?: string
    isAvailable?: boolean
    caffeine?: number
    energy?: number
    sweetness?: number
    isHot?: boolean
  },
) {
  // Authorization Check
  const drink = await verifyDrinkOwnership(id)

  // Duplicate name check if name is being updated
  if (data.nameAr || data.nameEn) {
    const existing = await db.drink.findMany({
      where: { cafeId: drink.cafeId },
    })
    const isDuplicate = existing.some(
      d =>
        d.id !== id &&
        ((data.nameAr && d.nameAr.toLowerCase().trim() === data.nameAr.toLowerCase().trim()) ||
         (data.nameEn && d.nameEn.toLowerCase().trim() === data.nameEn.toLowerCase().trim()))
    )
    if (isDuplicate) {
      throw new Error('A drink with this name already exists in this cafe / المشروب بهذا الاسم موجود بالفعل في هذا المقهى')
    }
  }

  await db.drink.update({
    where: { id },
    data: {
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      isAvailable: data.isAvailable,
      caffeine: data.caffeine,
      energy: data.energy,
      sweetness: data.sweetness,
      isHot: data.isHot,
    },
  })

  revalidatePath('/[locale]/dashboard', 'page')
}

export async function deleteDrinkAction(id: string) {
  // Authorization Check
  const drink = await verifyDrinkOwnership(id)

  await db.drink.delete({
    where: { id },
  })

  revalidatePath('/[locale]/dashboard', 'page')
  clearDrinkCache(drink.cafeId)
}

// Cafe Settings operations
export async function updateCafeSettingsAction(
  cafeId: string,
  data: {
    nameAr?: string
    nameEn?: string
    phone?: string
    addressAr?: string
    addressEn?: string
    workingHoursAr?: string
    workingHoursEn?: string
    logo?: string
    logoUrl?: string
    coverImage?: string
    coverImageUrl?: string
    instagram?: string
    facebook?: string
  },
) {
  // Authorization Check
  await verifyOwnerSession(cafeId)

  const logoValue = data.logo !== undefined ? data.logo : data.logoUrl
  const coverImageValue = data.coverImage !== undefined ? data.coverImage : data.coverImageUrl

  const updateData: Prisma.CafeUpdateInput = {}
  if (data.nameAr !== undefined) updateData.nameAr = data.nameAr
  if (data.nameEn !== undefined) updateData.nameEn = data.nameEn
  if (data.phone !== undefined) updateData.phone = data.phone || null
  if (data.addressAr !== undefined) updateData.addressAr = data.addressAr || null
  if (data.addressEn !== undefined) updateData.addressEn = data.addressEn || null
  if (data.workingHoursAr !== undefined) updateData.workingHoursAr = data.workingHoursAr || null
  if (data.workingHoursEn !== undefined) updateData.workingHoursEn = data.workingHoursEn || null
  if (logoValue !== undefined) updateData.logo = logoValue || null
  if (coverImageValue !== undefined) updateData.coverImage = coverImageValue || null
  if (data.instagram !== undefined) updateData.instagram = data.instagram || null
  if (data.facebook !== undefined) updateData.facebook = data.facebook || null

  await db.cafe.update({
    where: { id: cafeId },
    data: updateData,
  })

  revalidatePath('/[locale]/dashboard', 'page')
}

// SaaS Cafe Registration Action
export async function registerCafeAction(data: {
  slug: string
  nameAr: string
  nameEn: string
  email: string
  password?: string
}) {
  try {
    const existingCafe = await db.cafe.findUnique({
      where: { slug: data.slug.toLowerCase().trim() },
    })

    if (existingCafe) {
      return { success: false, error: 'Cafe slug already exists / معرف المقهى مستخدم بالفعل' }
    }

    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })

    if (existingUser) {
      return { success: false, error: 'Email already registered / البريد الإلكتروني مسجل بالفعل' }
    }

    if (!data.password || data.password.trim() === '') {
      return { success: false, error: 'Password is required / كلمة المرور مطلوبة' }
    }

    // Hash Password using bcryptjs before database storage
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create Cafe and User
    const newCafe = await db.cafe.create({
      data: {
        slug: data.slug.toLowerCase().trim(),
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        logo: '☕',
        coverImage:
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        subscriptionPlan: 'FREE_TRIAL',
        subscriptionStatus: 'ACTIVE',
      },
    })

    const newUser = await db.user.create({
      data: {
        name: `مدير ${data.nameAr}`,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        cafeId: newCafe.id,
      },
    })
    return { success: true, cafe: newCafe, user: newUser }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return { success: false, error: errMsg || 'Error occurred / حدث خطأ أثناء التسجيل' }
  }
}
