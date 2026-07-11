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
    kioskSessionMinutes?: number
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
  if (data.kioskSessionMinutes !== undefined) {
    const minVal = data.kioskSessionMinutes;
    (updateData as any).kioskSessionMinutes = typeof minVal === 'number' && minVal >= 1 && minVal <= 120 ? minVal : 15;
  }

  await (db.cafe.update as any)({
    where: { id: cafeId },
    data: updateData,
  })

  revalidatePath('/[locale]/dashboard', 'page')
}

export async function retryGeminiConnectionAction(cafeId: string) {
  try {
    await verifyOwnerSession(cafeId)
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is missing / مفتاح الـ API غير مهيأ في النظام')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    // Quick test generation to verify connectivity and quota limits
    const response = await model.generateContent("Respond with 'OK' in JSON format only.")
    const txt = response.response.text()

    if (!txt) {
      throw new Error('Empty response received from Gemini')
    }

    // Success: reset all error flags
    await (db.cafe.update as any)({
      where: { id: cafeId },
      data: {
        geminiQuotaExceeded: false,
        geminiFailureReason: null,
        geminiLastChecked: new Date(),
        geminiErrorCount: 0,
      }
    })

    // Log recovery success in GeminiHealthLog
    await ((db as any).geminiHealthLog.create)({
      data: {
        cafeId,
        event: 'RECOVERY_SUCCESS',
        details: 'Manual connection re-verification succeeded / تم التحقق من نجاح الاتصال يدوياً'
      }
    })

    revalidatePath('/[locale]/dashboard', 'page')
    return { success: true }
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    const lowerMsg = errorMsg.toLowerCase()
    
    const isQuotaErr = errorMsg.includes('429') || 
                       lowerMsg.includes('quota') || 
                       lowerMsg.includes('limit') ||
                       lowerMsg.includes('resource_exhausted')
                       
    const isAuthErr = errorMsg.includes('401') ||
                      errorMsg.includes('403') ||
                      lowerMsg.includes('key invalid') ||
                      lowerMsg.includes('unauthorized') ||
                      lowerMsg.includes('not valid')
                      
    const isNetworkErr = lowerMsg.includes('timeout') ||
                         lowerMsg.includes('fetch') ||
                         lowerMsg.includes('network') ||
                         lowerMsg.includes('dns') ||
                         lowerMsg.includes('econnrefused') ||
                         lowerMsg.includes('enotfound')

    let failureReason = `System Error / خطأ في النظام`
    let logEvent = 'GENERAL_ERROR'

    if (isQuotaErr) {
      failureReason = `Quota Limit Exceeded / انتهت حصة استهلاك الباقة الفعلية (429 Quota Exceeded)`
      logEvent = 'QUOTA_EXCEEDED'
    } else if (isAuthErr) {
      failureReason = `Invalid API Key / مفتاح الـ API غير صالح أو غير مصرح له (401/403 Invalid Key)`
      logEvent = 'INVALID_API_KEY'
    } else if (isNetworkErr) {
      failureReason = `Network Error / فشل الاتصال بخوادم Google (Network Timeout/DNS)`
      logEvent = 'NETWORK_TIMEOUT'
    } else {
      failureReason = `Google Server Error / مشكلة مؤقتة في خوادم الخدمة (500/503 Service Unavailable): ${errorMsg.substring(0, 80)}`
    }

    const errorIncrement = (isQuotaErr || isAuthErr) ? 1 : 0

    await (db.cafe.update as any)({
      where: { id: cafeId },
      data: {
        geminiQuotaExceeded: isQuotaErr || isAuthErr,
        geminiFailureReason: failureReason,
        geminiLastChecked: new Date(),
        geminiErrorCount: {
          increment: errorIncrement
        }
      }
    })

    // Log connection re-verification failure
    await ((db as any).geminiHealthLog.create)({
      data: {
        cafeId,
        event: logEvent,
        details: `Manual recheck failed: ${failureReason}`
      }
    })

    revalidatePath('/[locale]/dashboard', 'page')
    return { success: false, error: failureReason }
  }
}

export async function clearHealthLogsAction(cafeId: string) {
  try {
    await verifyOwnerSession(cafeId)
    await ((db as any).geminiHealthLog.deleteMany)({
      where: { cafeId }
    })
    revalidatePath('/[locale]/dashboard', 'page')
    return { success: true }
  } catch (error: any) {
    console.error('[Clear Health Logs Error]:', error.message || error)
    throw error
  }
}

