'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X, Eye, EyeOff } from 'lucide-react'
import dynamic from 'next/dynamic'

const SideRays = dynamic(() => import('@/components/SideRays'), { ssr: false })

const demoStates = [
  {
    mood: '😊 سعيد',
    drink: '☕ آيس لاتيه كراميل',
    reason: 'مشروب منعش ومتوازن يناسب الأجواء الإيجابية.',
  },
  {
    mood: '😴 متعب',
    drink: '☕ دبل اسبريسو',
    reason: 'مناسب لزيادة النشاط والتركيز.',
  },
  {
    mood: '❤️ رومانسي',
    drink: '☕ موكا',
    reason: 'مذاق غني ولحظات دافئة.',
  },
]

interface HeroProps {
  activeForm: 'register' | 'login' | null
  setActiveForm: (form: 'register' | 'login' | null) => void
  isPending: boolean
  slug: string
  setSlug: (val: string) => void
  nameAr: string
  setNameAr: (val: string) => void
  nameEn: string
  setNameEn: (val: string) => void
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  loginEmail: string
  setLoginEmail: (val: string) => void
  loginPassword: string
  setLoginPassword: (val: string) => void
  errorMsg: string
  setErrorMsg: (val: string) => void
  successMsg: string
  setSuccessMsg: (val: string) => void
  handleRegister: (e: React.FormEvent) => void
  handleLoginRedirect: (e: React.FormEvent) => void
}

