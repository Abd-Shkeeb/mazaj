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
  if (subStatus !== 'ACTIVE' && subStatus !== 'TRIAL') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F5] px-4 py-12 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#FF6B6B]/10 rounded-full blur-3xl pointer-events-none select-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#FFC107]/10 rounded-full blur-3xl pointer-events-none select-none" />

        <div className="relative max-w-md w-full bg-white/90 backdrop-blur-md border border-[#FF6B6B]/10 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-350">
          <div className="w-20 h-20 bg-[#FF6B6B]/5 border border-[#FF6B6B]/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg
              className="h-10 w-10 text-[#FF6B6B]/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FF6B6B] tracking-tight">
            {isAr ? 'لوحة التحكم غير متاحة' : 'Dashboard Unavailable'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-600 leading-relaxed">
            {isAr
              ? 'تم إيقاف لوحة التحكم بسبب انتهاء الاشتراك.'
              : "The dashboard has been deactivated due to subscription expiration."}
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

  return (
    <DashboardClient
      orders={orders}
      drinks={drinks}
      analyses={analyses}
      settings={activeCafe}
      cafes={cafes}
      events={events}
      healthLogs={healthLogs}
    />
  )
}
