import db from '@/lib/db'
import KioskClient from '@/components/KioskClient'
import { notFound } from 'next/navigation'
import { verifyActiveSubscription } from '@/lib/subscription'
import { getSessionAction } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CafeKioskPage({
  params,
}: {
  params: Promise<{ locale: string; cafeSlug: string }>
}) {
  const { cafeSlug, locale } = await params
  const isAr = locale === 'ar'

  // Fetch Cafe by slug
  const cafe = await db.cafe.findUnique({
    where: { slug: cafeSlug.toLowerCase().trim() },
  })

  if (!cafe) {
    notFound()
  }

  const subStatus = await verifyActiveSubscription(cafe.id)
  const isExpired = subStatus === 'EXPIRED' || subStatus === 'SUSPENDED' || subStatus === 'CANCELLED'

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-4 py-12 relative overflow-hidden">
        {/* Background decorative blurry circles */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#3E2723]/5 rounded-full blur-3xl pointer-events-none select-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none select-none" />

        <div className="relative max-w-md w-full bg-white/80 backdrop-blur-md border border-[#3E2723]/10 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-350">
          {/* Logo container with warning/coffee lock icon */}
          <div className="w-20 h-20 bg-[#3E2723]/5 border border-[#3E2723]/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg
              className="h-10 w-10 text-[#3E2723]/60"
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

          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight">
              {isAr ? 'الكشك غير متاح حالياً' : 'Kiosk is currently unavailable'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-500 leading-relaxed">
              {isAr ? 'تم إيقاف الكشك مؤقتاً لانتهاء اشتراك المقهى.' : 'The kiosk has been temporarily deactivated due to the cafe\'s subscription expiration.'}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {cafe.nameEn} • {cafe.nameAr}
          </div>
        </div>
      </div>
    )
  }

  const drinksCount = await db.drink.count({
    where: { isAvailable: true, cafeId: cafe.id },
  })

  const availableDrinks = await db.drink.findMany({
    where: { cafeId: cafe.id, isAvailable: true },
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      price: true,
      image: true,
      description: true,
    },
    take: 6,
  })

  return <KioskClient cafe={cafe} drinksCount={drinksCount} availableDrinks={availableDrinks} />
}
