import db from '@/lib/db'

export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'CONFIG_ERROR'

export interface PlanLimits {
  maxDrinks: number
  maxUsers: number
  maxAnalyses: number
  hasMoodAnalytics: boolean
  hasSalesReports: boolean
  hasBetaAnalytics: boolean
  hasFunnelAnalytics: boolean
  hasMultiBranch: boolean
}

/**
 * Returns the start of the current billing cycle.
 * Accepts the raw Date value from DB (may come from $queryRaw).
 * Falls back to the provided fallback date if cycleStart is null/undefined.
 */
export function getBillingCycleStart(
  cycleStart: Date | string | null | undefined,
  fallback: Date,
): Date {
  return cycleStart ? new Date(cycleStart) : fallback
}

/**
 * Resets the billing cycle for a cafe to now. Uses raw SQL to bypass
 * stale Prisma types until the client is regenerated.
 * Call this on plan activation, renewal, or plan upgrade/downgrade.
 */
export async function resetBillingCycle(cafeId: string): Promise<void> {
  await db.$executeRaw`UPDATE "Cafe" SET "currentBillingCycleStart" = NOW() WHERE id = ${cafeId}`
}

export function getPlanLimits(plan: string): PlanLimits {
  const normalizedPlan = (plan || 'FREE').toUpperCase()

  // FREE / FREE_TRIAL has 100 analyses
  if (normalizedPlan === 'FREE_TRIAL' || normalizedPlan === 'FREE') {
    return {
      maxDrinks: 999999,
      maxUsers: 999999,
      maxAnalyses: 100,
      hasMoodAnalytics: true,
      hasSalesReports: true,
      hasBetaAnalytics: true,
      hasFunnelAnalytics: true,
      hasMultiBranch: false,
    }
  }

  switch (normalizedPlan) {
    case 'LITE':
      return {
        maxDrinks: 10,
        maxUsers: 1,
        maxAnalyses: 1000,
        hasMoodAnalytics: false,
        hasSalesReports: false,
        hasBetaAnalytics: false,
        hasFunnelAnalytics: false,
        hasMultiBranch: false,
      }
    case 'STANDARD':
      return {
        maxDrinks: 30,
        maxUsers: 3,
        maxAnalyses: 5000,
        hasMoodAnalytics: true,
        hasSalesReports: true,
        hasBetaAnalytics: false,
        hasFunnelAnalytics: false,
        hasMultiBranch: false,
      }
    case 'PRO':
      return {
        maxDrinks: 999999,
        maxUsers: 999999,
        maxAnalyses: 20000,
        hasMoodAnalytics: true,
        hasSalesReports: true,
        hasBetaAnalytics: true,
        hasFunnelAnalytics: true,
        hasMultiBranch: false,
      }
    case 'ENTERPRISE':
      return {
        maxDrinks: 999999,
        maxUsers: 999999,
        maxAnalyses: 999999,
        hasMoodAnalytics: true,
        hasSalesReports: true,
        hasBetaAnalytics: true,
        hasFunnelAnalytics: true,
        hasMultiBranch: true,
      }
    case 'STARTER':
      return {
        maxDrinks: 15,
        maxUsers: 2,
        maxAnalyses: 500,
        hasMoodAnalytics: true,
        hasSalesReports: false,
        hasBetaAnalytics: false,
        hasFunnelAnalytics: false,
        hasMultiBranch: false,
      }
    default:
      // Unknown plan — apply the most restrictive limits and warn.
      console.warn(`[Subscription] Unknown plan '${normalizedPlan}' — applying minimum limits.`)
      return {
        maxDrinks: 10,
        maxUsers: 1,
        maxAnalyses: 100,
        hasMoodAnalytics: false,
        hasSalesReports: false,
        hasBetaAnalytics: false,
        hasFunnelAnalytics: false,
        hasMultiBranch: false,
      }
  }
}

