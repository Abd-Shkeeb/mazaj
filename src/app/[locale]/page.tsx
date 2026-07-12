'use client'

import { useState, useTransition, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import { registerCafeAction } from '@/app/actions/dashboard'
import { loginAction } from '@/app/actions/auth'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

import Hero from '@/components/landing/Hero'
const SocialProof = dynamic(() => import('@/components/landing/SocialProof'))
const Demo = dynamic(() => import('@/components/landing/Demo'), { ssr: false })
const Features = dynamic(() => import('@/components/landing/Features'), { ssr: false })
const OwnerJourney = dynamic(() => import('@/components/landing/OwnerJourney'))
const SuitableForWhom = dynamic(() => import('@/components/landing/SuitableForWhom'))
const Pricing = dynamic(() => import('@/components/landing/Pricing'))
const FAQ = dynamic(() => import('@/components/landing/FAQ'))
const CTA = dynamic(() => import('@/components/landing/CTA'))
const AboutUs = dynamic(() => import('@/components/landing/AboutUs'))

// SideRays uses WebGL, keep it dynamic (client-side only)
const SideRays = dynamic(() => import('@/components/SideRays'), { ssr: false })

export default function SaaSLandingPage() {
  const tc = useTranslations('common')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const router = useRouter()

  const [activeForm, setActiveForm] = useState<'register' | 'login' | null>(null)
  const [isPending, startTransition] = useTransition()

  // Reset modal tab to demo whenever the modal is triggered
  useEffect(() => {
    if (activeForm) {
      const cardEl = document.getElementById('hero-card-area')
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [activeForm])

  // Registration & Login states
  const [slug, setSlug] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!slug || !nameAr || !nameEn || !email || !password) {
      setErrorMsg(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields')
      return
    }

    startTransition(async () => {
      try {
        const res = await registerCafeAction({
          slug,
          nameAr,
          nameEn,
          email,
          password,
        })
        if (res.success && res.cafe) {
          const loginRes = await loginAction({ email, password })
          if (loginRes.success) {
            setSuccessMsg(
              isAr
                ? `تم تسجيل مقهاك بنجاح! رابط الكشك الخاص بك هو: /${locale}/${res.cafe.slug}`
                : `Registered successfully! Your kiosk URL is: /${locale}/${res.cafe.slug}`,
            )
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
          } else {
            setErrorMsg(loginRes.error || (isAr ? 'حدث خطأ أثناء تسجيل الدخول' : 'Error occurred during login'))
          }
        } else {
          setErrorMsg(res.error || (isAr ? 'حدث خطأ أثناء التسجيل' : 'Error occurred during registration'))
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err)
        setErrorMsg(errMsg || 'Error occurred / حدث خطأ أثناء التسجيل')
      }
    })
  }

  const handleLoginRedirect = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg(
        isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password',
      )
      return
    }

    startTransition(async () => {
      try {
        const res = await loginAction({
          email: loginEmail,
          password: loginPassword,
        })
        if (res.success) {
          setSuccessMsg(
            isAr ? 'تم تسجيل الدخول بنجاح! جاري تحويلك...' : 'Login successful! Redirecting...',
          )
          setTimeout(() => {
            if (res.cafeSlug === 'super-admin') {
              router.push('/super-admin')
            } else {
              router.push('/dashboard')
            }
          }, 1500)
        } else {
          setErrorMsg(res.error || (isAr ? 'حدث خطأ أثناء تسجيل الدخول' : 'Error occurred during login'))
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err)
        setErrorMsg(errMsg || 'Error occurred / حدث خطأ أثناء تسجيل الدخول')
      }
    })
  }

  return (
    <div className="flex-grow w-full relative overflow-hidden flex flex-col min-h-screen bg-[#FAF8F5]">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden animate-gradient-bg">
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

      <Navigation setActiveForm={setActiveForm} />

      {/* Landing Subcomponents */}
      <Hero
        activeForm={activeForm}
        setActiveForm={setActiveForm}
        isPending={isPending}
        slug={slug}
        setSlug={setSlug}
        nameAr={nameAr}
        setNameAr={setNameAr}
        nameEn={nameEn}
        setNameEn={setNameEn}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        successMsg={successMsg}
        setSuccessMsg={setSuccessMsg}
        handleRegister={handleRegister}
        handleLoginRedirect={handleLoginRedirect}
      />

      <div className="flex flex-col gap-20 sm:gap-28 pb-20 relative z-10">
        <SocialProof />
        <Demo />
        <Features />
        <OwnerJourney />
        <SuitableForWhom />
        <Pricing setActiveForm={setActiveForm} />
        <FAQ />
        <CTA setActiveForm={setActiveForm} />
        <AboutUs />
      </div>

      <Footer />
    </div>
  )
}

