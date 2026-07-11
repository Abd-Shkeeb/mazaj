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
    } catch (e) { }
    // Strictly redirect to scan-qr page to block remote access and require a physical QR scan
    window.location.replace(`/${locale}/scan-qr`)
  }


  const checkAndInitSession = async () => {
    const cookiesObj = document.cookie ? document.cookie.split(';').reduce((acc, c) => {
      const parts = c.trim().split('=')
      const k = parts[0]
      const v = parts.slice(1).join('=')
      if (k) acc[k.trim()] = v
      return acc
    }, {} as Record<string, string>) : {}

    const storedSessionId = cookiesObj['kiosk-session-id']
    const fp = getDeviceFingerprintLocal()
    console.log('[KioskSession] Checking cookie. sessionId:', storedSessionId)

    if (storedSessionId) {
      try {
        const res = await fetch(`/api/kiosk/${cafe.slug}/session/validate?sessionId=${storedSessionId}`, {
          headers: { 'x-device-fingerprint': fp }
        })
        if (res.ok) {
          const data = await res.json()
          console.log('[KioskSession] Validate response:', data)

          // Allow session if valid, OR if it was marked USED but we are still looking at the active placed order status screen
          const isPageViewingActiveOrder = placedOrder !== null
          const isValidOrUsedActiveOrder = data.valid || (data.code === 'SESSION_USED' && isPageViewingActiveOrder)

          if (isValidOrUsedActiveOrder) {
            const expiryTime = data.expiresAt ? new Date(data.expiresAt).getTime() : (Date.now() + 60000)
            const secondsLeft = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000))
            console.log('[KioskSession] ✅ Session allowed. Seconds left:', secondsLeft)
            setSessionTimeLeft(secondsLeft)
            setIsSessionExpired(false)
            return
          }
          console.warn('[KioskSession] ❌ Session invalid/used/expired. Code:', data.code)
        }
      } catch (e) {
        console.error('[KioskSession] Validation error:', e)
      }
    } else {
      console.log('[KioskSession] No session cookie found.')
    }

    // No valid session → redirect to scan-qr
    console.log('[KioskSession] Redirecting to scan-qr...')
    handleRedirectToScanQr()
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
    tableNumber?: string | null
  } | null>(null)

  const [timeLeft, setTimeLeft] = useState(60)

  // Loading stages during AI analysis
  const [loadingStage, setLoadingStage] = useState(0)

  // Feedback states
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  const handleReset = (forceClearMood: boolean = false) => {
    setAnalysisResult(null);
    setEmptyState(false);
    if (forceClearMood) {
      setSelectedMood(null);
    }
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
      handleRedirectToScanQr()
      return
    }
    if (!selectedMood && !customText) return

    startTransition(async () => {
      try {
        await trackEventAction(cafe.id, 'START_ANALYSIS')

        const res = await analyzeMood({
          moodKey: selectedMood || undefined,
          customText: customText || undefined,
          cafeId: cafe.id,
        })

        if (res && 'success' in res && !res.success) {
          const code = (res as any).code || ''
          const isSessionErr = ['SESSION_MISSING', 'SESSION_INVALID', 'SESSION_USED', 'SESSION_EXPIRED', 'SESSION_MISMATCH'].includes(code)
          if (isSessionErr) {
            // Re-initialize session transparently instead of redirecting
            console.log('[KioskClient] Session invalid. Requesting new session...')
            await checkAndInitSession()
          } else {
            alert(res.error || (isAr ? 'حدث خطأ أثناء التحليل' : 'An error occurred during analysis'))
          }
          return
        }

        if (res && (res as any).aiResult) {
          const result = res as any
          setAnalysisId(result.id)
          setAnalysisResult(result.aiResult as AIResult);
          setEmptyState(!result.aiResult.suitableDrinkEn);
          setTimeLeft(60);

          await trackEventAction(cafe.id, 'COMPLETE_ANALYSIS')
        }
      } catch (err) {
        console.error('Analysis failed:', err)
        alert(isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred')
      }
    })
  }

  const handlePlaceOrder = async () => {
    if (isSessionExpired) {
      await checkAndInitSession()
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
      const res = await createOrderAction({
        drinkId: analysisResult.drinkId,
        drinkName: isAr ? analysisResult.suitableDrinkAr : analysisResult.suitableDrinkEn,
        price: analysisResult.price || 0,
        cafeId: cafe.id,
        tableNumber: tableParam || undefined,
      })

      if (res && 'success' in res && !res.success) {
        const code = (res as any).code || ''
        const isSessionErr = ['SESSION_MISSING', 'SESSION_INVALID', 'SESSION_USED', 'SESSION_EXPIRED', 'SESSION_MISMATCH'].includes(code)
        if (isSessionErr) {
          // Session is invalid — strictly redirect to scan-qr lock screen
          console.log('[KioskClient] Session error on checkout. Code:', code, '— redirecting to scan-qr.')
          window.location.replace(`/${locale}/scan-qr`)
        } else {
          alert(res.error || (isAr ? 'عذراً، فشل إرسال الطلب' : 'Sorry, failed to place order'))
        }
        return
      }

      const order = (res as any)?.order
      if (order) {
        setPlacedOrder({
          id: order.id,
          drinkName: order.drinkName,
          price: order.price,
          tableNumber: order.tableNumber || tableParam || null,
        })

        try {
          await trackEventAction(cafe.id, 'CREATE_ORDER')
        } catch (eventErr) {
          console.warn('Event tracking failed:', eventErr)
        }
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
  const sessionDuration = (cafe.kioskSessionMinutes ?? 15) * 60
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
              <div className="relative w-10 h-10 rounded-xl bg-[#3E2723]/10 text-[#3E2723] border border-[#3E2723]/10 backdrop-blur-sm flex items-center justify-center p-1.5 overflow-hidden">
                <Image src={cafe.logo ?? ''} alt="Cafe Logo" fill sizes="40px" className="object-contain p-1" unoptimized />
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
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all duration-300 ${isActive
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
                    <div className={`w-4 h-[2px] rounded-full transition-colors duration-300 ${isCompleted ? 'bg-emerald-300' : 'bg-gray-200'
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
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive
                  ? 'bg-[#3E2723] scale-125 shadow-sm'
                  : isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-gray-300'
                  }`} />
                {i < steps.length - 1 && (
                  <div className={`w-5 h-[1.5px] rounded-full transition-colors duration-300 ${isCompleted ? 'bg-emerald-300' : 'bg-gray-200'
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

      {/* Checkout Order Success Modal with Real-time Status Tracker */}
      <AnimatePresence>
        {placedOrder && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setPlacedOrder(null); handleReset(true); }}
              className="absolute inset-0 bg-[#3E2723]/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl relative z-10 border border-[#5D4037]/10"
            >
              {/* Order Status Checker Logic Wrapper */}
              <OrderStatusTracker placedOrder={placedOrder} isAr={isAr} onClose={() => { setPlacedOrder(null); handleReset(true); }} />

              <button
                onClick={() => { setPlacedOrder(null); handleReset(true); }}
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

function OrderStatusTracker({ placedOrder, isAr, onClose }: { placedOrder: { id: number; drinkName: string; price: number; tableNumber?: string | null }; isAr: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<string>('PENDING') // PENDING, PREPARING, READY, DELIVERED
  const [rating, setRating] = useState<number>(0)
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false)

  // Estimated preparation time based on status
  const getEstimatedTime = (s: string) => {
    switch (s) {
      case 'PENDING': return isAr ? '5 دقائق' : '5 mins'
      case 'PREPARING': return isAr ? '2 دقيقة' : '2 mins'
      case 'READY': return isAr ? 'جاهز الآن!' : 'Ready now!'
      case 'DELIVERED': return isAr ? 'تم التسليم' : 'Delivered'
      default: return isAr ? '5 دقائق' : '5 mins'
    }
  }

  useEffect(() => {
    let active = true
    let intervalId: NodeJS.Timeout
    let playedReadyAlert = false

    const playNotification = () => {
      // Browser audio context alert sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5 note
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.3)
      } catch (e) {
        console.warn('Audio alert failed:', e)
      }

      // Device vibration (if supported)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/kiosk/order/${placedOrder.id}/status`)
        if (res.ok && active) {
          const data = await res.json()
          if (data.success && data.status) {
            const nextStatus = data.status
            setStatus(nextStatus)

            // Trigger alert when order becomes READY
            if (nextStatus === 'READY' && !playedReadyAlert) {
              playedReadyAlert = true
              playNotification()
            }

            // Stop polling when DELIVERED
            if (nextStatus === 'DELIVERED') {
              console.log('[OrderStatusTracker] Order delivered. Clearing status poll interval...')
              clearInterval(intervalId)
            }
          }
        }
      } catch (err) {
        console.warn('Failed to poll order status:', err)
      }
    }

    // Initial check
    checkStatus()

    intervalId = setInterval(checkStatus, 3000)
    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [placedOrder.id])

  // Map status to steps: PENDING (0), PREPARING (1), READY (2), DELIVERED (3)
  const getStepIndex = (s: string) => {
    switch (s) {
      case 'PENDING': return 0
      case 'PREPARING': return 1
      case 'READY': return 2
      case 'DELIVERED': return 3
      default: return 0
    }
  }

  const currentStep = getStepIndex(status)
  const steps = isAr
    ? ['تم الاستلام', 'قيد التحضير', 'جاهز للاستلام', 'تم التسليم']
    : ['Received', 'Preparing', 'Ready', 'Delivered']

  return (
    <div className="w-full text-center space-y-4 mb-5">
      {/* Dynamic Animated Status Icon */}
      <div className="mx-auto flex items-center justify-center">
        {status === 'DELIVERED' ? (
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-md">
            <CheckCircle className="h-7 w-7 stroke-[3]" />
          </div>
        ) : status === 'READY' ? (
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-pulse shadow-md">
            <Coffee className="h-7 w-7 stroke-[2.5]" />
          </div>
        ) : status === 'PREPARING' ? (
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-md">
            <Loader2 className="h-7 w-7 stroke-[2.5] animate-spin" />
          </div>
        ) : (
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-sm">
            <Check className="h-7 w-7 stroke-[3]" />
          </div>
        )}
      </div>

      {status !== 'DELIVERED' ? (
        <>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-emerald-600 leading-tight">
              {isAr ? 'تم استلام طلبك بنجاح ✅' : 'Order Placed Successfully ✅'}
            </h2>
            <p className="text-[11px] font-black text-[#5D4037]">
              {isAr ? 'سيتم تحضير مشروبك الآن' : 'Your drink is being prepared now'}
            </p>
          </div>

          {/* Time & Table Info */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#5D4037]/5 max-w-xs mx-auto grid grid-cols-3 gap-2 text-center divide-x divide-gray-150">
            <div className="space-y-0.5">
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">
                {isAr ? 'رقم الطلب' : 'Order No.'}
              </p>
              <p className="text-base font-black text-[#5D4037]">#{placedOrder.id}</p>
            </div>
            <div className="space-y-0.5 ps-2">
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">
                {isAr ? 'رقم الطاولة' : 'Table No.'}
              </p>
              <p className="text-base font-black text-[#5D4037]">
                {placedOrder.tableNumber || (isAr ? 'سفري' : 'Takeaway')}
              </p>
            </div>
            <div className="space-y-0.5 ps-2">
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">
                {isAr ? 'الوقت المقدر' : 'Est. Time'}
              </p>
              <p className="text-xs font-black text-amber-700 mt-0.5">{getEstimatedTime(status)}</p>
            </div>
          </div>

          {/* Drink Name & Price */}
          <div className="max-w-xs mx-auto text-center border-t border-b border-gray-100 py-2.5">
            <p className="text-xs font-black text-[#2D2D2D]">{placedOrder.drinkName}</p>
            <p className="text-[10px] font-black text-amber-700 mt-0.5">
              {isAr ? `${placedOrder.price.toLocaleString('ar-IQ')} د.ع` : `${placedOrder.price.toLocaleString('en-US')} IQD`}
            </p>
          </div>

          {/* Progress tracker timeline */}
          <div className="py-2 px-2 space-y-3 text-right rtl:text-right ltr:text-left max-w-xs mx-auto">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center mb-1">
              {isAr ? 'حالة التحضير مباشرة' : 'Live Preparation Status'}
            </p>

            <div className="space-y-3.5 relative before:absolute before:top-2 before:bottom-2 before:start-[10px] before:w-[2px] before:bg-gray-150">
              {steps.map((stepText, idx) => {
                const isDone = idx <= currentStep
                const isCurrent = idx === currentStep

                return (
                  <div key={idx} className="flex items-center gap-3.5 relative z-10">
                    <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all duration-500 text-[9px] font-bold ${isCurrent
                      ? 'bg-[#5D4037] border-[#5D4037] text-white ring-4 ring-[#5D4037]/10'
                      : isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                      {isDone && !isCurrent ? (
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-[11px] font-black transition-colors duration-500 ${isCurrent
                      ? 'text-[#5D4037]'
                      : isDone
                        ? 'text-emerald-600 font-bold'
                        : 'text-gray-400'
                      }`}>
                      {stepText}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        /* ─── DELIVERED: THANK YOU & RATINGS ─── */
        <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-350">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-emerald-600">
              {isAr ? 'بالعافية عليك! ☕❤️' : 'Enjoy your drink! ☕❤️'}
            </h2>
            <p className="text-xs text-gray-500 font-semibold">
              {isAr ? 'تم تسليم طلبك بنجاح. نأمل أن يعجبك مشروبك!' : 'Your order has been delivered. We hope you love your drink!'}
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100 max-w-xs mx-auto space-y-3">
            <p className="text-xs font-black text-[#5D4037]">
              {ratingSubmitted
                ? (isAr ? 'شكراً لتقييمك الرائع! 🥰' : 'Thank you for your rating! 🥰')
                : (isAr ? 'كيف كانت تجربتك معنا؟' : 'How was your experience with us?')}
            </p>

            {!ratingSubmitted ? (
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star)
                      setRatingSubmitted(true)
                    }}
                    className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-center gap-1.5 text-amber-500 text-lg">
                {'⭐'.repeat(rating)}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs transition-colors cursor-pointer shadow-sm hover:bg-emerald-700"
          >
            {isAr ? 'طلب جديد ☕' : 'New Order ☕'}
          </button>
        </div>
      )}
    </div>
  )
}
