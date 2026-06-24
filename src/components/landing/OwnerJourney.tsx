'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

const nextSteps = [
  { num: '🚀', titleAr: 'إنشاء الحساب', titleEn: 'Create Account' },
  { num: '☕', titleAr: 'إضافة المشروبات', titleEn: 'Add Menu' },
  { num: '🖼️', titleAr: 'توليد QR Code', titleEn: 'Generate QR Code' },
  { num: '📥', titleAr: 'استقبل الطلبات', titleEn: 'Receive Orders' },
]

export default function OwnerJourney() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const [onboardStep, setOnboardStep] = useState(0)
  const [onboardUserInteractive, setOnboardUserInteractive] = useState(false)

  useEffect(() => {
    if (onboardUserInteractive) return
    const interval = setInterval(() => {
      setOnboardStep(prev => (prev + 1) % 4)
    }, 5500)
    return () => clearInterval(interval)
  }, [onboardUserInteractive])

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full border-t border-[#3E2723]/10">
      <motion.div
        className="text-center mb-12 space-y-3"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase tracking-wider">
          {isAr ? 'رحلة صاحب المقهى' : 'Cafe Owner Timeline'}
        </span>
        <h2 className="text-4xl font-black text-[#3E2723] tracking-tight sm:text-5xl">
          {isAr ? 'ماذا يحدث بعد تسجيل مقهاك؟' : 'Steps After Registering Your Cafe'}
        </h2>
        <p className="text-[#5D4037]/80 font-bold text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'رحلة سهلة وسريعة مكونة من 3 مراحل رئيسية لتفعيل نظام الذكاء الاصطناعي وبدء استقبال الطلبات.'
            : 'A simple 3-stage lifecycle to activate your AI kiosk and start receiving orders.'}
        </p>
      </motion.div>

      {/* DESKTOP TIMELINE VIEW */}
      <motion.div
        className="hidden lg:block space-y-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#3E2723]/10 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 right-0 h-1 bg-[#3E2723] -translate-y-1/2 z-0 origin-left transition-all duration-500"
            style={{
              width: `${(onboardStep / 3) * 100}%`,
            }}
          />

          <div className="relative z-10 flex justify-around items-center">
            {nextSteps.map((nStep, idx) => {
              const isActive = onboardStep === idx
              const isCompleted = idx < onboardStep
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setOnboardStep(idx)
                    setOnboardUserInteractive(true)
                  }}
                  className="flex flex-col items-center gap-3 focus:outline-none cursor-pointer group"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all duration-300 ${
                      isActive
                        ? 'bg-[#3E2723] text-[#F5E6D3] ring-4 ring-[#3E2723]/25 scale-110 shadow-lg'
                        : isCompleted
                          ? 'bg-[#5D4037] text-white'
                          : 'bg-white border-2 border-[#3E2723]/15 text-[#3E2723]/60 hover:border-[#3E2723]/40'
                    }`}
                  >
                    {isCompleted ? '✓' : nStep.num}
                  </div>
                  <span
                    className={`text-xs font-black transition-colors ${
                      isActive ? 'text-[#3E2723]' : 'text-[#5D4037]/60 group-hover:text-[#3E2723]'
                    }`}
                  >
                    {isAr ? nStep.titleAr : nStep.titleEn}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Detail Showcase Panel */}
        <div className="bg-white rounded-3xl p-8 border border-[#5D4037]/10 shadow-lg flex flex-col md:flex-row gap-8 items-center min-h-[300px]">
          <div className="w-full md:w-1/3 flex justify-center">
            <AnimatePresence mode="wait">
              {onboardStep === 0 && (
                <motion.div
                  key="reg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-[260px] bg-[#FAF8F5] p-5 rounded-2xl border border-[#3E2723]/10 space-y-3 shadow-inner"
                >
                  <span className="text-[9px] font-black text-[#3E2723] block text-center border-b pb-1.5 border-[#3E2723]/5">
                    {isAr ? 'بيانات المقهى الجديد' : 'New Cafe Register Form'}
                  </span>
                  <div className="space-y-1 text-right rtl:text-right">
                    <label className="text-[8px] font-bold text-gray-500 block">
                      {isAr ? 'اسم المقهى' : 'Cafe Name'}
                    </label>
                    <div className="h-8 w-full bg-white rounded-lg border border-[#3E2723]/15 flex items-center px-2.5 text-[10px] font-bold text-[#3E2723]">
                      {isAr ? 'كافيه مزاج الدافئ' : 'Warm Mazaj Cafe'}
                    </div>
                  </div>
                  <div className="space-y-1 text-right rtl:text-right">
                    <label className="text-[8px] font-bold text-gray-500 block">
                      {isAr ? 'الرابط المخصص' : 'Custom Slug URL'}
                    </label>
                    <div className="h-8 w-full bg-white rounded-lg border border-[#3E2723]/15 flex items-center px-2.5 text-[9px] font-bold text-amber-800">
                      mazaj.app/ar/warm-cafe
                    </div>
                  </div>
                  <div className="h-8 w-full bg-[#3E2723] rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm cursor-pointer mt-1">
                    <span>{isAr ? 'أنشئ حسابك مجاناً' : 'Create Cafe Account'}</span>
                  </div>
                </motion.div>
              )}

              {onboardStep === 1 && (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-[260px] bg-[#FAF8F5] p-5 rounded-2xl border border-[#3E2723]/10 space-y-3 shadow-inner"
                >
                  <span className="text-[9px] font-black text-[#3E2723] block text-center border-b pb-1.5 border-[#3E2723]/5">
                    {isAr ? 'إضافة مشروب جديد القائمة' : 'Add New Beverage'}
                  </span>
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-xl border border-amber-500/25">
                      ☕
                    </div>
                    <div className="flex-grow space-y-1 text-right rtl:text-right">
                      <label className="text-[8px] font-bold text-gray-500 block">
                        {isAr ? 'اسم المشروب' : 'Drink Name'}
                      </label>
                      <div className="h-7 w-full bg-white rounded border border-[#3E2723]/10 flex items-center px-2 text-[10px] font-bold text-[#3E2723]">
                        {isAr ? 'آيس لاتيه كراميل' : 'Caramel Ice Latte'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-right rtl:text-right">
                    <div className="w-1/2 space-y-1">
                      <label className="text-[8px] font-bold text-gray-500 block">
                        {isAr ? 'السعر' : 'Price'}
                      </label>
                      <div className="h-6 w-full bg-white rounded border border-[#3E2723]/10 flex items-center px-2 text-[9px] font-black">
                        6,000 د.ع
                      </div>
                    </div>
                    <div className="w-1/2 space-y-1">
                      <label className="text-[8px] font-bold text-gray-500 block">
                        {isAr ? 'الفئة' : 'Category'}
                      </label>
                      <div className="h-6 w-full bg-white rounded border border-[#3E2723]/10 flex items-center px-2 text-[9px] font-black text-amber-800">
                        {isAr ? 'قهوة باردة' : 'Cold Coffee'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-right rtl:text-right">
                    <label className="text-[8px] font-bold text-gray-500 block">
                      {isAr ? 'صورة المشروب' : 'Beverage Image'}
                    </label>
                    <div className="h-8 w-full bg-white rounded border border-[#3E2723]/10 flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400">
                      <span>📷 upload.png (240kb)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {onboardStep === 2 && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-[260px] bg-[#FAF8F5] p-5 rounded-2xl border border-[#3E2723]/10 space-y-3 shadow-inner flex flex-col items-center"
                >
                  <span className="text-[9px] font-black text-[#3E2723] block text-center border-b pb-1.5 border-[#3E2723]/5 w-full">
                    {isAr ? 'رمز QR جاهز للطباعة' : 'QR Code Ready to Print'}
                  </span>
                  <div className="w-24 h-24 border border-[#3E2723]/25 rounded-lg p-2 bg-white flex flex-col justify-between relative overflow-hidden shadow-sm">
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10B981] animate-scan" />
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border border-[#3E2723] bg-[#3E2723]/5" />
                      <div className="w-4 h-4 border border-[#3E2723] bg-[#3E2723]/5" />
                    </div>
                    <span className="text-[6px] font-black text-center text-[#3E2723] block">
                      MAZAJ QR
                    </span>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border border-[#3E2723] bg-[#3E2723]/5" />
                      <div className="w-2 h-2 bg-[#3E2723] self-end" />
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-amber-800 tracking-wider">
                    mazaj.app/ar/warm-cafe
                  </span>
                  <button className="w-full py-1.5 bg-[#3E2723] text-[#F5E6D3] rounded-lg text-[9px] font-black shadow-sm cursor-pointer">
                    📥 {isAr ? 'تحميل الرمز وجدول الطاولات' : 'Download QR Stand'}
                  </button>
                </motion.div>
              )}

              {onboardStep === 3 && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-[260px] bg-[#3E2723] p-4 rounded-2xl text-white space-y-3 shadow-lg"
                >
                  <div className="flex justify-between items-center text-[8px] font-black text-white/50 border-b border-white/10 pb-2">
                    <span>{isAr ? 'شاشة الكاشير المباشرة' : 'LIVE ORDERS TERMINAL'}</span>
                    <span className="text-emerald-400 animate-pulse">
                      ● {isAr ? 'مباشر' : 'LIVE'}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[140px] overflow-hidden text-[9px] font-bold text-right rtl:text-right">
                    <div className="bg-white/10 p-2.5 rounded-lg flex justify-between items-center border border-white/5">
                      <div className="space-y-0.5">
                        <div className="text-white">
                          {isAr ? '☕ آيس لاتيه كراميل' : '☕ Caramel Ice Latte'}
                        </div>
                        <div className="text-[7px] text-[#FAF8F5]/60">
                          {isAr ? 'طاولة 3 • استلام: 12:05' : 'Table 3 • Pickup: 12:05'}
                        </div>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[7px]">
                        {isAr ? 'قيد التحضير' : 'Preparing'}
                      </span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-lg flex justify-between items-center opacity-70">
                      <div className="space-y-0.5">
                        <div className="text-white">
                          {isAr ? '☕ دبل اسبريسو' : '☕ Double Espresso'}
                        </div>
                        <div className="text-[7px] text-[#FAF8F5]/50">
                          {isAr ? 'طاولة 1 • استلام: 12:02' : 'Table 1 • Pickup: 12:02'}
                        </div>
                      </div>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[7px]">
                        {isAr ? 'جاهز للاستلام' : 'Ready'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-grow space-y-4 text-right rtl:text-right ltr:text-left overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={onboardStep}
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -20 : 20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3E2723]/5 text-[#3E2723] text-xs font-black">
                  {isAr ? `المرحلة ${onboardStep + 1} من 4` : `Phase ${onboardStep + 1} of 4`}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#3E2723]">
                  {isAr ? nextSteps[onboardStep].titleAr : nextSteps[onboardStep].titleEn}
                </h3>
                <p className="text-sm sm:text-base text-[#5D4037]/80 font-semibold leading-relaxed">
                  {onboardStep === 0 &&
                    (isAr
                      ? 'عرض نموذج تسجيل مقهى جديد وإدخال اسم مقهاك واختيار الرابط الخاص به مجاناً.'
                      : 'Show the new cafe registration form, type your cafe name, and pick its custom slug url.')}
                  {onboardStep === 1 &&
                    (isAr
                      ? 'عرض لوحة إضافة المشروبات وإضافة الاسم والسعر وصورة المشروب لبناء قائمتك بلحظات.'
                      : 'Add your catalog drinks, prices, and upload icons to build your menu catalog in moments.')}
                  {onboardStep === 2 &&
                    (isAr
                      ? 'توليد الـ QR Code تلقائياً لكل مقهى بلمسة واحدة لطباعته ووضعه على الطاولات.'
                      : 'Retrieve your unique generated QR Code automatically for table or stand placement.')}
                  {onboardStep === 3 &&
                    (isAr
                      ? 'استقبل طلبات الزبائن مباشرة من الصالة ومتابعة تفاعلهم مع الذكاء الاصطناعي بشكل حي.'
                      : 'Receive customer orders in real-time straight to your live dashboard panel feed.')}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* MOBILE TIMELINE VIEW */}
      <motion.div
        className="block lg:hidden space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {nextSteps.map((nStep, idx) => (
          <motion.div
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
            className="bg-white p-5 rounded-2xl border border-[#5D4037]/10 space-y-2"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#3E2723] text-white flex items-center justify-center text-xs font-black">
                {idx + 1}
              </span>
              <h4 className="text-sm font-black text-[#3E2723]">
                {isAr ? nStep.titleAr : nStep.titleEn}
              </h4>
            </div>
            <p className="text-xs text-[#6D6D6D] font-bold leading-relaxed rtl:pr-10 ltr:pl-10 text-right rtl:text-right ltr:text-left">
              {idx === 0 &&
                (isAr
                  ? '🚀 نموذج تسجيل مقهى مع إدخال اسم المقهى والرابط الخاص.'
                  : '🚀 Register your cafe name and custom URL slug.')}
              {idx === 1 &&
                (isAr
                  ? '☕ إضافة مشروباتك وتعديل الأسعار وإرفاق الصور.'
                  : '☕ Add your drinks catalog, set prices, and attach images.')}
              {idx === 2 &&
                (isAr
                  ? '🖼️ توليد رمز QR Code خاص وتلقائي لكل مقهى بلمسة واحدة.'
                  : '🖼️ Unique generated QR Code generated automatically for stands.')}
              {idx === 3 &&
                (isAr
                  ? '📥 استقبال طلبات الزبائن مباشرة بلوحة التحكم بشكل حي.'
                  : '📥 Live dashboard monitor feed shows orders coming in live.')}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Info Box after timeline */}
      <motion.div
        className="mt-12 p-5 bg-[#3E2723]/5 border border-[#3E2723]/10 rounded-2xl text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs sm:text-sm font-black text-[#3E2723]">
          {isAr
            ? '✨ بعد ذلك يبدأ الزبائن باستخدام مزاج واختيار المشروبات المناسبة لهم تلقائياً.'
            : '✨ Afterwards, customers start using Mazaj and picking suitable drinks automatically.'}
        </p>
      </motion.div>
    </section>
  )
}