export async function checkSystemHealthAction(cafeId: string) {
  try {
    await verifyOwnerSession(cafeId)
    
    const results: Record<string, { status: 'OK' | 'SLOW' | 'ERROR'; latency: number; details?: string }> = {}
    const now = new Date()

    // 1. Database Check (Prisma count check)
    const dbStart = Date.now()
    try {
      await db.cafe.count()
      const dbLatency = Date.now() - dbStart
      results.database = {
        status: dbLatency > 1500 ? 'SLOW' : 'OK',
        latency: dbLatency,
        details: 'Connected to Supabase PostgreSQL pooler / متصل بقاعدة البيانات بنجاح'
      }
    } catch (e: any) {
      results.database = {
        status: 'ERROR',
        latency: Date.now() - dbStart,
        details: `Database connection error: ${e.message || String(e)}`
      }
    }

    // 2. Gemini API Check
    const geminiStart = Date.now()
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('API key is missing')
      }
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      await model.generateContent("OK")
      const geminiLatency = Date.now() - geminiStart
      results.gemini = {
        status: geminiLatency > 3000 ? 'SLOW' : 'OK',
        latency: geminiLatency,
        details: 'Gemini flash connectivity healthy / الخدمة تعمل بكفاءة'
      }
    } catch (e: any) {
      const errorMsg = e.message || String(e)
      results.gemini = {
        status: 'ERROR',
        latency: Date.now() - geminiStart,
        details: errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') 
          ? 'Quota limit exceeded (429) / انتهت حصة الاستهلاك'
          : `API connection failed: ${errorMsg}`
      }
    }

    // 3. Telegram Bot Status Check
    const tgStart = Date.now()
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN
      if (!token) {
        throw new Error('Telegram bot token not configured')
      }
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, { signal: AbortSignal.timeout(4000) })
      const data = await res.json()
      const tgLatency = Date.now() - tgStart
      if (res.ok && data.ok) {
        results.telegram = {
          status: tgLatency > 2000 ? 'SLOW' : 'OK',
          latency: tgLatency,
          details: `Connected: @${data.result.username} / البوت متصل ومستعد`
        }
      } else {
        throw new Error(data.description || 'API key mismatch')
      }
    } catch (e: any) {
      results.telegram = {
        status: 'ERROR',
        latency: Date.now() - tgStart,
        details: `Telegram endpoint error: ${e.message || String(e)}`
      }
    }

    // 4. Supabase Client Connectivity
    const sbStart = Date.now()
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!url) {
        throw new Error('Supabase configuration missing')
      }
      const res = await fetch(`${url}/rest/v1/`, { signal: AbortSignal.timeout(4000) })
      const sbLatency = Date.now() - sbStart
      results.supabase = {
        status: sbLatency > 2000 ? 'SLOW' : 'OK',
        latency: sbLatency,
        details: 'Supabase REST API responding / خوادم Supabase مستجيبة'
      }
    } catch (e: any) {
      results.supabase = {
        status: 'ERROR',
        latency: Date.now() - sbStart,
        details: `Supabase connectivity error: ${e.message || String(e)}`
      }
    }

    // 5. Storage (Supabase bucket check)
    const storageStart = Date.now()
    try {
      const { supabase, BUCKET_NAME } = await import('@/lib/supabase')
      const { error } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 1 })
      if (error) throw error
      const storageLatency = Date.now() - storageStart
      results.storage = {
        status: storageLatency > 2500 ? 'SLOW' : 'OK',
        latency: storageLatency,
        details: `Storage bucket '${BUCKET_NAME}' list succeeded / مساحة التخزين مستجيبة`
      }
    } catch (e: any) {
      results.storage = {
        status: 'ERROR',
        latency: Date.now() - storageStart,
        details: `Storage bucket access failed: ${e.message || String(e)}`
      }
    }

    return {
      success: true,
      lastChecked: now.toLocaleTimeString(),
      results
    }
  } catch (error: any) {
    console.error('[checkSystemHealthAction Error]:', error.message || error)
    return { success: false, error: error.message || 'System health audit failed' }
  }
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