export default function Hero({
  activeForm,
  setActiveForm,
  isPending,
  slug,
  setSlug,
  nameAr,
  setNameAr,
  nameEn,
  setNameEn,
  email,
  setEmail,
  password,
  setPassword,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  errorMsg,
  setErrorMsg,
  successMsg,
  setSuccessMsg,
  handleRegister,
  handleLoginRedirect,
}: HeroProps) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const [showPassword, setShowPassword] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [heroDemoIndex, setHeroDemoIndex] = useState(0)
  const [demoScene, setDemoScene] = useState(0) // 0: Pick Mood, 1: AI Recommendation, 2: Click Send Order, 3: Success Msg

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoScene(prev => {
        if (prev === 3) {
          setHeroDemoIndex(dIdx => (dIdx + 1) % demoStates.length)
          return 0
        }
        return prev + 1
      })
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden animate-gradient-bg">
        <SideRays
          speed={0.4}
          rayColor1="#EAD9CB"
          rayColor2="#F2EAE4"
          intensity={0.35}
          spread={2.0}
          origin="top-right"
          tilt={3}
          saturation={0.3}
          blend={0.5}
          falloff={1.5}
          opacity={0.4}
        />
      </div>

      <motion.main
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 sm:pt-36 sm:pb-20 flex flex-col lg:flex-row items-center gap-12"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        <motion.div
          className="w-full lg:w-1/2 space-y-6 text-center lg:text-left rtl:lg:text-right"
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
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10 text-[#3E2723] text-xs font-black uppercase tracking-widest backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{isAr ? 'منصة ذكاء اصطناعي تفاعلية للمقاهي' : 'AI Cafe Assistant SaaS'}</span>
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#3E2723] leading-[1.35] sm:leading-[1.3] tracking-normal"
          >
            {isAr
              ? 'ساعد زبائنك على اختيار المشروب المناسب خلال ثوانٍ باستخدام الذكاء الاصطناعي'
              : 'Help your customers choose the right drink in seconds using AI'}
          </motion.h1>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#3E2723] text-xs font-bold leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-right rtl:text-right"
          >
            <span>
              {isAr
                ? '🚀 منصة عراقية ذكية مصممة خصيصاً للمقاهي الحديثة لتحسين تجربة الزبائن وزيادة التفاعل والمبيعات.'
                : '🚀 A smart Iraqi platform designed specifically for modern cafes to improve guest experience, engagement, and sales.'}
            </span>
          </motion.div>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="text-base sm:text-lg text-[#5D4037]/80 leading-relaxed font-semibold max-w-xl mx-auto lg:mx-0"
          >
            {isAr
              ? 'مزاج يساعد المقاهي على زيادة المبيعات وتحسين تجربة العملاء من خلال اقتراحات ذكية مبنية على مزاج الزبون.'
              : 'Mazaj helps cafes increase sales and improve customer experience through smart recommendations based on customer mood.'}
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-4 relative z-20"
          >
            <button
              onClick={() => setActiveForm('register')}
              className="px-8 py-4 bg-[#3E2723] hover:bg-[#2D1B18] text-[#F5E6D3] rounded-2xl font-black text-sm sm:text-base transition-all shadow-lg hover-lift cursor-pointer active:scale-95"
            >
              🚀 {isAr ? 'ابدأ مجاناً لمدة 30 يوماً' : 'Start Free for 30 Days'}
            </button>
            <a
              href="#simulator"
              aria-label={isAr ? 'شاهد محاكاة حية لكيفية عمل النظام' : 'See live interactive simulation of how the platform works'}
              className="px-8 py-4 bg-white/80 border border-[#3E2723]/10 hover:bg-[#FAF8F5] text-[#3E2723] rounded-2xl font-black text-sm sm:text-base transition-all shadow-sm hover-lift cursor-pointer text-center"
            >
              🔍 {isAr ? 'شاهد كيف يعمل' : 'See How it Works'}
            </a>
          </motion.div>

          {/* Core Trust Badges */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 text-xs font-black text-[#5D4037]/90"
          >
            <span className="flex items-center gap-1.5 bg-[#3E2723]/5 px-3 py-1.5 rounded-full">
              <Check className="h-4 w-4 text-emerald-600" />
              {isAr ? 'إعداد خلال دقائق' : 'Setup in minutes'}
            </span>
            <span className="flex items-center gap-1.5 bg-[#3E2723]/5 px-3 py-1.5 rounded-full">
              <Check className="h-4 w-4 text-emerald-600" />
              {isAr ? 'بدون أجهزة إضافية' : 'No extra hardware'}
            </span>
            <span className="flex items-center gap-1.5 bg-[#3E2723]/5 px-3 py-1.5 rounded-full">
              <Check className="h-4 w-4 text-emerald-600" />
              {isAr ? 'تجربة مجانية كاملة' : 'Full free trial'}
            </span>
          </motion.div>
        </motion.div>

        {/* Autoplay Interactive Mockup Card */}
        <motion.div
          id="hero-card-area"
          className="w-full lg:w-1/2 flex justify-center"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          <div className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-3xl p-8 border border-[#5D4037]/15 shadow-xl flex flex-col justify-between min-h-[440px] relative overflow-hidden transition-all duration-300">
            {activeForm ? (
              <div className="w-full flex flex-col justify-between h-full relative z-10">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setActiveForm(null)
                    setErrorMsg('')
                    setSuccessMsg('')
                  }}
                  className="absolute top-0 right-0 rtl:right-auto rtl:left-0 text-gray-400 hover:text-[#3E2723] transition-colors cursor-pointer z-20"
                >
                  <X className="h-5 w-5" />
                </button>

                {activeForm === 'register' ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-[#3E2723]/5 pb-3">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <h3 className="text-base font-black text-[#3E2723] rtl:text-right ltr:text-left">
                        {isAr ? 'تسجيل مقهى جديد' : 'Register Cafe'}
                      </h3>
                    </div>

                    <form
                      onSubmit={handleRegister}
                      className="space-y-3 text-right rtl:text-right ltr:text-left"
                    >
                      {errorMsg && (
                        <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl">
                          {errorMsg}
                        </div>
                      )}
                      {successMsg && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl">
                          {successMsg}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-black text-[#2D2D2D]">
                          {isAr ? 'معرف المقهى (الرابط)' : 'Cafe Slug (URL) *'}
                        </label>
                        <div className="flex items-center">
                          <span className="p-2.5 bg-gray-50 border border-r-0 rtl:border-r border-l border-gray-200 text-[#6D6D6D] text-[11px] font-bold rounded-l-xl rtl:rounded-l-none rtl:rounded-r-xl">
                            mazaj.app/
                          </span>
                          <input
                            type="text"
                            required
                            value={slug}
                            onChange={e =>
                              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                            }
                            placeholder="cafe-name"
                            className="flex-grow p-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E2723] text-xs font-semibold rounded-r-xl rtl:rounded-r-none rtl:rounded-l-xl bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                          <label className="text-[10px] font-black text-[#2D2D2D]">
                            {isAr ? 'الاسم (العربية)' : 'Name (Ar) *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={nameAr}
                            onChange={e => setNameAr(e.target.value)}
                            placeholder="مزاج الجادرية"
                            className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E2723] text-xs bg-transparent font-semibold"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[10px] font-black text-[#2D2D2D]">
                            {isAr ? 'الاسم (الإنجليزية)' : 'Name (En) *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={nameEn}
                            onChange={e => setNameEn(e.target.value)}
                            placeholder="Mazaj Jadriya"
                            className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E2723] text-xs bg-transparent font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-black text-[#2D2D2D]">
                          {isAr ? 'البريد الإلكتروني' : 'Email Address *'}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="owner@cafe.com"
                          className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E2723] text-xs bg-transparent font-semibold"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-black text-[#2D2D2D]">
                          {isAr ? 'كلمة المرور' : 'Password *'}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-2.5 ltr:pr-10 rtl:pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E2723] text-xs bg-transparent font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-[#3E2723]/50 hover:text-[#3E2723] transition-colors cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-[#3E2723] hover:bg-[#2D1B18] text-white rounded-xl text-xs font-black transition-colors cursor-pointer mt-2"
                      >
                        {isPending
                          ? isAr
                            ? 'جاري التحميل...'
                            : 'Loading...'
                          : isAr
                            ? 'بدء التجربة المجانية 🚀'
                            : 'Start Trial 🚀'}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveForm('login')
                            setErrorMsg('')
                            setSuccessMsg('')
                          }}
                          className="text-[10px] font-bold text-amber-800 hover:underline cursor-pointer"
                        >
                          {isAr
                            ? 'لديك حساب بالفعل؟ تسجيل الدخول'
                            : 'Already have an account? Login'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-[#3E2723]/5 pb-3">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <h3 className="text-base font-black text-[#3E2723] rtl:text-right ltr:text-left">
                        {isAr ? 'تسجيل الدخول للوحة التحكم' : 'Dashboard Login'}
                      </h3>
                    </div>

                    <form
                      onSubmit={handleLoginRedirect}
                      className="space-y-4 text-right rtl:text-right ltr:text-left"
                    >
                      {errorMsg && (
                        <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl">
                          {errorMsg}
                        </div>
                      )}
                      {successMsg && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl">
                          {successMsg}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#2D2D2D]">
                          {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="karrada@mazaj.app"
                          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E2723] text-xs bg-transparent font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#2D2D2D]">
                          {isAr ? 'كلمة المرور' : 'Password'}
                        </label>
                        <div className="relative">
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-3 ltr:pr-10 rtl:pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E2723] text-xs bg-transparent font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-[#3E2723]/50 hover:text-[#3E2723] transition-colors cursor-pointer"
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[9px] text-[#6D6D6D] font-semibold leading-relaxed">
                        {isAr
                          ? '💡 اضغط الزر أدناه مباشرة لتسجيل الدخول بالحساب التجريبي karrada@mazaj.app.'
                          : '💡 Click the button below directly to login with the default demo account karrada@mazaj.app.'}
                      </p>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3.5 bg-[#3E2723] hover:bg-[#2D1B18] text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                      >
                        {isPending
                          ? isAr
                            ? 'جاري التحميل...'
                            : 'Loading...'
                          : isAr
                            ? 'تسجيل الدخول 🚀'
                            : 'Login 🚀'}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveForm('register')
                            setErrorMsg('')
                            setSuccessMsg('')
                          }}
                          className="text-[10px] font-bold text-amber-800 hover:underline cursor-pointer"
                        >
                          {isAr ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'No account? Create one now'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-[#3E2723] text-[8px] font-black px-2.5 py-0.5 rounded-full z-20 uppercase tracking-widest shadow-sm">
                  {isAr ? '⚠️ بيانات تجريبية - Demo Data' : '⚠️ Demo Data'}
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-black text-[#3E2723] mb-5 flex items-center gap-2 border-b border-[#3E2723]/5 pb-3 justify-center">
                    <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                    <span>{isAr ? 'عرض تجريبي تفاعلي تلقائي' : 'Auto Play Interactive Demo'}</span>
                  </h3>

                  <div className="flex flex-col items-center gap-4 py-4 bg-[#FAF8F5]/80 rounded-2xl border border-[#3E2723]/5 relative overflow-hidden min-h-[270px] justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`autoplay-scene-${demoScene}-${heroDemoIndex}`}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.3 }}
                        className="w-full px-5 flex flex-col items-center text-center gap-3"
                      >
                        {demoScene === 0 && (
                          <div className="space-y-4 w-full">
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-wider">
                              {isAr ? 'الخطوة ١: اختيار المزاج' : 'Step 1: Choose Mood'}
                            </span>
                            <h3 className="text-xs font-black text-gray-500">
                              {isAr ? 'كيف تشعر اليوم?' : 'How do you feel today?'}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 max-w-[240px] mx-auto">
                              {['😊 سعيد', '😌 هادئ', '😴 متعب', '🤩 متحمس'].map((mood, idx) => {
                                const isHappy = mood.includes('سعيد')
                                return (
                                  <div
                                    key={idx}
                                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${isHappy
                                        ? 'bg-amber-500 text-white border-amber-500 scale-105 shadow-md ring-2 ring-amber-500/30'
                                        : 'bg-white text-gray-400 border-gray-100'
                                      }`}
                                  >
                                    {isHappy && isAr ? '😊 سعيد (مختار)' : mood}
                                  </div>
                                )
                              })}
                            </div>
                            <div className="w-5 h-5 bg-black/80 rounded-full border border-white absolute right-1/3 bottom-12 animate-ping pointer-events-none" />
                          </div>
                        )}

                        {demoScene === 1 && (
                          <div className="space-y-3 w-full flex flex-col items-center">
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                              {isAr ? 'الخطوة ٢: ترشيح المشروب' : 'Step 2: AI Recommendation'}
                            </span>
                            <div className="px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#3E2723] text-sm font-bold flex items-center gap-1.5 shadow-sm">
                              <span className="text-xs font-bold text-[#3E2723]/60">
                                {isAr ? 'حالة الزبون:' : 'Customer Mood:'}
                              </span>
                              <span className="font-black text-[#3E2723]">
                                {demoStates[heroDemoIndex].mood}
                              </span>
                            </div>
                            <div className="text-[#3E2723]/50 font-black text-lg animate-bounce">
                              ↓
                            </div>
                            <div className="px-5 py-2.5 rounded-2xl bg-[#3E2723] text-[#F5E6D3] text-sm font-black shadow-md flex items-center gap-2 border border-white/5">
                              <span className="text-[10px] uppercase font-bold text-amber-300">
                                {isAr ? 'الترشيح الذكي:' : 'AI Pick:'}
                              </span>
                              <span>{demoStates[heroDemoIndex].drink}</span>
                            </div>
                          </div>
                        )}

                        {demoScene === 2 && (
                          <div className="space-y-4 w-full flex flex-col items-center">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider">
                              {isAr ? 'الخطوة ٣: إرسال الطلب' : 'Step 3: Send Order'}
                            </span>
                            <div className="px-5 py-2.5 rounded-2xl bg-[#3E2723] text-[#F5E6D3] text-sm font-black shadow-sm border border-white/5 w-full max-w-[260px]">
                              <span>{demoStates[heroDemoIndex].drink}</span>
                            </div>
                            <button className="w-full max-w-[200px] py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-[#3E2723] rounded-xl text-xs font-black shadow-lg scale-105 border border-amber-300/30 flex items-center justify-center gap-1.5">
                              <span>🚀 {isAr ? 'تأكيد وإرسال الطلب' : 'Confirm & Send Order'}</span>
                            </button>
                            <div className="w-4 h-4 bg-black/80 rounded-full border border-white absolute right-1/2 bottom-5 animate-ping pointer-events-none" />
                          </div>
                        )}

                        {demoScene === 3 && (
                          <div className="space-y-3 w-full flex flex-col items-center py-4">
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                              {isAr ? 'الخطوة ٤: النجاح' : 'Step 4: Success'}
                            </span>
                            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg animate-bounce">
                              ✓
                            </div>
                            <h3 className="text-sm font-black text-emerald-600">
                              {isAr ? 'تم إرسال الطلب بنجاح! 🎉' : 'Order Sent Successfully! 🎉'}
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold max-w-[240px]">
                              {isAr
                                ? 'تم إرسال الطلب إلى لوحة تحكم الكاشير مباشرة.'
                                : 'Order was sent directly to the cashier dashboard.'}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#5D4037]/10 flex items-center justify-between text-[9px] font-black text-[#3E2723]/60 uppercase tracking-widest mt-4">
                  <span>{isAr ? 'محاكاة محرك مزاج الذكي' : 'Mazaj AI Vibe Engine'}</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>{isAr ? 'محاكاة حية' : 'LIVE DEMO'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.main>
    </div>
  )
}
