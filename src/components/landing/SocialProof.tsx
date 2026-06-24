'use client'

import { useLocale } from 'next-intl'

export default function SocialProof() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full border-t border-b border-[#3E2723]/10 bg-white/40 backdrop-blur-md rounded-3xl">
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase tracking-wider">
          {isAr ? '⚠️ بيانات تجريبية توضيحية' : '⚠️ Demonstrative Demo Data'}
        </div>
        <h2 className="text-3xl font-black text-[#3E2723] tracking-tight">
          {isAr ? 'ماذا يحقق مزاج للمقاهي؟' : 'What Mazaj Achieves for Cafes?'}
        </h2>
        <p className="text-xs sm:text-sm text-[#5D4037]/80 font-bold max-w-xl mx-auto">
          {isAr
            ? 'نتائج توضيحية لقياس أثر التجربة التفاعلية داخل المقاهي.'
            : 'Illustrative metrics measuring the impact of interactive experiences in cafes.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { metric: '☕ +18%', labelAr: 'زيادة متوسط الطلبات', labelEn: 'Average Order Increase' },
          {
            metric: '⚡ 5 ثوانٍ',
            labelAr: 'متوسط اختيار المشروب',
            labelEn: 'Average Drink Choice Time',
          },
          {
            metric: '📈 +27%',
            labelAr: 'زيادة تفاعل الزبائن',
            labelEn: 'Customer Engagement Rise',
          },
          { metric: '🎯 92%', labelAr: 'رضا المستخدمين', labelEn: 'User Satisfaction Rate' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/80 p-6 rounded-2xl border border-[#5D4037]/10 text-center space-y-2 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="text-2xl sm:text-3xl font-black text-[#3E2723]">{stat.metric}</div>
            <div className="text-xs font-bold text-gray-500">
              {isAr ? stat.labelAr : stat.labelEn}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
