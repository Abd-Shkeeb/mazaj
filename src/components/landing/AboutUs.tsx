'use client'

import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Coffee } from 'lucide-react'
import dynamic from 'next/dynamic'

const CoffeeShopAnimation = dynamic(() => import('@/components/CoffeeShopAnimation'), {
  ssr: false,
})

export default function AboutUs() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full border-t border-[#3E2723]/10">
      <motion.div
        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-[#5D4037]/10 shadow-lg hover:shadow-xl transition-all duration-300"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Animation */}
          <div className="md:col-span-5 flex justify-center order-2 md:order-1">
            <div className="w-full max-w-[280px] bg-[#FAF8F5] rounded-2xl p-4 border border-[#3E2723]/5 shadow-inner flex items-center justify-center">
              <CoffeeShopAnimation />
            </div>
          </div>

          {/* Right Column: Text & Badges */}
          <div className="md:col-span-7 space-y-5 text-right rtl:text-right ltr:text-left order-1 md:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase tracking-wider">
              <Coffee className="h-3.5 w-3.5" />
              <span>{isAr ? 'من نحن؟' : 'About Us'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#3E2723] leading-tight">
              {isAr ? 'مزاج لمستقبل المقاهي الذكية' : 'Mazaj for the Future of Smart Cafes'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5D4037]/90 font-bold leading-relaxed">
              {isAr
                ? 'مزاج منصة عراقية متخصصة في تقديم تجارب ذكية وتفاعلية للمقاهي باستخدام الذكاء الاصطناعي، لمساعدة الزبائن على اختيار المشروبات المناسبة وتحسين تجربة العملاء وزيادة المبيعات.'
                : 'Mazaj is an Iraqi platform specializing in providing smart and interactive experiences for cafes using AI, helping customers select suitable drinks, improving customer satisfaction, and boosting sales.'}
            </p>

            {/* Core Values / Features badges inside About Us */}
            <div className="flex flex-wrap gap-2.5 pt-2 justify-start rtl:justify-start ltr:justify-start font-black">
              <span className="px-3 py-1.5 bg-[#3E2723]/5 rounded-xl text-[10px] text-[#3E2723] border border-[#3E2723]/5">
                🤖 {isAr ? 'ذكاء اصطناعي تفاعلي' : 'Interactive AI'}
              </span>
              <span className="px-3 py-1.5 bg-[#3E2723]/5 rounded-xl text-[10px] text-[#3E2723] border border-[#3E2723]/5">
                🇮🇶 {isAr ? 'صنع في العراق' : 'Made in Iraq'}
              </span>
              <span className="px-3 py-1.5 bg-[#3E2723]/5 rounded-xl text-[10px] text-[#3E2723] border border-[#3E2723]/5">
                ⚡ {isAr ? 'زيادة المبيعات' : 'Boost Sales'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
