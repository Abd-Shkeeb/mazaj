'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Coffee,
  BarChart3,
  TrendingUp,
  Clock,
  Brain,
  Smartphone,
  LayoutDashboard,
  QrCode,
} from 'lucide-react'

export default function Features() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const [featUserInteractive, setFeatUserInteractive] = useState(false)

  useEffect(() => {
    if (featUserInteractive) return
    const interval = setInterval(() => {
      setActiveFeatureIndex(prev => (prev + 1) % 8)
    }, 6000)
    return () => clearInterval(interval)
  }, [featUserInteractive])

  // Features section live dashboard simulation state
  const [featOrders, setFeatOrders] = useState(148)
  const [featScans, setFeatScans] = useState(312)
  const [featRevenue, setFeatRevenue] = useState(885000)
  const [featNotification, setFeatNotification] = useState<string | null>(null)
  const [featActivities, setFeatActivities] = useState<
    Array<{ id: number; text: string; time: string; type: 'order' | 'scan' }>
  >([
    {
      id: 1,
      text: isAr ? '🔔 طلب جديد: آيس لاتيه كراميل' : '🔔 New Order: Caramel Ice Latte',
      time: isAr ? 'منذ ثوانٍ' : 'seconds ago',
      type: 'order',
    },
    {
      id: 2,
      text: isAr ? '⚡ تم مسح QR جديد (طاولة 4)' : '⚡ New QR Scan (Table 4)',
      time: isAr ? 'منذ دقيقة' : '1m ago',
      type: 'scan',
    },
    {
      id: 3,
      text: isAr ? '🔔 طلب جديد: موكا بارد' : '🔔 New Order: Cold Mocha',
      time: isAr ? 'منذ دقيقتين' : '2m ago',
      type: 'order',
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatOrders(prev => prev + 1)
      setFeatScans(prev => prev + Math.floor(Math.random() * 2) + 1)
      const addedRev = [4000, 5000, 6000][Math.floor(Math.random() * 3)]
      setFeatRevenue(prev => prev + addedRev)

      const tables = [1, 2, 3, 4, 5, 6, 7, 8]
      const drinks = isAr
        ? ['☕ آيس لاتيه كراميل', '☕ دبل اسبريسو', '☕ سبانش لاتيه', '☕ كابتشينو', '☕ موكا بارد']
        : [
            '☕ Caramel Ice Latte',
            '☕ Double Espresso',
            '☕ Spanish Latte',
            '☕ Cappuccino',
            '☕ Cold Mocha',
          ]
      const randomTable = tables[Math.floor(Math.random() * tables.length)]
      const randomDrink = drinks[Math.floor(Math.random() * drinks.length)]

      const isScanEvent = Math.random() > 0.5
      let newActText = ''
      if (isScanEvent) {
        newActText = isAr
          ? `⚡ تم مسح QR جديد (طاولة ${randomTable})`
          : `⚡ New QR Scan (Table ${randomTable})`
      } else {
        newActText = isAr
          ? `🔔 طلب جديد: ${randomDrink.replace('☕ ', '')}`
          : `🔔 New Order: ${randomDrink.replace('☕ ', '')}`
      }

      setFeatNotification(
        isAr
          ? `🔔 طلب جديد: ${randomDrink} لطاولة ${randomTable}`
          : `🔔 New Order: ${randomDrink} for Table ${randomTable}`,
      )

      setFeatActivities(prev => [
        {
          id: Date.now(),
          text: newActText,
          time: isAr ? 'الآن' : 'Just now',
          type: isScanEvent ? 'scan' : 'order',
        },
        ...prev.slice(0, 2),
      ])

      setTimeout(() => {
        setFeatNotification(null)
      }, 3000)
    }, 5500)
    return () => clearInterval(interval)
  }, [isAr])

  const featuresList = [
    {
      titleAr: 'زيادة مبيعات المشروبات',
      titleEn: 'Boost Drink Sales',
      descAr: 'يشجع الزبائن على تجربة واكتشاف مشروبات جديدة.',
      descEn: 'Inspire guests to explore custom drinks.',
      icon: TrendingUp,
    },
    {
      titleAr: 'تقليل حيرة الزبائن',
      titleEn: 'Reduce Customer Hesitation',
      descAr: 'يسرع اتخاذ القرار لتقليل الطوابير والانتظار.',
      descEn: 'Speed up choice to reduce queues and wait times.',
      icon: Clock,
    },
    {
      titleAr: 'اقتراحات ذكية تماماً',
      titleEn: 'AI-Powered Recommendations',
      descAr: 'محرك ذكاء اصطناعي مخصص لقراءة مشاعر الزبون.',
      descEn: 'Smart engine tailored to decode guest vibes.',
      icon: Brain,
    },
    {
      titleAr: 'تجربة تفاعلية حديثة',
      titleEn: 'Modern Interactive UX',
      descAr: 'يمنح المقهى ميزة تكنولوجية حديثة لافتة للانتباه.',
      descEn: 'Gives the cafe a modern tech-forward vibe.',
      icon: Smartphone,
    },
    {
      titleAr: 'لوحة تحكم سهلة الاستخدام',
      titleEn: 'Easy Dashboard Console',
      descAr: 'إدارة المبيعات والطلبات الفورية بوضوح تام.',
      descEn: 'Manage sales and instant orders with clarity.',
      icon: LayoutDashboard,
    },
    {
      titleAr: 'إدارة المشروبات والصور بسهولة',
      titleEn: 'Catalog & Image Management',
      descAr: 'تحديث الأسعار والمخزون وإضافة الصور بلحظات.',
      descEn: 'Update prices, stock, and add images instantly.',
      icon: Coffee,
    },
    {
      titleAr: 'QR Code خاص لكل مقهى',
      titleEn: 'Unique QR Code',
      descAr: 'توليد الرموز تلقائياً وتوزيعها على الطاولات.',
      descEn: 'Generate codes automatically for table placement.',
      icon: QrCode,
    },
    {
      titleAr: 'تحليلات وتقارير متقدمة',
      titleEn: 'Advanced Analytics',
      descAr: 'تقارير يومية عن المزاجات الأكثر طلباً والمبيعات.',
      descEn: 'Daily reports on trending moods and overall sales.',
      icon: BarChart3,
    },
  ]

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full border-t border-[#3E2723]/10">
      <motion.div
        className="text-center mb-16 space-y-3"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isAr ? 'مزايا المنصة الكبرى' : 'Key Platform Features'}</span>
        </div>
        <h2 className="text-4xl font-black text-[#3E2723] tracking-tight sm:text-5xl">
          {isAr ? 'لماذا تختار مزاج لمقهـاك؟' : 'Why Choose Mazaj for Your Cafe?'}
        </h2>
        <p className="text-[#5D4037]/80 font-bold text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'اكتشف كيف يساهم مزاج في تحسين تجربة عملاء المقهى ومضاعفة مبيعات المشروبات وسرعة اتخاذ القرار.'
            : 'Discover how Mazaj optimizes cafe operations, boosts drink sales, and elevates the guest experience.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch min-h-[580px]">
        {/* LEFT COLUMN: 8 clickable features */}
        <motion.div
          className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
              },
            },
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {featuresList.map((feat, idx) => {
              const isActive = activeFeatureIndex === idx
              const IconComp = feat.icon
              return (
                <motion.button
                  key={idx}
                  type="button"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  onClick={() => {
                    setActiveFeatureIndex(idx)
                    setFeatUserInteractive(true)
                  }}
                  className={`w-full text-right rtl:text-right ltr:text-left p-4.5 rounded-2xl border transition-all duration-300 relative flex items-start gap-3.5 cursor-pointer overflow-hidden group ${
                    isActive
                      ? 'bg-white border-[#3E2723]/25 shadow-[0_12px_30px_-6px_rgba(93,64,55,0.12)] scale-[1.01]'
                      : 'bg-white/40 border-[#3E2723]/5 hover:bg-white/70 hover:border-[#3E2723]/10 shadow-sm'
                  }`}
                >
                  <div
                    className={`absolute top-0 bottom-0 right-0 rtl:right-0 ltr:left-0 w-1.5 transition-transform duration-300 ${
                      isActive ? 'bg-[#3E2723] scale-y-100' : 'bg-transparent scale-y-0'
                    }`}
                  />
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-[#3E2723] text-[#F5E6D3] shadow-md'
                        : 'bg-[#3E2723]/5 text-[#3E2723] group-hover:bg-[#3E2723]/10'
                    }`}
                  >
                    <IconComp className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-black text-[#3E2723] truncate">
                      {isAr ? feat.titleAr : feat.titleEn}
                    </h3>
                    <p className="text-[11px] text-[#6D6D6D] font-semibold leading-normal">
                      {isAr ? feat.descAr : feat.descEn}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Showcase Mockup Device */}
        <motion.div
          className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full max-w-[480px] bg-[#3E2723] rounded-3xl p-6 border-4 border-[#5D4037] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[480px] animate-pulse-glow">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#3E2723]/90 text-amber-300 border border-amber-300/20 text-[8px] font-black px-2.5 py-0.5 rounded-full z-30 uppercase tracking-widest shadow-sm">
              {isAr ? '⚠️ بيانات تجريبية - Demo Data' : '⚠️ Demo Data'}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-20 pointer-events-none" />

            <div className="flex justify-between items-center pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black text-white">
                  {isAr ? 'لوحة تحكم المقهى المباشرة' : 'Cafe Dashboard Live'}
                </h3>
              </div>
              <span className="text-[8px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                {isAr ? 'مستقر' : 'STABLE'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4 relative z-10">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[8px] text-[#FAF8F5]/50 block">
                  {isAr ? 'الطلبات اليوم' : 'Orders Today'}
                </span>
                <span className="text-base font-black text-white">{featOrders}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[8px] text-[#FAF8F5]/50 block">
                  {isAr ? 'المسح QR' : 'QR Scans'}
                </span>
                <span className="text-base font-black text-white">{featScans}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[8px] text-[#FAF8F5]/50 block">
                  {isAr ? 'الإيرادات د.ع' : 'Revenue'}
                </span>
                <span className="text-base font-black text-emerald-400">
                  {isAr
                    ? `${(featRevenue / 1000).toFixed(0)}k`
                    : `${(featRevenue / 1000).toFixed(0)}k`}
                </span>
              </div>
            </div>

            <div className="flex-grow space-y-3 relative z-10">
              <h4 className="text-[9px] font-black text-amber-300 uppercase tracking-widest">
                {isAr ? 'نشاط المقهى المباشر' : 'Live Activity Feed'}
              </h4>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {featActivities.map(act => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white/10 p-2.5 rounded-xl flex justify-between items-center text-[10px] text-white border border-white/5"
                    >
                      <span className="font-semibold">{act.text}</span>
                      <span className="text-[8px] text-[#FAF8F5]/40">{act.time}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {featNotification && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-emerald-600 text-white p-3 rounded-xl text-[10px] font-black text-center mt-3 shadow-lg border border-emerald-500 relative z-20"
                >
                  {featNotification}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
