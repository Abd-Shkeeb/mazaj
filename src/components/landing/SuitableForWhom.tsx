'use client'

import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'

export default function SuitableForWhom() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const items = [
    {
      icon: '☕',
      titleAr: 'المقاهي الصغيرة',
      titleEn: 'Small Cafes',
      descAr: 'حل بسيط وسريع لتحسين تجربة العملاء وزيادة الطلبات.',
      descEn: 'Simple and fast solution to improve customer satisfaction and increase orders.',
    },
    {
      icon: '🏪',
      titleAr: 'المقاهي المتوسطة',
      titleEn: 'Medium Cafes',
      descAr: 'إدارة أفضل للمشروبات وتتبع تفاعل الزبائن.',
      descEn: 'Better menu catalog management and tracking customer interactions.',
    },
    {
      icon: '🏢',
      titleAr: 'سلاسل المقاهي',
      titleEn: 'Cafe Chains',
      descAr: 'لوحات تحكم متقدمة وإدارة متعددة الفروع.',
      descEn: 'Advanced central control consoles and multi-branch management.',
    },
    {
      icon: '🎯',
      titleAr: 'الفعاليات والمعارض',
      titleEn: 'Events & Exhibitions',
      descAr: 'تجربة تفاعلية سريعة دون الحاجة إلى تطبيقات أو أجهزة خاصة.',
      descEn: 'A fast interactive experience with no custom apps or special hardware needed.',
    },
  ]

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full border-t border-[#3E2723]/10">
      <motion.div
        className="text-center mb-12 space-y-3"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase tracking-wider">
          {isAr ? 'لمن تم تصميم مزاج؟' : 'Who is Mazaj for?'}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#3E2723] tracking-tight">
          {isAr ? 'مناسب لمن؟' : 'Who is it for?'}
        </h2>
        <p className="text-[#5D4037]/80 font-bold text-sm max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'سواء كنت تدير مقهى صغيراً أو سلسلة فروع، تم تصميم مزاج ليتكيف مع مختلف أحجام الأعمال.'
            : 'Whether you run a small coffee shop or a multi-branch chain, Mazaj is designed to adapt to all business sizes.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[#5D4037]/10 space-y-4 shadow-sm hover:shadow-md transition-all text-right rtl:text-right ltr:text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#3E2723]/5 flex items-center justify-center text-2xl">
              {item.icon}
            </div>
            <h3 className="text-lg font-black text-[#3E2723]">
              {isAr ? item.titleAr : item.titleEn}
            </h3>
            <p className="text-xs text-[#5D4037]/80 font-semibold leading-relaxed">
              {isAr ? item.descAr : item.descEn}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
