import db from '@/lib/db'
import DashboardClient from '@/components/DashboardClient'
import { redirect } from 'next/navigation'
import { getSessionAction } from '@/app/actions/auth'
import { verifyActiveSubscription } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await getSessionAction()
  const { locale } = await params
  const isAr = locale === 'ar';
  if (!session) {
    redirect(`/${locale}`)
  }

  if (session.role === 'SUPER_ADMIN') {
    redirect(`/${locale}/super-admin`)
  }
  // Verify subscription status
  const subStatus = await verifyActiveSubscription(session.cafeId);

  // CONFIG_ERROR: paid plan missing subscriptionEndsAt — show admin-specific message
  if (subStatus === 'CONFIG_ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-lg w-full bg-white/90 backdrop-blur-md border-2 border-amber-300 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-350">
          {/* Icon */}
          <div className="w-20 h-20 bg-amber-100 border-2 border-amber-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          {/* Badge */}
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-300 tracking-widest uppercase">
            CONFIG_ERROR
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
            {isAr ? 'خطأ في إعدادات الاشتراك' : 'Subscription Configuration Error'}
          </h1>
          <p className="text-sm font-semibold text-gray-700 leading-relaxed">
            {isAr
              ? 'باقتك المدفوعة نشطة، لكن تاريخ انتهاء الاشتراك غير محدد. المنصة معلقة لحين إصلاح الإعداد.'
              : 'Your paid plan is active, but the subscription end date is not set. The platform is suspended until this is fixed.'}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-right text-sm text-amber-800 font-medium space-y-1">
            <p className="font-black text-amber-900">
              {isAr ? '📋 المشكلة:' : '📋 Issue:'}
            </p>
            <p className="text-xs">
              {isAr
                ? 'subscriptionEndsAt = null مع باقة مدفوعة — يُشير إلى خطأ في الإعداد من لوحة Super Admin.'
                : 'subscriptionEndsAt = null on a paid plan — indicates a Super Admin configuration error.'}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {isAr ? 'للمساعدة، تواصل مع دعم مزاج.' : 'Please contact Mazaj support for assistance.'}
          </p>
          <div className="border-t border-gray-100 pt-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Mazaj Cafe • مزاج كافيه
          </div>
        </div>
      </div>
    );
  }

  // EXPIRED / SUSPENDED / CANCELLED — generic blocked page
  if (subStatus !== 'ACTIVE' && subStatus !== 'TRIAL') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F5] px-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#FF6B6B]/10 rounded-full blur-3xl pointer-events-none select-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#FFC107]/10 rounded-full blur-3xl pointer-events-none select-none" />
        <div className="relative max-w-md w-full bg-white/90 backdrop-blur-md border border-[#FF6B6B]/10 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-350">
          <div className="w-20 h-20 bg-[#FF6B6B]/5 border border-[#FF6B6B]/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg className="h-10 w-10 text-[#FF6B6B]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FF6B6B] tracking-tight">
            {isAr ? 'لوحة التحكم غير متاحة' : 'Dashboard Unavailable'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-600 leading-relaxed">
            {isAr
              ? 'تم إيقاف لوحة التحكم بسبب انتهاء الاشتراك.'
              : 'The dashboard has been deactivated due to subscription expiration.'}
          </p>
          <div className="border-t border-gray-100 pt-5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Mazaj Cafe • مزاج كافيه
          </div>
        </div>
      </div>
    );
  }
  // Fetch only authorized cafe associated with session
  const cafes = await db.cafe.findMany({
    where: { id: session.cafeId },
    orderBy: { nameAr: 'asc' },
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameEn: true,
      logo: true,
      coverImage: true,
      phone: true,
      addressAr: true,
      addressEn: true,
      workingHoursAr: true,
      workingHoursEn: true,
      instagram: true,
      facebook: true,
      createdAt: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      kioskSessionMinutes: true,
      geminiQuotaExceeded: true,
      geminiFailureReason: true,
      geminiLastChecked: true,
      geminiErrorCount: true,
    },
  })

  if (cafes.length === 0) {
    return (
      <div className="p-8 text-center font-bold text-amber-900">
        لا توجد مقاهي مسجلة حالياً. يرجى الذهاب للصفحة الرئيسية لإنشاء مقهى!
      </div>
    )
  }

  // Active cafe is strictly locked to session cafe ID
  const activeCafe = cafes[0]

  // 2. Fetch Orders for active cafe
  const orders = await db.order.findMany({
    where: { cafeId: activeCafe.id },
    orderBy: { id: 'desc' },
  })

  // 3. Fetch Active Menu Drinks for active cafe
  const drinks = await db.drink.findMany({
    where: { cafeId: activeCafe.id },
    orderBy: { nameAr: 'asc' },
  })

  // 4. Fetch AI Analyses Logs for active cafe
  const analyses = await db.analysis.findMany({
    where: { cafeId: activeCafe.id },
    orderBy: { createdAt: 'desc' },
    take: 100, // Grab up to 100 for analytics
  })

  // 5. Fetch events for active cafe
  const events = await db.event.findMany({
    where: { cafeId: activeCafe.id },
    orderBy: { createdAt: 'desc' },
  })

  // 6. Fetch Gemini Health Logs (last 20 logs)
  const healthLogs = await ((db as any).geminiHealthLog.findMany)({
    where: { cafeId: activeCafe.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  // 7. Fetch billing cycle start via raw SQL (bypasses stale Prisma CafeSelect types)
  const billingRows = await db.$queryRaw<Array<{ currentBillingCycleStart: Date | null }>>`
    SELECT "currentBillingCycleStart" FROM "Cafe" WHERE id = ${activeCafe.id}
  `
  const cycleStart = billingRows[0]?.currentBillingCycleStart
    ? new Date(billingRows[0].currentBillingCycleStart)
    : new Date(activeCafe.createdAt)

  // Count analyses in the current billing cycle
  const cycleAnalysesCount = await db.analysis.count({
    where: {
      cafeId: activeCafe.id,
      createdAt: { gte: cycleStart },
    },
  })

  return (
    <DashboardClient
      orders={orders}
      drinks={drinks}
      analyses={analyses}
      settings={activeCafe}
      cafes={cafes}
      events={events}
      healthLogs={healthLogs}
      cycleAnalysesCount={cycleAnalysesCount}
    />
  )
}