export async function verifyActiveSubscription(cafeId: string): Promise<SubscriptionStatus> {
  const cafe = await db.cafe.findUnique({
    where: { id: cafeId },
    select: {
      subscriptionStatus: true,
      subscriptionPlan: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
    },
  })

  if (!cafe) {
    return 'SUSPENDED'
  }

  // Normalize plan to uppercase to prevent case-mismatch bugs
  const plan = (cafe.subscriptionPlan || 'FREE').toUpperCase()
  const now = new Date()

  // 1. Explicit status overrides — always respected first
  if (cafe.subscriptionStatus === 'SUSPENDED') return 'SUSPENDED'
  if (cafe.subscriptionStatus === 'CANCELLED') return 'CANCELLED'
  if (cafe.subscriptionStatus === 'EXPIRED')   return 'EXPIRED'

  // 2. Free / Trial plans — check trialEndsAt
  if (plan === 'FREE_TRIAL' || plan === 'FREE') {
    const trialEnds = new Date(cafe.trialEndsAt)
    if (now > trialEnds) {
      try {
        await db.cafe.update({ where: { id: cafeId }, data: { subscriptionStatus: 'EXPIRED' } })
      } catch (err: any) {
        console.error('[Subscription] Failed to write EXPIRED for trial:', err)
      }
      return 'EXPIRED'
    }
    return 'TRIAL'
  }

  // 3. Paid plans — MUST have subscriptionEndsAt; missing = config error
  const PAID_PLANS = ['STARTER', 'LITE', 'STANDARD', 'PRO', 'ENTERPRISE']
  if (PAID_PLANS.includes(plan)) {
    if (!cafe.subscriptionEndsAt) {
      // CONFIG ERROR: paid plan is active but has no end date.
      // This is an admin-side misconfiguration — log a detailed error and block access.
      console.error(
        `[Subscription] ⚠️ CONFIG_ERROR ⚠️` +
        `\n  Cafe ID     : ${cafeId}` +
        `\n  Plan        : ${plan}` +
        `\n  Status (DB) : ${cafe.subscriptionStatus}` +
        `\n  Problem     : subscriptionEndsAt is null for a paid plan.` +
        `\n  Fix         : Set subscriptionEndsAt via Super Admin → تعديل الاشتراك.`,
      )
      return 'CONFIG_ERROR'
    }

    const ends = new Date(cafe.subscriptionEndsAt)
    if (now > ends) {
      try {
        await db.cafe.update({ where: { id: cafeId }, data: { subscriptionStatus: 'EXPIRED' } })
      } catch (err: any) {
        console.error('[Subscription] Failed to write EXPIRED for paid plan:', err)
      }
      return 'EXPIRED'
    }

    return 'ACTIVE'
  }

  // 4. Unrecognised plan — log and deny access
  console.warn(
    `[Subscription] Unrecognised plan '${plan}' for cafe ${cafeId}. Treating as SUSPENDED.`,
  )
  return 'SUSPENDED'
}

export async function assertActiveSubscription(cafeId: string): Promise<void> {
  const status = await verifyActiveSubscription(cafeId)
  if (status === 'EXPIRED' || status === 'SUSPENDED' || status === 'CANCELLED') {
    throw new Error('Subscription Required / يجب الاشتراك لتفعيل لوحة التحكم والكشك')
  }
  if (status === 'CONFIG_ERROR') {
    throw new Error(
      'Subscription Configuration Error / خطأ في إعدادات الاشتراك: الباقة مدفوعة لكن تاريخ الانتهاء غير محدد. يرجى التواصل مع دعم مزاج.',
    )
  }
}

export async function assertCanAddDrink(cafeId: string): Promise<void> {
  const cafe = await db.cafe.findUnique({
    where: { id: cafeId },
    select: {
      subscriptionPlan: true,
      _count: { select: { drinks: true } },
    },
  })
  if (!cafe) {
    throw new Error('Cafe not found / المقهى غير موجود')
  }
  const limits = getPlanLimits(cafe.subscriptionPlan)
  if (cafe._count.drinks >= limits.maxDrinks) {
    throw new Error(
      `لقد تجاوزت الحد الأقصى للمشروبات المسموح بها في باقتك الحالية (${limits.maxDrinks} مشروب). يرجى الترقية للباقة الأعلى لزيادة الحد.`,
    )
  }
}

export async function assertCanAddUser(cafeId: string): Promise<void> {
  const cafe = await db.cafe.findUnique({
    where: { id: cafeId },
    select: {
      subscriptionPlan: true,
      _count: { select: { users: true } },
    },
  })
  if (!cafe) {
    throw new Error('Cafe not found / المقهى غير موجود')
  }
  const limits = getPlanLimits(cafe.subscriptionPlan)
  if (cafe._count.users >= limits.maxUsers) {
    throw new Error(
      `لقد تجاوزت الحد الأقصى للمستخدمين المسموح به في باقتك الحالية (${limits.maxUsers} مستخدم). يرجى الترقية للباقة الأعلى لزيادة الحد.`,
    )
  }
}

export async function assertCanAnalyzeMood(cafeId: string): Promise<void> {
  // Fetch plan via ORM (no currentBillingCycleStart — stale Prisma types)
  const cafe = await db.cafe.findUnique({
    where: { id: cafeId },
    select: { subscriptionPlan: true, createdAt: true },
  })
  if (!cafe) {
    throw new Error('Cafe not found / المقهى غير موجود')
  }

  // Fetch currentBillingCycleStart via raw SQL to bypass stale Prisma types
  const rows = await db.$queryRaw<Array<{ currentBillingCycleStart: Date | null }>>`
    SELECT "currentBillingCycleStart" FROM "Cafe" WHERE id = ${cafeId}
  `
  const cycleStart = getBillingCycleStart(
    rows[0]?.currentBillingCycleStart,
    cafe.createdAt,
  )

  const limits = getPlanLimits(cafe.subscriptionPlan)

  const analysesCount = await db.analysis.count({
    where: {
      cafeId,
      createdAt: { gte: cycleStart },
    },
  })

  if (analysesCount >= limits.maxAnalyses) {
    throw new Error(
      `لقد تجاوزت حد تحليل المزاج المسموح به لباقتك الحالية في هذا الشهر (${limits.maxAnalyses} عملية). يرجى الترقية للباقة الأعلى للاستمرار.`,
    )
  }
}
