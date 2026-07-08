import db from '@/lib/db'

export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED'

export interface PlanLimits {
  maxDrinks: number
  maxUsers: number
  hasMoodAnalytics: boolean
  hasSalesReports: boolean
  hasBetaAnalytics: boolean
  hasFunnelAnalytics: boolean
  hasMultiBranch: boolean
}

export function getPlanLimits(plan: string): PlanLimits {
  const normalizedPlan = (plan || 'FREE').toUpperCase()

  // FREE / FREE_TRIAL inherits all features/limits of PRO
  if (normalizedPlan === 'FREE_TRIAL' || normalizedPlan === 'FREE') {
    return {
      maxDrinks: 999999,
      maxUsers: 999999,
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
        hasMoodAnalytics: true,
        hasSalesReports: true,
        hasBetaAnalytics: true,
        hasFunnelAnalytics: true,
        hasMultiBranch: true,
      }
    default:
      return {
        maxDrinks: 10,
        maxUsers: 1,
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

  const now = new Date()

  // 1. Check suspended or cancelled status
  if (cafe.subscriptionStatus === 'SUSPENDED') {
    return 'SUSPENDED'
  }
  if (cafe.subscriptionStatus === 'CANCELLED') {
    return 'CANCELLED'
  }
  if (cafe.subscriptionStatus === 'EXPIRED') {
    return 'EXPIRED'
  }

  // 2. Check Free Trial expiration
  if (cafe.subscriptionPlan === 'FREE_TRIAL' || cafe.subscriptionPlan === 'FREE') {
    const trialEnds = new Date(cafe.trialEndsAt)
    if (now > trialEnds) {
      try {
        await db.cafe.update({
          where: { id: cafeId },
          data: { subscriptionStatus: 'EXPIRED' },
        })
      } catch (err: any) {
        console.error('[Subscription] Failed to update expired trial status in DB:', err)
        if (err.stack) console.error(err.stack)
      }
      return 'EXPIRED'
    }
    return 'TRIAL'
  }

  // 3. Check paid plans (LITE, STANDARD, PRO, ENTERPRISE, STARTER) expiration
  if (cafe.subscriptionEndsAt) {
    const ends = new Date(cafe.subscriptionEndsAt)
    if (now > ends) {
      try {
        await db.cafe.update({
          where: { id: cafeId },
          data: { subscriptionStatus: 'EXPIRED' },
        })
      } catch (err: any) {
        console.error('[Subscription] Failed to update expired plan status in DB:', err)
        if (err.stack) console.error(err.stack)
      }
      return 'EXPIRED'
    }
  }

  return 'ACTIVE'
}

export async function assertActiveSubscription(cafeId: string): Promise<void> {
  const status = await verifyActiveSubscription(cafeId)
  if (status === 'EXPIRED' || status === 'SUSPENDED' || status === 'CANCELLED') {
    throw new Error('Subscription Required / يجب الاشتراك لتفعيل لوحة التحكم والكشك')
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
  const cafe = await db.cafe.findUnique({
    where: { id: cafeId },
    select: { subscriptionPlan: true },
  })
  if (!cafe) {
    throw new Error('Cafe not found / المقهى غير موجود')
  }

  const plan = cafe.subscriptionPlan.toUpperCase()
  let maxAnalyses = 999999
  if (plan === 'FREE_TRIAL' || plan === 'FREE') {
    maxAnalyses = 100
  } else if (plan === 'LITE') {
    maxAnalyses = 1000
  } else if (plan === 'STANDARD') {
    maxAnalyses = 5000
  }

  const analysesCount = await db.analysis.count({
    where: { cafeId },
  })

  if (analysesCount >= maxAnalyses) {
    throw new Error(
      `لقد تجاوزت حد تحليل المزاج المسموح به في باقتك الحالية (${maxAnalyses} عملية). يرجى الترقية للباقة الأعلى للاستمرار.`,
    )
  }
}
