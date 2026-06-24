'use client'

import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const CoffeeShopAnimation = dynamic(() => import('@/components/CoffeeShopAnimation'), {
  ssr: false,
})

interface CTAProps {
  setActiveForm: (form: 'register' | 'login' | null) => void
}

export default function CTA({ setActiveForm }: CTAProps) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full border-t border-[#3E2723]/10">
      <motion.div
        className="bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-[#F5E6D3] rounded-3xl p-10 text-center space-y-6 shadow-xl border border-[#3E2723] relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Coffee Shop Animations */}
        <div className="absolute -right-12 -bottom-16 opacity-10 md:opacity-15 pointer-events-none transform scale-110 md:scale-125 z-0 select-none">
          <CoffeeShopAnimation />
        </div>
        <div className="absolute -left-12 -top-16 opacity-5 md:opacity-10 pointer-events-none transform scale-90 rotate-12 z-0 select-none">
          <CoffeeShopAnimation />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight relative z-10">
          {isAr
            ? 'جاهز لتحويل حيرة الزبائن إلى مبيعات؟'
            : 'Ready to turn customer hesitation into sales?'}
        </h2>
        <p className="text-sm sm:text-base text-[#FAF8F5]/80 font-bold max-w-2xl mx-auto relative z-10">
          {isAr
            ? 'ابدأ مجاناً خلال أقل من 3 دقائق، ولا تحتاج إلى أي أجهزة إضافية أو خبرة تقنية. أنشئ مقهاك وابدأ استقبال الطلبات مباشرة.'
            : 'Start for free in less than 3 minutes, with no extra hardware or tech experience required. Set up your cafe and start taking orders instantly.'}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs sm:text-sm font-black text-[#FAF8F5]/90 pt-2 relative z-10">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-400 font-bold">✓</span>{' '}
            {isAr ? 'لا تحتاج بطاقة دفع' : 'No credit card required'}
          </span>
          <span className="text-amber-500/50 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-400 font-bold">✓</span>{' '}
            {isAr ? 'إعداد خلال ٣ دقائق' : '3-minute setup'}
          </span>
          <span className="text-amber-500/50 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-400 font-bold">✓</span>{' '}
            {isAr ? 'إلغاء في أي وقت' : 'Cancel anytime'}
          </span>
        </div>
        <div className="pt-4 relative z-10">
          <button
            onClick={() => setActiveForm('register')}
            className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3E2723] rounded-2xl font-black text-sm sm:text-base transition-all shadow-lg hover-lift cursor-pointer active:scale-95 animate-bounce-slow"
          >
            {isAr ? '🚀 ابدأ تجربتك المجانية الآن' : '🚀 Start Your Free Trial Now'}
          </button>
        </div>
      </motion.div>
    </section>
  )
}
