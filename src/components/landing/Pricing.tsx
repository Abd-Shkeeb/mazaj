'use client'

import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'

interface PricingProps {
  setActiveForm: (form: 'register' | 'login' | null) => void
}

export default function Pricing({ setActiveForm }: PricingProps) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const plans = [
    {
      id: 'trial',
      badge: isAr ? '🆓 تجربة مجانية' : '🆓 Free Trial',
      badgeClass: 'text-emerald-700 bg-emerald-50/80 border border-emerald-100/50',
      title: isAr ? '30 يوماً مجاناً' : '30 Days Free',
      price: null,
      description: isAr
        ? 'بدون التزامات أو إدخال بطاقات دفع.'
        : 'No commitments or credit cards required.',
      features: [
        isAr ? '30 يوم مجاناً' : '30 days free',
        isAr ? 'جميع مزايا الباقة الاحترافية' : 'All Pro features',
        isAr ? 'بدون بطاقة مصرفية' : 'No credit card required',
      ],
      buttonText: isAr ? 'جرب الآن' : 'Try Now',
      buttonAction: 'register',
      isPopular: false,
      isDark: false,
    },
    {
      id: 'lite',
      badge: isAr ? '🌱 لايت' : '🌱 Lite',
      badgeClass: 'text-teal-800 bg-teal-50/80 border border-teal-100/50',
      price: isAr ? '39,000 د.ع' : '39,000 IQD',
      period: isAr ? 'شهرياً' : 'monthly',
      description: isAr ? 'للمقاهي الصغيرة جداً والأكشاك.' : 'For tiny coffee stands & kiosks.',
      features: [
        isAr ? 'حتى 10 مشروب' : 'Up to 10 drinks',
        isAr ? 'مستخدم واحد' : '1 user',
        isAr ? 'QR Code خاص' : 'Unique QR Code',
        isAr ? 'إحصائيات أساسية' : 'Basic analytics',
      ],
      buttonText: isAr ? 'تواصل معنا' : 'Contact Us',
      buttonAction: 'https://wa.me/9647714289802',
      isPopular: false,
      isDark: false,
    },
    {
      id: 'standard',
      badge: isAr ? '⭐ ستاندرد' : '⭐ Standard',
      badgeClass: 'text-amber-200 bg-[#FAF8F5]/10 border border-[#FAF8F5]/10',
      price: isAr ? '69,000 د.ع' : '69,000 IQD',
      period: isAr ? 'شهرياً' : 'monthly',
      description: isAr ? 'للمقاهي الناشئة والمتوسطة.' : 'For boutique and growing cafes.',
      features: [
        isAr ? 'حتى 30 مشروب' : 'Up to 30 drinks',
        isAr ? 'حتى 3 مستخدمين' : 'Up to 3 users',
        isAr ? 'تحليلات المزاج' : 'Mood analytics',
        isAr ? 'تقارير المبيعات' : 'Sales reports',
      ],
      buttonText: isAr ? 'تواصل معنا' : 'Contact Us',
      buttonAction: 'https://wa.me/9647714289802',
      isPopular: true,
      isDark: true,
    },
    {
      id: 'pro',
      badge: isAr ? '🚀 برو' : '🚀 Pro',
      badgeClass: 'text-amber-800 bg-amber-50/80 border border-amber-100/50',
      price: isAr ? '119,000 د.ع' : '119,000 IQD',
      period: isAr ? 'شهرياً' : 'monthly',
      description: isAr
        ? 'الباقة المتكاملة لزيادة المبيعات.'
        : 'Perfect to scale sales and analysis.',
      features: [
        isAr ? 'مشروبات غير محدودة' : 'Unlimited drinks',
        isAr ? 'مستخدمون غير محدودين' : 'Unlimited users',
        isAr ? 'تقارير وتحليلات متقدمة' : 'Advanced reports & analytics',
        isAr ? 'دعم أولوية' : 'Priority support',
      ],
      buttonText: isAr ? 'تواصل معنا' : 'Contact Us',
      buttonAction: 'https://wa.me/9647714289802',
      isPopular: false,
      isDark: false,
    },
    {
      id: 'enterprise',
      badge: isAr ? '🏢 الشركات' : '🏢 Enterprise',
      badgeClass: 'text-purple-700 bg-purple-50/80 border border-purple-100/50',
      title: isAr ? 'تواصل معنا' : 'Contact Us',
      price: null,
      description: isAr
        ? 'للمقاهي ذات الفروع المتعددة والشركات.'
        : 'For multi-branch & large chains.',
      features: [
        isAr ? 'فروع متعددة' : 'Multi-branch',
        isAr ? 'صلاحيات متعددة' : 'Multiple permissions',
        isAr ? 'لوحة تحكم مركزية' : 'Central dashboard',
        isAr ? 'تخصيصات خاصة' : 'Special customizations',
        isAr ? 'دعم مخصص' : 'Dedicated support',
      ],
      buttonText: isAr ? 'تواصل معنا' : 'Contact Support',
      buttonAction: 'mailto:support@mazaj.app',
      isPopular: false,
      isDark: false,
    },
  ]

  return (
    <section className="relative z-10 max-w-7xl xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full overflow-hidden">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-[#3E2723] tracking-tight">
            {isAr ? 'اختر الباقة المناسبة لمقهاك' : 'Choose the right package for your cafe'}
          </h2>
          <p className="text-[#5D4037]/75 font-semibold text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            {isAr
              ? 'ابدأ مجاناً لمدة 30 يوماً ثم اختر الباقة المناسبة لنمو أعمالك.'
              : 'Start free for 30 days, then choose the right package for your business growth.'}
          </p>
          <p className="text-[11px] text-[#3E2723]/60 font-black mt-2 uppercase tracking-wider">
            {isAr
              ? '🔒 لا توجد عقود طويلة أو رسوم خفية.'
              : '🔒 No long-term contracts or hidden fees.'}
          </p>
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
      >
        {plans.map(plan => (
          <motion.div
            key={plan.id}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
            }}
            whileHover={{
              y: -8,
              transition: { duration: 0.25, ease: 'easeOut' },
            }}
            className={`p-7 rounded-3xl border flex flex-col justify-between relative transition-all duration-300 min-h-[460px] ${plan.isPopular ? 'md:scale-[1.10] ring-4 ring-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.35)] lg:-translate-y-3 z-10' : ''} ${
              plan.isDark
                ? 'bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-white border-[#3E2723] shadow-[0_15px_45px_rgba(62,39,37,0.18)]'
                : 'bg-white/80 backdrop-blur-md border-[#5D4037]/10 text-gray-800 shadow-[0_10px_35px_rgba(62,39,37,0.03)] hover:shadow-[0_20px_45px_rgba(62,39,37,0.08)]'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-[#3E2723] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-amber-300/30">
                {isAr ? '🏆 الأكثر اختياراً' : '🏆 Most Popular'}
              </div>
            )}

            <div>
              <span
                className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full ${plan.badgeClass}`}
              >
                {plan.badge}
              </span>

              {plan.price ? (
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-black ${plan.isDark ? 'text-white' : 'text-[#2D2D2D]'}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-xs font-bold ${plan.isDark ? 'text-[#FAF8F5]/70' : 'text-gray-500'}`}
                  >
                    / {plan.period}
                  </span>
                </div>
              ) : (
                <h3
                  className={`text-xl font-black mt-5 ${plan.isDark ? 'text-white' : 'text-[#2D2D2D]'}`}
                >
                  {plan.title}
                </h3>
              )}

              <p
                className={`text-xs font-medium mt-2 leading-relaxed ${plan.isDark ? 'text-[#EAD9CB]' : 'text-gray-500'}`}
              >
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3.5 text-xs font-semibold">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                        plan.isDark
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      ✓
                    </span>
                    <span className={plan.isDark ? 'text-[#F5E6D3]/90' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.buttonAction === 'register' ? (
              <button
                onClick={() => setActiveForm('register')}
                className={`w-full mt-8 py-3 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer text-center block hover-lift active:scale-[0.98] ${
                  plan.isDark
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3E2723] shadow-md shadow-amber-900/10'
                    : 'bg-[#3E2723] hover:bg-[#2D1B18] text-[#F5E6D3] shadow-sm'
                }`}
              >
                {plan.buttonText}
              </button>
            ) : (
              <a
                href={plan.buttonAction}
                className={`w-full mt-8 py-3 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer text-center block hover-lift active:scale-[0.98] ${
                  plan.isDark
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3E2723] shadow-md shadow-amber-900/10'
                    : 'bg-[#3E2723]/5 hover:bg-[#3E2723]/10 text-[#3E2723] shadow-sm'
                }`}
              >
                {plan.buttonText}
              </a>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
