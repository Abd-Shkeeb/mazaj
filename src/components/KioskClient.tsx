'use client'

import { useState, useTransition, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import SideRays from '@/components/SideRays'
import { analyzeMood, saveFeedbackAction, trackEventAction } from '@/app/actions/analyze'
import { createOrderAction } from '@/app/actions/orders'
import {
  Sparkles,
  Coffee,
  ShoppingBag,
  Check,
  Heart,
  Zap,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Info,
  Globe,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import MoodSelection from '@/components/kiosk/MoodSelection'
import AiAnalysisLoader from '@/components/kiosk/AiAnalysisLoader'
import RecommendationResult from '@/components/kiosk/RecommendationResult'

interface AIResult {
  moodNameAr: string
  moodNameEn: string
  suitableDrinkAr: string
  suitableDrinkEn: string
  drinkDescriptionAr: string
  drinkDescriptionEn: string
  energyLevel: number
  sweetnessLevel: number
  whyMatchesAr: string
  whyMatchesEn: string
  foodPairingAr: string
  foodPairingEn: string
  drinkId?: string
  price?: number
  image?: string
}

interface Cafe {
  id: string
  slug: string
  nameAr: string
  nameEn: string
  logo: string | null
  coverImage: string | null
  phone: string | null
  addressAr: string | null
  addressEn: string | null
  workingHoursAr: string | null
  workingHoursEn: string | null
  instagram: string | null
  facebook: string | null
  kioskSessionMinutes?: number | null
}

interface DrinkType {
  id: string
  nameAr: string
  nameEn: string
  price: number
  image: string | null
  description: string
}

export default function KioskClient({
  cafe,
  drinksCount = 0,
  availableDrinks = [],
}: {
  cafe: Cafe
  drinksCount?: number
  availableDrinks?: DrinkType[]
}) {
  const tm = useTranslations('mood')
  const tr = useTranslations('result')
  const tc = useTranslations('common')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tableParam = searchParams ? searchParams.get('table') : null

  const [isPending, startTransition] = useTransition()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [customText, setCustomText] = useState('')

  const [isKioskActive, setIsKioskActive] = useState(true)
  const [statusReason, setStatusReason] = useState<string | null>(null)
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      if (!cafe || !cafe.id) {
        console.error('[KioskStatusCheck] Cafe or Cafe ID is undefined/empty');
        return;
      }

      const statusUrl = `/api/cafe/${cafe.id}/status`;
      console.log(`[KioskStatusCheck] Checking cafe status at: ${statusUrl}`);

      try {
        const res = await fetch(statusUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        })

        console.log(`[KioskStatusCheck] Response status: ${res.status} (${res.statusText})`);

        if (!res.ok) {
          setIsKioskActive(false)
          setStatusReason('NOT_FOUND')
          return
        }
        const data = await res.json()
        console.log('[KioskStatusCheck] Response data:', data);

        if (data.status === 'OWNER_LOGGED_OUT' || data.status === 'CANCELLED' || data.status === 'SUSPENDED' || data.status === 'EXPIRED') {
          setIsKioskActive(false)
          setStatusReason(data.status)
        } else {
          setIsKioskActive(true)
          setStatusReason(null)
        }
      } catch (err) {
        console.warn(`[KioskStatusCheck] Failed to fetch cafe status (will retry):`, (err as Error).message || err);
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [cafe.id])

  const getDeviceFingerprintLocal = () => {
    try {
      const storageKey = 'kioskDeviceFp';
      let fp = localStorage.getItem(storageKey);
      if (!fp) {
        fp = crypto.randomUUID?.() ?? Math.random().toString(36).substring(2);
        localStorage.setItem(storageKey, fp);
      }
      return `${navigator.userAgent}::${fp}`;
    } catch (e) {
      return navigator.userAgent;
    }
  }

  const handleRedirectToScanQr = () => {
    // Clear cookies
    document.cookie = 'kiosk-session-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    document.cookie = 'kiosk-device-fp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    // Clear localStorage
    try {
      localStorage.removeItem('kioskDeviceFp')
    } catch (e) {}
    // Redirect to scan-qr
    router.replace('/scan-qr')
  }

  const initializeSession = async () => {
    try {
      const fp = getDeviceFingerprintLocal()
      const res = await fetch(`/api/kiosk/${cafe.slug}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fingerprint': fp
        }
      })
      if (res.ok) {
        const data = await res.json()
        const expiry = new Date(data.expiresAt)
        const secondsLeft = Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000))
        
        document.cookie = `kiosk-session-id=${data.sessionId}; path=/; max-age=${secondsLeft}`
        document.cookie = `kiosk-device-fp=${encodeURIComponent(fp)}; path=/; max-age=${secondsLeft}`
        
        setSessionTimeLeft(secondsLeft)
        setIsSessionExpired(false)
        console.log(`[Session] Created/Retrieved session ${data.sessionId}, expires in ${secondsLeft}s`)
      } else {
        console.error('[Session] Failed to initialize session')
        handleRedirectToScanQr()
      }
    } catch (err) {
      console.error('[Session] Error initializing session:', err)
      handleRedirectToScanQr()
    }
  }

  const checkAndInitSession = async () => {
    const cookiesObj = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=')
      if (k) acc[k] = v
      return acc
    }, {} as Record<string, string>)
    
    const storedSessionId = cookiesObj['kiosk-session-id']
    const fp = getDeviceFingerprintLocal()
    
    if (storedSessionId) {
      try {
        const res = await fetch(`/api/kiosk/${cafe.slug}/session/validate?sessionId=${storedSessionId}`, {
          headers: {
            'x-device-fingerprint': fp
          }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.valid) {
            const expiry = new Date(data.expiresAt)
            const secondsLeft = Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000))
            setSessionTimeLeft(secondsLeft)
            setIsSessionExpired(false)
            return
          } else {
            handleRedirectToScanQr()
            return
          }
        } else if (res.status === 401) {
          handleRedirectToScanQr()
          return
        }
      } catch (e) {
        console.warn('[Session] Stored session validation failed:', e)
      }
    }
    
    await initializeSession()
  }

  useEffect(() => {
    checkAndInitSession()
  }, [cafe.id])

  useEffect(() => {
    if (sessionTimeLeft === null) return
    if (sessionTimeLeft <= 0) {
      setIsSessionExpired(true)
      return
    }
    const timer = setTimeout(() => {
      setSessionTimeLeft(prev => (prev !== null ? prev - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [sessionTimeLeft])

  const [analysisResult, setAnalysisResult] = useState<AIResult | null>(null);
  // Suggested drink state; initialize to true if no drinks available for the cafe
  const [emptyState, setEmptyState] = useState(drinksCount === 0);

  const [prevDrinksCount, setPrevDrinksCount] = useState(drinksCount)

  if (drinksCount !== prevDrinksCount) {
    setPrevDrinksCount(drinksCount)
    if (drinksCount === 0) {
      setEmptyState(true)
    }
  }


  // Ordering flow states
  const [isOrdering, setIsOrdering] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<{
    id: number
    drinkName: string
    price: number
  } | null>(null)

  const [timeLeft, setTimeLeft] = useState(60)

  // Loading stages during AI analysis
  const [loadingStage, setLoadingStage] = useState(0)

  // Feedback states
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  const handleReset = () => {
    setAnalysisResult(null);
    setEmptyState(false);
    setSelectedMood(null);
    setCustomText('');
    setFeedbackSubmitted(false);
    setAnalysisId(null);
    setPlacedOrder(null);
  }

  const handleSaveFeedback = async (isAppropriate: boolean) => {
    if (!analysisId) return
    try {
      await saveFeedbackAction(analysisId, isAppropriate)
      setFeedbackSubmitted(true)
    } catch (err) {
      console.error('Failed to save feedback:', err)
    }
  }

  useEffect(() => {
    if (!analysisResult) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleReset()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [analysisResult])

  useEffect(() => {
    // Track SCAN_QR event on mount
    trackEventAction(cafe.id, 'SCAN_QR').catch(err =>
      console.error('Failed to track event SCAN_QR:', err),
    )
  }, [cafe.id])

  // Handle loading text stages animation
  useEffect(() => {
    if (!isPending) return

    const interval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % 4)
    }, 1200)
    return () => {
      clearInterval(interval)
      setLoadingStage(0)
    }
  }, [isPending])

  const loadingTexts = isAr
    ? [
      'تحليل المشاعر...',
      'فهم المزاج الحالي...',
      'اختيار المشروب المناسب لروحك...',
      'تجهيز التوصية الخاصة بك...',
    ]
    : [
      'Analyzing feelings...',
      'Decoding your current mood...',
      'Selecting the perfect cup for you...',
      'Brewing your recommendation...',
    ]

  const predefinedMoods = [
    {
      key: 'happy',
      label: tm('feelings.happy'),
      color: '#F59E0B',
      bg: 'bg-[#FEFCE8]',
      border: 'border-yellow-200',
      text: 'text-amber-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(250,204,21,0.25)]',
      ringColor: 'ring-yellow-400',
      glowColor: 'rgba(250,204,21,0.2)',
    },
    {
      key: 'calm',
      label: tm('feelings.calm'),
      color: '#0EA5E9',
      bg: 'bg-[#F0F9FF]',
      border: 'border-sky-200',
      text: 'text-sky-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(14,165,233,0.25)]',
      ringColor: 'ring-sky-400',
      glowColor: 'rgba(14,165,233,0.2)',
    },
    {
      key: 'tired',
      label: tm('feelings.tired'),
      color: '#78716C',
      bg: 'bg-[#FAFAF9]',
      border: 'border-stone-200',
      text: 'text-stone-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(120,113,108,0.25)]',
      ringColor: 'ring-stone-400',
      glowColor: 'rgba(120,113,108,0.2)',
    },
    {
      key: 'excited',
      label: tm('feelings.excited'),
      color: '#D946EF',
      bg: 'bg-[#FDF4FF]',
      border: 'border-fuchsia-200',
      text: 'text-fuchsia-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(217,70,239,0.25)]',
      ringColor: 'ring-fuchsia-400',
      glowColor: 'rgba(217,70,239,0.2)',
    },
    {
      key: 'sad',
      label: tm('feelings.sad'),
      color: '#475569',
      bg: 'bg-[#F8FAFC]',
      border: 'border-slate-200',
      text: 'text-slate-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(71,85,105,0.25)]',
      ringColor: 'ring-slate-400',
      glowColor: 'rgba(71,85,105,0.2)',
    },
    {
      key: 'angry',
      label: tm('feelings.angry'),
      color: '#EF4444',
      bg: 'bg-[#FEF2F2]',
      border: 'border-rose-200',
      text: 'text-rose-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(239,68,68,0.25)]',
      ringColor: 'ring-rose-400',
      glowColor: 'rgba(239,68,68,0.2)',
    },
    {
      key: 'focus',
      label: tm('feelings.focus'),
      color: '#6366F1',
      bg: 'bg-[#EEF2FF]',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(99,102,241,0.25)]',
      ringColor: 'ring-indigo-400',
      glowColor: 'rgba(99,102,241,0.2)',
    },
    {
      key: 'needEnergy',
      label: tm('feelings.needEnergy'),
      color: '#0D9488',
      bg: 'bg-[#F0FDFA]',
      border: 'border-teal-200',
      text: 'text-teal-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(13,148,136,0.25)]',
      ringColor: 'ring-teal-400',
      glowColor: 'rgba(13,148,136,0.2)',
    },
    {
      key: 'calmMood',
      label: isAr ? '🌧️ مزاج هادئ' : '🌧️ Rainy/Calm',
      color: '#4B5563',
      bg: 'bg-[#F9FAFB]',
      border: 'border-gray-200',
      text: 'text-gray-900',
      hoverGlow: 'hover:shadow-[0_8px_20px_rgba(75,85,99,0.25)]',
      ringColor: 'ring-gray-400',
      glowColor: 'rgba(75,85,99,0.2)',
    },
  ]

  const handleAnalyze = () => {
    if (isSessionExpired) {
      alert(isAr ? 'انتهت صلاحية الجلسة، يرجى مسح رمز QR مرة أخرى' : 'Session expired, please scan the QR code again')
      return
    }
    if (!selectedMood && !customText) return

    startTransition(async () => {
      try {
        // Track event START_ANALYSIS
        await trackEventAction(cafe.id, 'START_ANALYSIS')

        const res = await analyzeMood({
          moodKey: selectedMood || undefined,
          customText: customText || undefined,
          cafeId: cafe.id,
        })

        if (res && res.aiResult) {
          console.log('[KioskClient] Received res:', res)
          console.log('[KioskClient] Received aiResult:', res.aiResult)
          console.log('[KioskClient] aiResult.image:', (res.aiResult as { image?: string }).image)
          setAnalysisId(res.id)
          setAnalysisResult(res.aiResult as AIResult);
          setEmptyState(!res.aiResult.suitableDrinkEn);
          setTimeLeft(60);

          // Track event COMPLETE_ANALYSIS
          await trackEventAction(cafe.id, 'COMPLETE_ANALYSIS')
        }
      } catch (err) {
        console.error('Analysis failed:', err)
      }
    })
  }

  const handlePlaceOrder = async () => {
    if (isSessionExpired) {
      alert(isAr ? 'انتهت صلاحية الجلسة، يرجى مسح رمز QR مرة أخرى' : 'Session expired, please scan the QR code again')
      return
    }
    if (!analysisResult) return
    if (!analysisResult.drinkId) {
      alert(
        isAr
          ? 'عذراً، لم يتم العثور على معرّف المشروب في النظام لتأكيد الطلب.'
          : 'Sorry, the drink ID was not found in the system to confirm the order.',
      )
      return
    }

    setIsOrdering(true)
    try {
      const order = await createOrderAction({
        drinkId: analysisResult.drinkId,
        drinkName: isAr ? analysisResult.suitableDrinkAr : analysisResult.suitableDrinkEn,
        price: analysisResult.price || 0,
        cafeId: cafe.id,
        tableNumber: tableParam || undefined,
      })

      if (order) {
        setPlacedOrder({
          id: order.id,
          drinkName: order.drinkName,
          price: order.price,
        })

        // Track event CREATE_ORDER
        await trackEventAction(cafe.id, 'CREATE_ORDER')
      }
    } catch (err) {
      console.error('Order creation failed:', err)
      alert(
        isAr
          ? `عذراً، فشل إرسال الطلب: ${(err as Error).message || 'خطأ غير معروف'}`
          : `Sorry, failed to place order: ${(err as Error).message || 'Unknown error'}`,
      )
    } finally {
      setIsOrdering(false)
    }
  }

  const formattedPrice = (price: number) => {
    if (isAr) {
      return `${price.toLocaleString('ar-IQ')} د.ع`
    }
    return `${price.toLocaleString('en-US')} IQD`
  }

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 120, damping: 14 },
    },
  }

  const activeStep = placedOrder ? 3 : analysisResult ? 2 : 1

  if (!isKioskActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#3E2723]/5 rounded-full blur-3xl pointer-events-none select-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none select-none" />

        <div className="relative max-w-md w-full bg-white/80 backdrop-blur-md border border-[#3E2723]/10 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-[#3E2723]/5 border border-[#3E2723]/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg
              className="h-10 w-10 text-[#3E2723]/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight">
              {isAr ? 'الكشك غير متاح حالياً' : 'Kiosk is currently unavailable'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-500 leading-relaxed">
              {statusReason === 'OWNER_LOGGED_OUT'
                ? (isAr ? 'تم تسجيل خروج المالك. يرجى تسجيل الدخول مجدداً لتفعيل الكشك.' : 'Owner has logged out. Please log in again to activate the kiosk.')
                : (isAr ? 'تم إيقاف الكشك مؤقتاً لانتهاء اشتراك المقهى أو تعطيله.' : 'The kiosk has been temporarily deactivated due to the cafe\'s subscription status.')}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {cafe.nameEn} • {cafe.nameAr}
          </div>
        </div>
      </div>
    )
  }

  // Circular timer values
  const sessionDuration = (cafe.kioskSessionMinutes ?? 45) * 60
  const timerRadius = 18
  const timerCircumference = 2 * Math.PI * timerRadius
  const timerProgress = sessionTimeLeft !== null ? (sessionTimeLeft / sessionDuration) : 1
  const timerDashoffset = timerCircumference * (1 - timerProgress)

  // Step indicator
  const steps = isAr
    ? ['اختيار المزاج', 'التحليل', 'النتيجة']
    : ['Select Mood', 'Analysis', 'Result']

  return (
    <div className="flex-grow w-full relative flex flex-col min-h-screen bg-[#FAF8F5]">
      {/* Light decorative Rays */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
        <SideRays
          speed={0.5}
          rayColor1="#EAD9CB"
          rayColor2="#F2EAE4"
          intensity={0.4}
          spread={2.0}
          origin="top-right"
          tilt={3}
          saturation={0.3}
          blend={0.5}
          falloff={1.5}
          opacity={0.5}
        />
      </div>

      {/* ═══ PREMIUM KIOSK HEADER ═══ */}
      <header className="w-full relative z-20 bg-white/70 backdrop-blur-xl border-b border-[#3E2723]/8 shadow-[0_1px_12px_rgba(62,39,35,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Cafe branding */}
          <div className="flex items-center gap-3">
            {cafe.logo && (
              <div className="relative w-10 h-10 rounded-full ring-2 ring-amber-400/30 ring-offset-2 ring-offset-white overflow-hidden shadow-md">
                <Image src={cafe.logo ?? ''} alt="Cafe Logo" fill sizes="40px" className="object-cover" unoptimized />
              </div>
            )}
            <div>
              <h1 className="text-base font-black text-[#3E2723] leading-tight tracking-tight">
                {isAr ? cafe.nameAr : cafe.nameEn}
              </h1>
              <span className="text-[9px] font-bold text-amber-700/60 uppercase tracking-widest">
                {isAr ? 'مستشار المزاج الذكي' : 'AI Mood Advisor'}
              </span>
            </div>
          </div>

          {/* Step indicator (desktop only) */}
          <div className="hidden md:flex items-center gap-1">
            {steps.map((step, i) => {
              const stepNum = i + 1
              const isActive = stepNum === activeStep
              const isCompleted = stepNum < activeStep
              return (
                <div key={step} className="flex items-center gap-1">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all duration-300 ${
                    isActive
                      ? 'bg-[#3E2723] text-white shadow-md'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-[9px]">{stepNum}</span>
                    )}
                    <span className="hidden lg:inline">{step}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-4 h-[2px] rounded-full transition-colors duration-300 ${
                      isCompleted ? 'bg-emerald-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Timer + Language */}
          <div className="flex items-center gap-2.5">
            {/* Circular Timer */}
            {sessionTimeLeft !== null && !isSessionExpired && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#3E2723]/8">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg className="w-9 h-9 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r={timerRadius} fill="none" stroke="#E5E0DA" strokeWidth="3" />
                    <circle
                      cx="20" cy="20" r={timerRadius}
                      fill="none"
                      stroke={sessionTimeLeft < 120 ? '#EF4444' : sessionTimeLeft < 300 ? '#F59E0B' : '#22C55E'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={timerCircumference}
                      strokeDashoffset={timerDashoffset}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute text-[8px] font-black text-[#3E2723]">
                    {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            {/* Language switcher */}
            <button
              onClick={() => {
                const nextLocale = locale === 'ar' ? 'en' : 'ar'
                router.replace(pathname, { locale: nextLocale })
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-black text-[#3E2723] bg-white border border-[#3E2723]/10 rounded-xl hover:bg-[#3E2723]/5 hover:border-[#3E2723]/20 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>

        {/* Mobile step indicator */}
        <div className="md:hidden flex items-center justify-center gap-1.5 pb-2.5">
          {steps.map((step, i) => {
            const stepNum = i + 1
            const isActive = stepNum === activeStep
            const isCompleted = stepNum < activeStep
            return (
              <div key={step} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#3E2723] scale-125 shadow-sm'
                    : isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-gray-300'
                }`} />
                {i < steps.length - 1 && (
                  <div className={`w-5 h-[1.5px] rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-emerald-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </header>

      {/* FULLSCREEN AI BREWING LOADER */}
      <AiAnalysisLoader
        isPending={isPending}
        isAr={isAr}
        loadingStage={loadingStage}
        loadingTexts={loadingTexts}
      />

      <main className="flex-grow w-full relative z-10 flex flex-col py-6 pb-12">
        <AnimatePresence mode="wait">
          {analysisResult && !isPending ? (
            <RecommendationResult
              isAr={isAr}
              analysisResult={analysisResult}
              emptyState={emptyState}
              timeLeft={timeLeft}
              feedbackSubmitted={feedbackSubmitted}
              isOrdering={isOrdering}
              handleReset={handleReset}
              handleSaveFeedback={handleSaveFeedback}
              handlePlaceOrder={handlePlaceOrder}
              formattedPrice={formattedPrice}
              availableDrinks={availableDrinks}
            />
          ) : (
            <MoodSelection
              cafe={cafe}
              isAr={isAr}
              selectedMood={selectedMood}
              setSelectedMood={setSelectedMood}
              setCustomText={setCustomText}
              handleAnalyze={handleAnalyze}
              predefinedMoods={predefinedMoods}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Checkout Order Success Modal */}
      <AnimatePresence>
        {placedOrder && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setPlacedOrder(null); handleReset(); }}
              className="absolute inset-0 bg-[#3E2723]/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl relative z-10 border border-[#5D4037]/10"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>

              <h2 className="text-xl font-black text-[#2D2D2D] mb-1">{tr('orderSuccessTitle')}</h2>

              <div className="bg-[#FAF8F5] py-3 px-4 rounded-xl border border-[#5D4037]/5 mb-3 max-w-xs mx-auto">
                <p className="text-[10px] text-[#6D6D6D] font-bold uppercase tracking-wider">
                  {tr('orderNumberLabel')}
                </p>
                <p className="text-3xl font-black text-[#5D4037] mt-0.5">#{placedOrder.id}</p>
              </div>

              <div className="mb-4">
                <p className="text-base font-extrabold text-[#2D2D2D]">{placedOrder.drinkName}</p>
                <p className="text-xs font-black text-amber-700 mt-0.5">
                  {formattedPrice(placedOrder.price)}
                </p>
              </div>

              <p className="text-xs text-[#6D6D6D] font-semibold leading-relaxed mb-5">
                {tr('orderSuccessMsg')}
              </p>

              <button
                onClick={() => { setPlacedOrder(null); handleReset(); }}
                className="w-full py-3 bg-[#5D4037] text-white rounded-xl font-black text-xs transition-colors cursor-pointer shadow-sm hover:bg-[#3E2723]"
              >
                {tr('close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kiosk Session Expired Modal */}
      <AnimatePresence>
        {isSessionExpired && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#3E2723]/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl relative z-10 border border-[#5D4037]/10 animate-in fade-in zoom-in-95 duration-250"
            >
              <div className="w-12 h-12 bg-red-150 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="h-6 w-6 stroke-[3]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-black text-[#2D2D2D] mb-3">
                {isAr ? 'انتهت صلاحية الجلسة' : 'Session Expired'}
              </h2>

              <p className="text-xs text-[#6D6D6D] font-semibold leading-relaxed mb-6">
                {isAr ? 'انتهت صلاحية الجلسة، يرجى مسح رمز QR مرة أخرى' : 'Session expired, please scan the QR code again'}
              </p>

              <button
                onClick={handleRedirectToScanQr}
                className="w-full py-3 bg-[#5D4037] text-white rounded-xl font-black text-xs transition-colors cursor-pointer shadow-sm hover:bg-[#3E2723]"
              >
                {isAr ? 'إعادة مسح رمز QR' : 'Re-scan QR Code'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
