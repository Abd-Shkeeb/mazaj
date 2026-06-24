import db from '@/lib/db'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/routing'
import Navigation from '@/components/Navigation'
import { Sparkles, Coffee, MapPin, MessageSquare, Star } from 'lucide-react'

interface AIResult {
  moodNameAr: string
  moodNameEn: string
  suitableDrinkAr: string
  suitableDrinkEn: string
  drinkDescriptionAr: string
  drinkDescriptionEn: string
  energyLevel: number
  sweetnessLevel: number
  whyMatchesAr: string
  whyMatchesEn: string
  foodPairingAr: string
  foodPairingEn: string
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params

  const analysis = await db.analysis.findUnique({
    where: { id },
    include: { cafe: true },
  })

  if (!analysis || !analysis.cafe) {
    notFound()
  }

  const result: AIResult = JSON.parse(analysis.aiResult)
  const isAr = locale === 'ar'

  const moodName = isAr ? result.moodNameAr : result.moodNameEn
  const drinkName = isAr ? result.suitableDrinkAr : result.suitableDrinkEn
  const drinkDesc = isAr ? result.drinkDescriptionAr : result.drinkDescriptionEn
  const whyMatches = isAr ? result.whyMatchesAr : result.whyMatchesEn
  const foodPairing = isAr ? result.foodPairingAr : result.foodPairingEn

  return (
    <>
      <Navigation />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-[#5D4037] to-[#3E2723] rounded-3xl p-8 text-center text-[#F5E6D3] shadow-xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white blur-xl" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex p-3 rounded-2xl bg-white/10 mb-4 shadow-inner">
              <Sparkles className="h-8 w-8 text-amber-300 animate-pulse" />
            </div>
            <p className="text-xs uppercase tracking-widest font-extrabold text-[#F5E6D3]/60 mb-1">
              {isAr ? 'المزاج المكتشف' : 'DETECTED MOOD'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black mb-3">{moodName}</h1>
            <p className="text-sm font-semibold max-w-md mx-auto text-[#F5E6D3]/80">
              &ldquo;{analysis.userMood}&rdquo;
            </p>
          </div>
        </div>

        {/* Suggestion & Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-7.5 rounded-3xl border border-[#5D4037]/5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#5D4037]/5 text-[#5D4037]">
                  <Coffee className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#6D6D6D] uppercase tracking-wider">
                    {isAr ? 'المشروب المقترح' : 'SUGGESTED DRINK'}
                  </h3>
                  <h2 className="text-2xl font-black text-[#2D2D2D] mt-0.5">{drinkName}</h2>
                </div>
              </div>

              <p className="text-base text-[#6D6D6D] leading-relaxed mb-6 font-medium">
                {drinkDesc}
              </p>

              <div className="border-t border-[#5D4037]/10 pt-5">
                <h4 className="text-sm font-extrabold text-[#5D4037] mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    {isAr ? 'لماذا يناسب هذا المشروب مزاجك؟' : 'Why this matches your mood?'}
                  </span>
                </h4>
                <p className="text-sm text-[#6D6D6D] leading-relaxed">{whyMatches}</p>
              </div>
            </div>

            {/* Food Pairing card */}
            <div className="bg-[#F5E6D3]/40 p-6 rounded-3xl border border-[#5D4037]/10 shadow-inner flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="text-3xl">🍰</div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#5D4037]">
                    {isAr ? 'مقترح جانبي لذيذ' : 'Delicious Food Pairing'}
                  </h4>
                  <p className="text-sm text-[#6D6D6D] mt-0.5 font-bold">{foodPairing}</p>
                </div>
              </div>
              <span className="text-[#5D4037] font-bold text-xs uppercase bg-[#5D4037]/10 px-3 py-1.5 rounded-full">
                {isAr ? 'جربه معاً' : 'Pair Together'}
              </span>
            </div>
          </div>

          {/* Stats & Gauges Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#5D4037]/5 shadow-sm text-center">
              <h3 className="text-xs font-black text-[#6D6D6D] tracking-widest uppercase mb-5">
                {isAr ? 'مستويات المشروب' : 'BEVERAGE LEVEL'}
              </h3>

              {/* Energy Level Progress */}
              <div className="mb-6 text-left rtl:text-right">
                <div className="flex justify-between text-sm font-bold text-[#2D2D2D] mb-1.5">
                  <span>{isAr ? '⚡ نسبة الطاقة' : '⚡ Energy Level'}</span>
                  <span>{result.energyLevel}%</span>
                </div>
                <div className="w-full bg-[#FAF8F5] h-3 rounded-full overflow-hidden border border-[#5D4037]/10 shadow-inner">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-1000 shadow-md"
                    style={{ width: `${result.energyLevel}%` }}
                  />
                </div>
              </div>

              {/* Sweetness Level Progress */}
              <div className="text-left rtl:text-right">
                <div className="flex justify-between text-sm font-bold text-[#2D2D2D] mb-1.5">
                  <span>{isAr ? '🍬 مستوى الحلاوة' : '🍬 Sweetness Level'}</span>
                  <span>{result.sweetnessLevel}%</span>
                </div>
                <div className="w-full bg-[#FAF8F5] h-3 rounded-full overflow-hidden border border-[#5D4037]/10 shadow-inner">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all duration-1000 shadow-md"
                    style={{ width: `${result.sweetnessLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* User Rating / Accuracy */}
            <div className="bg-white p-5 rounded-3xl border border-[#5D4037]/5 shadow-sm text-center">
              <h4 className="text-xs font-bold text-[#6D6D6D] uppercase mb-2">
                {isAr ? 'هل الاقتراح دقيق؟' : 'Was the suggestion accurate?'}
              </h4>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className="p-1 text-amber-200 hover:text-amber-500 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/${analysis.cafe.slug}`}
            className="flex-1 px-6 py-4.5 rounded-2xl bg-[#5D4037] text-[#F5E6D3] text-center font-bold hover:bg-[#3E2723] hover:scale-102 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <MapPin className="h-5 w-5" />
            <span>{isAr ? 'الذهاب إلى الكشك للطلب ☕' : 'Go to kiosk to order ☕'}</span>
          </Link>

          <Link
            href={`/${locale}/${analysis.cafe.slug}`}
            className="px-6 py-4.5 rounded-2xl bg-white border border-[#5D4037]/20 text-[#5D4037] text-center font-bold hover:bg-[#5D4037]/5 transition-all"
          >
            {isAr ? 'تجربة مزاج آخر 🤖' : 'Try another mood 🤖'}
          </Link>
        </div>
      </main>
    </>
  )
}
