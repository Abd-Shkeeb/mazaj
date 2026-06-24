import Navigation from '@/components/Navigation'
import { Coffee, Heart, Sparkles } from 'lucide-react'

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isAr = locale === 'ar'

  return (
    <>
      <Navigation />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 rounded-2xl bg-[#5D4037]/5 text-[#5D4037] mb-4 shadow-inner">
            <Coffee className="h-10 w-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D2D2D]">
            {isAr ? 'من نحن' : 'About Us'}
          </h1>
          <div className="mt-2 w-16 h-1 bg-[#5D4037] mx-auto rounded-full" />
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#5D4037]/5 shadow-sm space-y-6 text-[#6D6D6D] leading-relaxed text-base sm:text-lg font-semibold">
          <p>
            {isAr
              ? 'مزاج - Mazaj هي منصة ذكية تدمج بين ثقافة القهوة المتميزة وتقنيات الذكاء الاصطناعي لتمنحك توصيات مشروبات تعبر عن مشاعرك وحالتك النفسية الحالية.'
              : 'Mazaj is an intelligent platform that merges premium coffee culture with artificial intelligence to offer drink recommendations reflecting your feelings and psychological state.'}
          </p>

          <p>
            {isAr
              ? 'نحن نؤمن بأن كل كوب قهوة أو مشروب له قصة ومناسبة، ونساعدك في الوصول لأفضل كوب قهوة في أقرب مقهى إليك بسهولة ويسر.'
              : 'We believe every cup of coffee or drink has a story and occasion, and we help you find the best cup of coffee in the closest café to you with ease.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#5D4037]/10">
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-amber-100 text-[#5D4037]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2D2D2D] mb-1">
                  {isAr ? 'رؤيتنا بالذكاء الاصطناعي' : 'Our AI Vision'}
                </h4>
                <p className="text-sm font-semibold">
                  {isAr
                    ? 'ربط التكنولوجيا المتقدمة بالأحاسيس اليومية لإضافة لمسة ممتعة لاختيار كوب قهوتك اليومي.'
                    : 'Connecting advanced tech to daily feelings to add a delightful touch to picking your daily cup.'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-rose-100 text-rose-800">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#2D2D2D] mb-1">
                  {isAr ? 'شغف القهوة' : 'Passion for Coffee'}
                </h4>
                <p className="text-sm font-semibold">
                  {isAr
                    ? 'دعم المقاهي المحلية ونشر ثقافة القهوة الفاخرة بطرق تفاعلية تناسب العصر الحديث.'
                    : 'Supporting local specialty cafés and spreading premium coffee culture interactively.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