// Interactive Cashier & Kiosk Simulator for the Modal
function ModalSimulator({ isAr }: { isAr: boolean }) {
  const [dashScans, setDashScans] = useState(142)
  const [dashOrdersCount, setDashOrdersCount] = useState(88)
  const [dashRevenue, setDashRevenue] = useState(520000)
  const [dashNotification, setDashNotification] = useState<string | null>(null)
  const [kioskSendingOrder, setKioskSendingOrder] = useState(false)
  const [dashOrdersList, setDashOrdersList] = useState([
    {
      id: 1,
      time: isAr ? 'منذ دقيقة' : '1m ago',
      drink: isAr ? '☕ آيس لاتيه كراميل' : '☕ Caramel Ice Latte',
      mood: '😊 سعيد',
      table: isAr ? 'طاولة 4' : 'Table 4',
      price: 6000,
    },
    {
      id: 2,
      time: isAr ? 'منذ 5 دقائق' : '5m ago',
      drink: isAr ? '☕ دبل اسبريسو' : '☕ Double Espresso',
      mood: '😴 متعب',
      table: isAr ? 'طاولة 2' : 'Table 2',
      price: 4000,
    },
  ])

  const triggerMockOrder = (moodLabel: string, drinkName: string, price: number) => {
    if (kioskSendingOrder) return
    setKioskSendingOrder(true)

    setTimeout(() => {
      setKioskSendingOrder(false)
      const randomTable = Math.floor(Math.random() * 8) + 1
      const newOrder = {
        id: Date.now(),
        time: isAr ? 'الآن' : 'Just now',
        drink: drinkName,
        mood: moodLabel,
        table: isAr ? `طاولة ${randomTable}` : `Table ${randomTable}`,
        price: price,
      }

      setDashOrdersList(prev => [newOrder, ...prev.slice(0, 4)])
      setDashOrdersCount(prev => prev + 1)
      setDashScans(prev => prev + 1)
      setDashRevenue(prev => prev + price)
      setDashNotification(
        isAr
          ? `🔔 طلب جديد: ${drinkName} لـ ${newOrder.table}`
          : `🔔 New Order: ${drinkName} for ${newOrder.table}`,
      )
    }, 800)
  }

  useEffect(() => {
    if (!dashNotification) return
    const timer = setTimeout(() => {
      setDashNotification(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [dashNotification])

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch overflow-y-auto flex-grow p-1">
      {/* LEFT: DASHBOARD */}
      <div className="md:col-span-7 bg-[#3E2723] rounded-2xl p-5 border border-[#5D4037]/20 shadow-lg flex flex-col justify-between relative overflow-hidden min-h-[380px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-30 pointer-events-none" />

        <div className="flex justify-between items-center pb-3 border-b border-white/10 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="text-xs font-black text-white">
                {isAr ? 'لوحة تحكم الكاشير الذكية' : 'Smart Cashier Console'}
              </h3>
              <span className="text-[8px] text-[#F5E6D3]/60 font-semibold">
                {isAr ? 'مقهى مزاج الدافئ - اتصال نشط' : 'Warm Mazaj Cafe - Connected'}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-wider">
            {isAr ? 'مباشر' : 'Live'}
          </span>
        </div>

        <AnimatePresence>
          {dashNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-16 inset-x-4 z-20 bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg border border-emerald-500 text-[10px] font-black flex items-center justify-between"
            >
              <span>{dashNotification}</span>
              <button
                onClick={() => setDashNotification(null)}
                className="p-0.5 text-white/80 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-3 py-4 z-10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
            <span className="text-[8px] font-bold text-[#FAF8F5]/60 block mb-0.5">
              {isAr ? 'إجمالي عمليات المسح' : 'Total Scans'}
            </span>
            <span className="text-sm font-black text-white">{dashScans}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
            <span className="text-[8px] font-bold text-[#FAF8F5]/60 block mb-0.5">
              {isAr ? 'الطلبات المستلمة' : 'Mock Orders'}
            </span>
            <span className="text-sm font-black text-amber-300">{dashOrdersCount}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
            <span className="text-[8px] font-bold text-[#FAF8F5]/60 block mb-0.5">
              {isAr ? 'الأرباح المحاكاة' : 'Est. Revenue'}
            </span>
            <span className="text-xs font-black text-emerald-400">
              {isAr
                ? `${dashRevenue.toLocaleString('ar-IQ')} د.ع`
                : `${dashRevenue.toLocaleString('en-US')} IQD`}
            </span>
          </div>
        </div>

        <div className="flex-grow space-y-2 z-10">
          <h4 className="text-[9px] font-black text-amber-300 uppercase tracking-widest">
            {isAr ? 'طلبات الكشك الواردة مباشرة' : 'Live Kiosk Incoming Orders Feed'}
          </h4>
          <div className="space-y-1.5 max-h-[160px] overflow-hidden">
            <AnimatePresence initial={false}>
              {dashOrdersList.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  className="bg-white/10 border border-white/5 rounded-lg p-2 flex justify-between items-center text-[10px] text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{order.mood}</span>
                    <div>
                      <div className="font-black text-white">{order.drink}</div>
                      <div className="text-[8px] text-[#F5E6D3]/60 font-semibold">
                        {order.table} • {order.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">
                      {isAr
                        ? `${order.price.toLocaleString('ar-IQ')} د.ع`
                        : `${order.price.toLocaleString('en-US')} IQD`}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT: KIOSK PHONE */}
      <div className="md:col-span-5 bg-white rounded-2xl p-4 border border-[#3E2723]/10 shadow-md flex flex-col justify-between min-h-[380px]">
        <div className="text-center space-y-1">
          <h4 className="text-sm font-black text-[#3E2723]">
            {isAr ? 'كيف تشعر الآن؟' : 'How do you feel today?'}
          </h4>
          <p className="text-[9px] text-gray-500 font-bold">
            {isAr
              ? 'اضغط لتجربة الاقتراح الفوري وإرسال الطلب'
              : 'Tap to trigger matching & order transfer'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 my-4">
          {[
            {
              label: '😴 متعب',
              drink: isAr ? '☕ دبل اسبريسو' : '☕ Double Espresso',
              price: 4000,
            },
            {
              label: '😊 سعيد',
              drink: isAr ? '☕ آيس لاتيه كراميل' : '☕ Caramel Ice Latte',
              price: 6000,
            },
            {
              label: '❤️ رومانسي',
              drink: isAr ? '☕ شوكولاتة ساخنة' : '☕ Hot Cocoa',
              price: 5500,
            },
            {
              label: '🧠 مشتت',
              drink: isAr ? '☕ كابتشينو كلاسيكي' : '☕ Cappuccino Classic',
              price: 5000,
            },
          ].map((m, idx) => (
            <button
              key={idx}
              disabled={kioskSendingOrder}
              onClick={() => triggerMockOrder(m.label, m.drink, m.price)}
              className="p-2 bg-gray-50 border border-gray-200/60 rounded-xl text-[10px] font-black text-[#3E2723] hover:bg-[#3E2723] hover:text-white hover:border-transparent transition-all duration-200 cursor-pointer flex flex-col items-center gap-0.5 shadow-sm active:scale-95"
            >
              <span className="text-sm">{m.label.split(' ')[0]}</span>
              <span>{m.label.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {kioskSendingOrder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center"
            >
              <div className="w-4 h-4 border-2 border-[#3E2723] border-t-transparent rounded-full animate-spin mx-auto mb-1" />
              <p className="text-[9px] text-amber-900 font-black">
                {isAr ? 'يتم إرسال الطلب للوحة التحكم...' : 'Transmitting order...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center pt-2 border-t border-gray-100">
          <span className="text-[8px] font-black text-gray-400 tracking-wider block">
            {isAr ? 'اضغط لتجربة التفاعل المباشر' : 'TAP A BUTTON TO TEST LIVE FEED'}
          </span>
        </div>
      </div>
    </div>
  )
}
