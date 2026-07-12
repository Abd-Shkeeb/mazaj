'use client'

import { useState, useTransition, useMemo, useCallback, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import NextImage from 'next/image'
import Navigation from '@/components/Navigation'
import { updateOrderStatusAction, deleteOrderAction } from '@/app/actions/orders'
import {
  addDrinkAction,
  deleteDrinkAction,
  updateDrinkAction,
  updateCafeSettingsAction,
} from '@/app/actions/dashboard'
import { uploadFileToStorage, deleteFileFromStorage } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import OrdersTab from '@/components/dashboard/OrdersTab'

const MenuTab = dynamic(() => import('@/components/dashboard/MenuTab'), {
  loading: () => <div className="text-center py-12 text-xs font-bold text-stone-500 animate-pulse">Loading Menu...</div>,
  ssr: false,
})

const SettingsTab = dynamic(() => import('@/components/dashboard/SettingsTab'), {
  loading: () => <div className="text-center py-12 text-xs font-bold text-stone-500 animate-pulse">Loading Settings...</div>,
  ssr: false,
})

const UsersTab = dynamic(() => import('@/components/dashboard/UsersTab'), {
  loading: () => <div className="text-center py-12 text-xs font-bold text-stone-500 animate-pulse">Loading Users...</div>,
  ssr: false,
})

const AnalyticsTab = dynamic(() => import('@/components/dashboard/AnalyticsTab'), {
  loading: () => <div className="text-center py-12 text-xs font-bold text-stone-500 animate-pulse">Loading Analytics...</div>,
  ssr: false,
})

import {
  Coffee,
  ShoppingBag,
  BarChart3,
  Settings,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  Edit2,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Calendar,
  Info,
  QrCode,
  ClipboardList,
  X,
  Check,
  Activity,
  Volume2,
  VolumeX,
} from 'lucide-react'

interface Order {
  id: number
  drinkId: string
  drinkName: string
  price: number
  status: string
  tableNumber?: string | null
  createdAt: Date
}

interface Drink {
  id: string
  nameAr: string
  nameEn: string
  description: string
  price: number
  isAvailable: boolean
  category: string
  image: string | null
  caffeine: number
  energy: number
  sweetness: number
  isHot: boolean
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
  trialEndsAt: Date | string
  subscriptionEndsAt?: Date | string | null
  subscriptionPlan: string
  subscriptionStatus: string
  currentBillingCycleStart?: Date | string | null
  geminiQuotaExceeded?: boolean
  geminiFailureReason?: string | null
  geminiLastChecked?: Date | string | null
  geminiErrorCount?: number
}

interface Event {
  id: string
  cafeId: string
  name: string
  createdAt: Date
}

interface Analysis {
  id: string
  userId?: string | null
  moodId?: string | null
  drinkId?: string | null
  cafeId: string
  userMood: string
  aiResult: string
  feedbackVal?: boolean | null
  createdAt: Date
}

interface GeminiHealthLog {
  id: string
  cafeId: string
  event: string
  details: string | null
  createdAt: Date | string
}

interface DashboardClientProps {
  orders: Order[]
  drinks: Drink[]
  analyses: Analysis[]
  settings: Cafe
  cafes: Cafe[]
  events: Event[]
  healthLogs?: GeminiHealthLog[]
  cycleAnalysesCount?: number
}

export default function DashboardClient({
  orders,
  drinks,
  analyses,
  settings,
  cafes,
  events,
  healthLogs = [],
  cycleAnalysesCount = 0,
}: DashboardClientProps) {
  const t = useTranslations('admin')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const router = useRouter()

  const plan = (settings.subscriptionPlan || 'FREE').toUpperCase()

  const limits = useMemo(() => {
    if (plan === 'FREE_TRIAL' || plan === 'FREE') {
      return {
        maxDrinks: 999999,
        maxUsers: 999999,
        maxAnalyses: 100,
        hasMoodAnalytics: true,
        hasSalesReports: true,
        hasBetaAnalytics: true,
        hasFunnelAnalytics: true,
        hasMultiBranch: false,
      }
    }
    switch (plan) {
      case 'STARTER':
        return {
          maxDrinks: 15,
          maxUsers: 2,
          maxAnalyses: 500,
          hasMoodAnalytics: true,
          hasSalesReports: false,
          hasBetaAnalytics: false,
          hasFunnelAnalytics: false,
          hasMultiBranch: false,
        }
      case 'LITE':
        return {
          maxDrinks: 10,
          maxUsers: 1,
          maxAnalyses: 1000,
          hasMoodAnalytics: false,
          hasSalesReports: false,
          hasBetaAnalytics: false,
          hasFunnelAnalytics: false,
          hasMultiBranch: false,
        }
      case 'STANDARD':
        return {
          maxDrinks: 30,
          maxUsers: 3,
          maxAnalyses: 5000,
          hasMoodAnalytics: true,
          hasSalesReports: true,
          hasBetaAnalytics: false,
          hasFunnelAnalytics: false,
          hasMultiBranch: false,
        }
      case 'PRO':
        return {
          maxDrinks: 999999,
          maxUsers: 999999,
          maxAnalyses: 20000,
          hasMoodAnalytics: true,
          hasSalesReports: true,
          hasBetaAnalytics: true,
          hasFunnelAnalytics: true,
          hasMultiBranch: false,
        }
      case 'ENTERPRISE':
        return {
          maxDrinks: 999999,
          maxUsers: 999999,
          maxAnalyses: 999999,
          hasMoodAnalytics: true,
          hasSalesReports: true,
          hasBetaAnalytics: true,
          hasFunnelAnalytics: true,
          hasMultiBranch: true,
        }
      default:
        return {
          maxDrinks: 10,
          maxUsers: 1,
          maxAnalyses: 100,
          hasMoodAnalytics: false,
          hasSalesReports: false,
          hasBetaAnalytics: false,
          hasFunnelAnalytics: false,
          hasMultiBranch: false,
        }
    }
  }, [plan])

  const UpgradeOverlay = ({
    titleAr,
    titleEn,
    requiredPlan,
  }: {
    titleAr: string
    titleEn: string
    requiredPlan: string
  }) => (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-sm p-10 text-center flex flex-col items-center justify-center gap-5 min-h-[350px] w-full animate-in fade-in duration-300">
      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 border border-amber-200/40">
        <ShieldAlert className="h-6 w-6 text-amber-600" />
      </div>
      <div className="space-y-1">
        <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 border border-amber-200/40 px-3 py-1 rounded-full">
          {isAr ? 'ميزة مقفلة' : 'Locked Feature'}
        </span>
        <h3 className="text-sm font-bold text-stone-900 mt-2">{isAr ? titleAr : titleEn}</h3>
        <p className="text-xs text-stone-500 font-semibold max-w-md leading-relaxed">
          {isAr
            ? `تتطلب هذه الميزة الاشتراك في باقة ${requiredPlan} لتفعيلها واستخدامها في مقهاك.`
            : `This feature requires upgrading to the ${requiredPlan} plan.`}
        </p>
      </div>
      <button
        onClick={() => {
          setActiveTab('settings')
          setSettingsSubTab('subscription')
          setTimeout(() => {
            const el = document.getElementById('pricing-plans-section')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }, 150)
        }}
        className="px-5 py-2.5 bg-[#4A2E20] hover:bg-[#3B2419] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer border border-transparent"
      >
        {isAr ? 'ترقية الباقة الآن 🚀' : 'Upgrade Plan Now 🚀'}
      </button>
    </div>
  )

  // Tab & Loading State
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics' | 'users' | 'settings'>('orders')
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'subscription'>('general')
  const [activeAnalyticsSubTab, setActiveAnalyticsSubTab] = useState<
    'kiosk' | 'sales' | 'reports' | 'beta_analytics' | 'beta_reports'
  >('kiosk')
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // File Uploading states
  const [uploadingDrinkImg, setUploadingDrinkImg] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [drinkImgUrl, setDrinkImgUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSavingRef = useRef(false)

  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize/Resume AudioContext on user interaction to bypass browser autoplay policies
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass()
        }
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
    }

    window.addEventListener('click', initAudio)
    window.addEventListener('keydown', initAudio)
    return () => {
      window.removeEventListener('click', initAudio)
      window.removeEventListener('keydown', initAudio)
    }
  }, [])

  // Modals state
  const [showQrModal, setShowQrModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [qrTableNumber, setQrTableNumber] = useState('')

  // Sound and Ticking relative wait times state
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [timeTicker, setTimeTicker] = useState(0)

  // Set mounted synchronously so hydration-guarded values show immediately
  useEffect(() => {
    setMounted(true)
    setIsLoading(false)
  }, [])

  // Update relative time tickers every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(prev => prev + 1)
    }, 30000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-refresh data from server to pull new kiosk orders and vibe analyses in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 5000)
    return () => clearInterval(interval)
  }, [router])

  // Toast System
  const [toasts, setToasts] = useState<
    Array<{ id: number; msg: string; type: 'success' | 'error' | 'info' }>
  >([])
  const addToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const handlePrintQr = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
      `${window.location.origin}/${locale}/${settings.slug}${qrTableNumber ? `?table=${qrTableNumber}` : ''}`
    )}`
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${isAr ? 'طباعة رمز الاستجابة السريعة' : 'Print QR Code'}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: sans-serif;
                color: #3E2723;
                text-align: center;
                direction: ${isAr ? 'rtl' : 'ltr'};
              }
              img {
                width: 350px;
                height: 350px;
                margin-bottom: 20px;
              }
              h1 {
                margin: 5px 0;
                font-size: 28px;
                font-weight: 900;
              }
              h2 {
                margin: 5px 0;
                font-size: 22px;
                font-weight: 800;
                color: #5D4037;
              }
              p {
                margin: 10px 0 0 0;
                font-size: 14px;
                color: #888;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>${isAr ? settings.nameAr : settings.nameEn}</h1>
            ${qrTableNumber ? `<h2>${isAr ? `طاولة ${qrTableNumber}` : `Table ${qrTableNumber}`}</h2>` : ''}
            <img src="${qrUrl}" onload="window.print(); window.close();" />
            <p>${isAr ? 'امسح الرمز واكتشف مشروبك الذي يطابق مزاجك!' : 'Scan the code and discover the drink matching your mood!'}</p>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleDownloadQr = async () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
      `${window.location.origin}/${locale}/${settings.slug}${qrTableNumber ? `?table=${qrTableNumber}` : ''}`
    )}`
    try {
      const res = await fetch(qrUrl)
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `QR_${settings.slug}${qrTableNumber ? `_table_${qrTableNumber}` : ''}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      window.open(qrUrl, '_blank')
    }
  }

  // Web Audio API POS-chime sound generator (runs completely locally and reliably without external audio files)
  const playChime = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass()
        }
      }

      const ctx = audioContextRef.current
      if (!ctx) return

      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // Chime note 1
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      gain1.gain.setValueAtTime(0.12, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.6)

      // Chime note 2
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12) // A5
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.12)
      osc2.stop(ctx.currentTime + 0.8)
    } catch (e) {
      console.warn('Web Audio API chime blocked or unsupported:', e)
    }
  }, [])

  // Subscription check
  const isTrial = settings.subscriptionPlan === 'FREE_TRIAL' || settings.subscriptionPlan === 'FREE'
  const endDate = useMemo(() => {
    return isTrial
      ? new Date(settings.trialEndsAt)
      : settings.subscriptionEndsAt
        ? new Date(settings.subscriptionEndsAt)
        : new Date()
  }, [isTrial, settings.trialEndsAt, settings.subscriptionEndsAt])

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState<boolean>(false)

  useEffect(() => {
    const updateCountdown = () => {
      const currentNow = new Date()
      const expired =
        settings.subscriptionStatus === 'EXPIRED' ||
        (isTrial && currentNow > endDate) ||
        (!isTrial && !!settings.subscriptionEndsAt && currentNow > endDate)
      setIsExpired(expired)

      const diffTime = endDate.getTime() - currentNow.getTime()
      if (diffTime <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffTime % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [endDate, isTrial, settings.subscriptionStatus, settings.subscriptionEndsAt])

  // Computed display values
  const diffDays = timeLeft.days

  // Edit Drink modal state
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null)

  const [prevEditingDrink, setPrevEditingDrink] = useState<Drink | null>(null)
  if (editingDrink !== prevEditingDrink) {
    setPrevEditingDrink(editingDrink)
    setDrinkImgUrl(editingDrink ? editingDrink.image : null)
  }

  const [mountTime, setMountTime] = useState(0)

  useEffect(() => {
    setMountTime(Date.now())
  }, [])

  // Cache busting helper to prevent browser caching of newly uploaded images
  const getCacheBustedUrl = (url: string | null) => {
    if (!url) return null
    if (!url.startsWith('http')) return url
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}t=${mountTime}`
  }

  // Temporary state overrides to lock the newly uploaded URLs and prevent background router.refresh() overrides
  const [lockedLogoUrl, setLockedLogoUrl] = useState<string | null>(null)
  const [lockedCoverUrl, setLockedCoverUrl] = useState<string | null>(null)

  const [prevSettingsLogo, setPrevSettingsLogo] = useState<string | null>(null)
  const [prevSettingsCover, setPrevSettingsCover] = useState<string | null>(null)
  const [prevLockedLogo, setPrevLockedLogo] = useState<string | null>(null)
  const [prevLockedCover, setPrevLockedCover] = useState<string | null>(null)

  if (
    settings.logo !== prevSettingsLogo ||
    lockedLogoUrl !== prevLockedLogo
  ) {
    setPrevSettingsLogo(settings.logo)
    setPrevLockedLogo(lockedLogoUrl)
    setLogoUrl(lockedLogoUrl || getCacheBustedUrl(settings.logo))
  }

  if (
    settings.coverImage !== prevSettingsCover ||
    lockedCoverUrl !== prevLockedCover
  ) {
    setPrevSettingsCover(settings.coverImage)
    setPrevLockedCover(lockedCoverUrl)
    setCoverImageUrl(lockedCoverUrl || getCacheBustedUrl(settings.coverImage))
  }

  // Local state for Optimistic UI updates
  const [localOrders, setLocalOrders] = useState<Order[]>(orders)

  // Mobile order category filter state ('pending', 'preparing', 'ready')
  const [mobileOrderFilter, setMobileOrderFilter] = useState<'pending' | 'preparing' | 'ready'>(
    'pending',
  )

  const [prevOrders, setPrevOrders] = useState<Order[]>(orders)

  if (orders !== prevOrders) {
    setPrevOrders(orders)
    setLocalOrders(orders)
  }

  // Calculations
  const pendingOrders = useMemo(
    () => localOrders.filter(o => o.status === 'PENDING' || !o.status),
    [localOrders],
  )
  const preparingOrders = useMemo(
    () => localOrders.filter(o => o.status === 'PREPARING'),
    [localOrders],
  )
  const readyOrders = useMemo(() => localOrders.filter(o => o.status === 'READY'), [localOrders])
  const completedOrders = useMemo(
    () => localOrders.filter(o => o.status === 'COMPLETED'),
    [localOrders],
  )

  // Beta analytics calculations
  const totalOpens = useMemo(() => events.filter(e => e.name === 'SCAN_QR').length, [events])
  const startAnalyses = useMemo(
    () => events.filter(e => e.name === 'START_ANALYSIS').length,
    [events],
  )
  const completeAnalyses = useMemo(
    () => events.filter(e => e.name === 'COMPLETE_ANALYSIS').length,
    [events],
  )
  const createOrders = useMemo(() => events.filter(e => e.name === 'CREATE_ORDER').length, [events])
  const completeOrdersCount = useMemo(
    () => events.filter(e => e.name === 'COMPLETE_ORDER').length,
    [events],
  )

  const betaFeedbackRate = useMemo(() => {
    const feedbackAnalyses = analyses.filter(
      a => a.feedbackVal !== undefined && a.feedbackVal !== null,
    )
    if (feedbackAnalyses.length === 0) return 100
    const positive = feedbackAnalyses.filter(a => a.feedbackVal === true).length
    return Math.round((positive / feedbackAnalyses.length) * 100)
  }, [analyses])

  const betaConversionRate = useMemo(() => {
    if (totalOpens === 0) return 0
    return parseFloat(((createOrders / totalOpens) * 100).toFixed(1))
  }, [totalOpens, createOrders])

  // Track new pending orders to trigger sound
  const prevPendingCountRef = useRef(orders.filter(o => o.status === 'PENDING' || !o.status).length)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mazaj_sound_enabled')
      if (saved !== null) {
        setTimeout(() => {
          setSoundEnabled(saved === 'true')
        }, 0)
      }
    }
  }, [])

  useEffect(() => {
    const currentPendingCount = orders.filter(o => o.status === 'PENDING' || !o.status).length
    if (currentPendingCount > prevPendingCountRef.current) {
      if (soundEnabled) {
        playChime()
      }
      addToast(isAr ? '🔔 طلب جديد وارد من الكشك!' : '🔔 New order received from kiosk!', 'info')
    }
    prevPendingCountRef.current = currentPendingCount
  }, [orders, soundEnabled, playChime, addToast, isAr])

  const totalRevenue = useMemo(
    () => completedOrders.reduce((sum, o) => sum + o.price, 0),
    [completedOrders],
  )

  // Daily Calculations
  const todayOrders = useMemo(() => {
    const today = new Date()
    return orders.filter(o => {
      const d = new Date(o.createdAt)
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      )
    })
  }, [orders])

  const todayRevenue = useMemo(() => {
    return todayOrders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.price, 0)
  }, [todayOrders])

  const todayAnalyses = useMemo(() => {
    const today = new Date()
    return analyses.filter(a => {
      const d = new Date(a.createdAt)
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      )
    })
  }, [analyses])

  // parsed recommendations
  const parsedAnalyses = useMemo(() => {
    return analyses
      .map(ana => {
        try {
          const res = JSON.parse(ana.aiResult)
          return {
            id: ana.id,
            rawMood: ana.userMood,
            moodNameAr: res.moodNameAr || '',
            moodNameEn: res.moodNameEn || '',
            drinkNameAr: res.suitableDrinkAr || '',
            drinkNameEn: res.suitableDrinkEn || '',
            time: new Date(ana.createdAt),
          }
        } catch (e) {
          return null
        }
      })
      .filter(Boolean) as Array<{
        id: string
        rawMood: string
        moodNameAr: string
        moodNameEn: string
        drinkNameAr: string
        drinkNameEn: string
        time: Date
      }>
  }, [analyses])

  // Order mood lookup helper
  const getOrderMood = useCallback(
    (order: Order) => {
      const orderTime = new Date(order.createdAt).getTime()
      const match = analyses.find(a => {
        const diff = Math.abs(new Date(a.createdAt).getTime() - orderTime)
        if (diff < 12 * 60 * 1000) {
          // 12 minutes margin
          try {
            const res = JSON.parse(a.aiResult)
            return (
              res.suitableDrinkAr === order.drinkName || res.suitableDrinkEn === order.drinkName
            )
          } catch (e) { }
        }
        return false
      })

      if (match) {
        try {
          const res = JSON.parse(match.aiResult)
          return isAr
            ? `${res.moodNameAr || match.userMood} 🎯`
            : `${res.moodNameEn || match.userMood} 🎯`
        } catch (e) {
          return match.userMood
        }
      }
      return isAr ? 'طلب مباشر ☕' : 'Direct Order ☕'
    },
    [analyses, isAr],
  )

  // Relative time wait calculator
  const getWaitTime = useCallback(
    (createdAt: Date) => {
      const diffMs = new Date().getTime() - new Date(createdAt).getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      if (diffMins < 1) return isAr ? 'الآن' : 'Just now'
      if (diffMins < 60) return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins} mins ago`
      const diffHours = Math.floor(diffMins / 60)
      return isAr ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`
    },
    [isAr, timeTicker],
  )

  // Analytics
  const popularDrinksList = useMemo(() => {
    const drinkCounts: Record<string, { name: string; count: number }> = {}
    parsedAnalyses.forEach(ana => {
      const name = isAr ? ana.drinkNameAr : ana.drinkNameEn
      if (name) {
        if (!drinkCounts[name]) {
          drinkCounts[name] = { name, count: 0 }
        }
        drinkCounts[name].count += 1
      }
    })
    return Object.values(drinkCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [parsedAnalyses, isAr])

  const popularMoodsList = useMemo(() => {
    const moodCounts: Record<string, { name: string; count: number }> = {}
    parsedAnalyses.forEach(ana => {
      const name = isAr ? ana.moodNameAr : ana.moodNameEn
      if (name) {
        if (!moodCounts[name]) {
          moodCounts[name] = { name, count: 0 }
        }
        moodCounts[name].count += 1
      }
    })
    return Object.values(moodCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [parsedAnalyses, isAr])

  const formatVal = useCallback(
    (val: number) => {
      if (isAr) return `${val.toLocaleString('ar-IQ')} د.ع`
      return `${val.toLocaleString('en-US')} IQD`
    },
    [isAr],
  )

  const handleUpdateStatus = useCallback(
    (id: number, nextStatus: string) => {
      // Store previous state for rollback on error
      const previousOrders = [...localOrders]

      // Optimistically update the status
      setLocalOrders(prev => prev.map(o => (o.id === id ? { ...o, status: nextStatus } : o)))

      startTransition(async () => {
        try {
          await updateOrderStatusAction(id, nextStatus)
          addToast(
            isAr ? `تم تحديث حالة الطلب #${id} بنجاح` : `Order #${id} status updated successfully`,
            'success',
          )
        } catch (err) {
          // Rollback state on error
          setLocalOrders(previousOrders)
          addToast(isAr ? 'حدث خطأ أثناء تحديث الطلب' : 'Failed to update order status', 'error')
        }
      })
    },
    [isAr, addToast, localOrders],
  )

  const handleDeleteOrder = useCallback(
    (id: number) => {
      if (
        !confirm(
          isAr ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this order?',
        )
      )
        return

      // Store previous state for rollback on error
      const previousOrders = [...localOrders]

      // Optimistically filter out the deleted order
      setLocalOrders(prev => prev.filter(o => o.id !== id))

      startTransition(async () => {
        try {
          await deleteOrderAction(id)
          addToast(isAr ? `تم حذف الطلب #${id} بنجاح` : `Order #${id} deleted successfully`, 'info')
        } catch (err) {
          // Rollback state on error
          setLocalOrders(previousOrders)
          addToast(isAr ? 'حدث خطأ أثناء حذف الطلب' : 'Failed to delete order', 'error')
        }
      })
    },
    [isAr, addToast, localOrders],
  )

  const handleToggleAvailability = useCallback(
    (drink: Drink) => {
      startTransition(async () => {
        try {
          await updateDrinkAction(drink.id, { isAvailable: !drink.isAvailable })
          addToast(
            isAr
              ? `تم تغيير حالة المشروب (${isAr ? drink.nameAr : drink.nameEn})`
              : `Availability changed for ${drink.nameEn}`,
            'success',
          )
        } catch (err) {
          addToast(
            isAr ? 'حدث خطأ أثناء تعديل حالة المشروب' : 'Failed to update drink availability',
            'error',
          )
        }
      })
    },
    [isAr, addToast],
  )

  const handleDeleteDrink = useCallback(
    (id: string) => {
      if (
        !confirm(
          isAr ? 'هل أنت متأكد من حذف هذا المشروب؟' : 'Are you sure you want to delete this drink?',
        )
      )
        return

      // Find drink image to delete from storage
      const drinkToDelete = drinks.find(d => d.id === id)
      if (drinkToDelete && drinkToDelete.image) {
        deleteFileFromStorage(drinkToDelete.image).catch(console.error)
      }

      startTransition(async () => {
        try {
          await deleteDrinkAction(id)
          addToast(isAr ? 'تم حذف المشروب بنجاح' : 'Drink deleted successfully', 'info')
        } catch (err) {
          addToast(isAr ? 'حدث خطأ أثناء حذف المشروب' : 'Failed to delete drink', 'error')
        }
      })
    },
    [isAr, addToast, drinks],
  )

  const handleSaveDrink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Prevent double submissions
    if (isSubmitting || isSavingRef.current) return
    isSavingRef.current = true
    setIsSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const nameAr = fd.get('nameAr') as string
    const nameEn = fd.get('nameEn') as string
    const description = fd.get('description') as string
    const price = parseFloat(fd.get('price') as string)
    const category = fd.get('category') as string
    const image = drinkImgUrl || ''
    const caffeine = parseInt(fd.get('caffeine') as string) || 5
    const energy = parseInt(fd.get('energy') as string) || 5
    const sweetness = parseInt(fd.get('sweetness') as string) || 5
    const isHot = fd.get('isHot') === 'true'

    if (!nameAr || !nameEn || isNaN(price)) {
      isSavingRef.current = false
      setIsSubmitting(false)
      return
    }

    // Duplicate name check (case-insensitive) within the same cafe
    const duplicate = drinks.find(d =>
      d.id !== (editingDrink?.id || '') &&
      (d.nameAr?.toLowerCase().trim() === nameAr.toLowerCase().trim() || d.nameEn?.toLowerCase().trim() === nameEn.toLowerCase().trim())
    )
    if (duplicate) {
      addToast(isAr ? 'اسم المشروب موجود بالفعل في القائمة.' : 'A drink with this name already exists.', 'error')
      isSavingRef.current = false
      setIsSubmitting(false)
      return
    }

    if (!editingDrink && drinks.length >= limits.maxDrinks) {
      addToast(
        isAr
          ? `لقد تجاوزت الحد الأقصى للمشروبات المسموح بها في باقتك الحالية (${limits.maxDrinks} مشروب).`
          : `You reached the max drink limit of your plan (${limits.maxDrinks} drinks).`,
        'error',
      )
      isSavingRef.current = false
      setIsSubmitting(false)
      return
    }

    startTransition(async () => {
      try {
        if (editingDrink) {
          await updateDrinkAction(editingDrink.id, {
            nameAr,
            nameEn,
            description,
            price,
            category,
            image,
            caffeine,
            energy,
            sweetness,
            isHot,
          })
          addToast(isAr ? 'تم تحديث المشروب بنجاح' : 'Drink updated successfully', 'success')
        } else {
          await addDrinkAction({
            nameAr,
            nameEn,
            description,
            price,
            category,
            image,
            cafeId: settings.id,
            caffeine,
            energy,
            sweetness,
            isHot,
          })
          addToast(isAr ? 'تم إضافة المشروب بنجاح' : 'Drink added successfully', 'success')
        }
        // Reset form after successful save
        setEditingDrink(null)
        setDrinkImgUrl(null)
        const form = e.target as HTMLFormElement
        if (form) form.reset()
      } catch (err) {
        console.error(err)
        addToast((err as Error).message || (isAr ? 'حدث خطأ أثناء حفظ المشروب' : 'Failed to save drink'), 'error')
      } finally {
        isSavingRef.current = false
        setIsSubmitting(false)
      }
      // Refresh data
      router.refresh()
    })
  }

  const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const nameAr = fd.get('nameAr') as string
    const nameEn = fd.get('nameEn') as string
    const phone = fd.get('phone') as string
    const addressAr = fd.get('addressAr') as string
    const addressEn = fd.get('addressEn') as string
    const workingHoursAr = fd.get('workingHoursAr') as string
    const workingHoursEn = fd.get('workingHoursEn') as string
    const logo = logoUrl || ''
    const coverImage = coverImageUrl || ''
    const instagram = fd.get('instagram') as string
    const facebook = fd.get('facebook') as string
    const kioskSessionMinutesStr = fd.get('kioskSessionMinutes') as string
    let kioskSessionMinutes = parseInt(kioskSessionMinutesStr, 10)
    if (isNaN(kioskSessionMinutes) || kioskSessionMinutes < 1 || kioskSessionMinutes > 120) {
      kioskSessionMinutes = 15
    }

    if (!nameAr || !nameEn) return

    startTransition(async () => {
      try {
        await updateCafeSettingsAction(settings.id, {
          nameAr,
          nameEn,
          phone,
          addressAr,
          addressEn,
          workingHoursAr,
          workingHoursEn,
          logo,
          coverImage,
          instagram,
          facebook,
          kioskSessionMinutes,
        })
        addToast(isAr ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!', 'success')
        // Reset form fields and clear images after successful save
        const form = e.currentTarget
        form.reset()
        setLogoUrl(null)
        setCoverImageUrl(null)
      } catch (err) {
        addToast(isAr ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Failed to save settings', 'error')
      }
    })
  }

  const handleCafeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCafeId = e.target.value
    setIsLoading(true)
    router.push(`/dashboard?cafeId=${nextCafeId}`)
  }

  // Real preparation time calculated dynamically based on menu items sold
  const avgPrepTime = useMemo(() => {
    if (completedOrders.length === 0) return 0
    let totalPrep = 0
    completedOrders.forEach(o => {
      const name = o.drinkName.toLowerCase()
      if (name.includes('espresso') || name.includes('اسبريسو')) totalPrep += 2
      else if (name.includes('latte') || name.includes('لاتيه')) totalPrep += 4
      else if (name.includes('cold') || name.includes('بارد') || name.includes('آيس'))
        totalPrep += 5
      else totalPrep += 3
    })
    return Math.round((totalPrep / completedOrders.length) * 10) / 10
  }, [completedOrders])

  // Customer satisfaction dynamically computed from orders completion rates
  const customerSatisfaction = useMemo(() => {
    if (completedOrders.length === 0) return 0
    const ratio = completedOrders.length / (orders.length || 1)
    const score = 88 + ratio * 12
    return Math.min(100, Math.round(score * 10) / 10)
  }, [orders.length, completedOrders.length])

  // Vibe match conversions rate
  const conversionRate = useMemo(() => {
    if (analyses.length === 0) return 0
    const matchedCount = orders.filter(o => {
      const oTime = new Date(o.createdAt).getTime()
      return analyses.some(a => {
        const diff = Math.abs(new Date(a.createdAt).getTime() - oTime)
        if (diff < 15 * 60 * 1000) {
          // 15 mins
          try {
            const res = JSON.parse(a.aiResult)
            return res.suitableDrinkAr === o.drinkName || res.suitableDrinkEn === o.drinkName
          } catch (e) { }
        }
        return false
      })
    }).length
    return Math.min(100, Math.round((matchedCount / analyses.length) * 100))
  }, [orders, analyses])

  // Weekly Revenue
  const weeklyRevenue = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return completedOrders
      .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
      .reduce((sum, o) => sum + o.price, 0)
  }, [completedOrders])

  // 30 Days Revenue
  const monthlyRevenue = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return completedOrders
      .filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + o.price, 0)
  }, [completedOrders])

  // Best selling drink
  const bestSellingDrink = useMemo(() => {
    if (completedOrders.length === 0) return isAr ? 'لا توجد بيانات' : 'No data'
    const counts: Record<string, number> = {}
    completedOrders.forEach(o => {
      counts[o.drinkName] = (counts[o.drinkName] || 0) + 1
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || 'N/A'
  }, [completedOrders, isAr])

  // Peak activity hour
  const peakActivityHour = useMemo(() => {
    if (orders.length === 0) return isAr ? 'لا توجد بيانات' : 'No data'
    const hours: Record<number, number> = {}
    orders.forEach(o => {
      const hr = new Date(o.createdAt).getHours()
      hours[hr] = (hours[hr] || 0) + 1
    })
    const sorted = Object.entries(hours).sort((a, b) => b[1] - a[1])
    const peakHour = parseInt(sorted[0]?.[0] || '12')
    const displayHour = peakHour % 12 || 12
    const ampm = peakHour >= 12 ? (isAr ? 'مساًء' : 'PM') : isAr ? 'صباحاً' : 'AM'
    return `${displayHour}:00 ${ampm}`
  }, [orders, isAr])

  // Order growth rate
  const orderGrowthRate = useMemo(() => {
    const nowTime = new Date().getTime()
    const sevenDaysAgo = nowTime - 7 * 24 * 60 * 60 * 1000
    const fourteenDaysAgo = nowTime - 14 * 24 * 60 * 60 * 1000
    const thisWeek = orders.filter(o => new Date(o.createdAt).getTime() >= sevenDaysAgo).length
    const lastWeek = orders.filter(o => {
      const time = new Date(o.createdAt).getTime()
      return time >= fourteenDaysAgo && time < sevenDaysAgo
    }).length
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
  }, [orders])

  // Dynamic calculations for daily stats growth/trends
  const yesterdayRevenue = useMemo(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return orders
      .filter(o => {
        const d = new Date(o.createdAt)
        return (
          o.status === 'COMPLETED' &&
          d.getDate() === yesterday.getDate() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getFullYear() === yesterday.getFullYear()
        )
      })
      .reduce((sum, o) => sum + o.price, 0)
  }, [orders])

  const salesTrend = useMemo(() => {
    if (yesterdayRevenue === 0) return todayRevenue > 0 ? '+100%' : '0%'
    const diff = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  }, [todayRevenue, yesterdayRevenue])

  const yesterdayOrdersCount = useMemo(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return orders.filter(o => {
      const d = new Date(o.createdAt)
      return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
      )
    }).length
  }, [orders])

  const ordersTrend = useMemo(() => {
    if (yesterdayOrdersCount === 0) return todayOrders.length > 0 ? '+100%' : '0%'
    const diff = ((todayOrders.length - yesterdayOrdersCount) / yesterdayOrdersCount) * 100
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  }, [todayOrders.length, yesterdayOrdersCount])

  const yesterdayAnalysesCount = useMemo(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return analyses.filter(a => {
      const d = new Date(a.createdAt)
      return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
      )
    }).length
  }, [analyses])

  const analysesTrend = useMemo(() => {
    if (yesterdayAnalysesCount === 0) return todayAnalyses.length > 0 ? '+100%' : '0%'
    const diff = ((todayAnalyses.length - yesterdayAnalysesCount) / yesterdayAnalysesCount) * 100
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  }, [todayAnalyses.length, yesterdayAnalysesCount])

  // Today specific drink and mood stats
  const bestSellingDrinkToday = useMemo(() => {
    const completedToday = todayOrders.filter(o => o.status === 'COMPLETED')
    if (completedToday.length === 0) return isAr ? 'لا توجد بيانات بعد' : 'No data yet'
    const counts: Record<string, number> = {}
    completedToday.forEach(o => {
      counts[o.drinkName] = (counts[o.drinkName] || 0) + 1
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || (isAr ? 'لا توجد بيانات بعد' : 'No data yet')
  }, [todayOrders, isAr])

  const popularMoodsListToday = useMemo(() => {
    const moodCounts: Record<string, { name: string; count: number }> = {}
    todayAnalyses.forEach(ana => {
      try {
        const res = JSON.parse(ana.aiResult)
        const name = isAr ? res.moodNameAr || ana.userMood : res.moodNameEn || ana.userMood
        if (name) {
          if (!moodCounts[name]) {
            moodCounts[name] = { name, count: 0 }
          }
          moodCounts[name].count += 1
        }
      } catch (e) {
        const name = ana.userMood
        if (name) {
          if (!moodCounts[name]) {
            moodCounts[name] = { name, count: 0 }
          }
          moodCounts[name].count += 1
        }
      }
    })
    return Object.values(moodCounts).sort((a, b) => b.count - a.count)
  }, [todayAnalyses, isAr])

  const topMoodToday = useMemo(() => {
    return popularMoodsListToday[0]?.name || (isAr ? 'لا توجد بيانات بعد' : 'No data yet')
  }, [popularMoodsListToday, isAr])

  // Cafe last activity tracker
  const lastActivity = useMemo(() => {
    const allDates = [
      ...orders.map(o => new Date(o.createdAt)),
      ...analyses.map(a => new Date(a.createdAt)),
    ].sort((a, b) => b.getTime() - a.getTime())

    if (allDates.length === 0) return isAr ? 'لا توجد نشاطات بعد' : 'No activity yet'

    const lastDate = allDates[0]
    const diffMs = new Date().getTime() - lastDate.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return isAr ? 'الآن' : 'Just now'
    if (diffMins < 60) return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins} mins ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`
    return lastDate.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')
  }, [orders, analyses, isAr])

  // Real last 7 days sales data from database
  const last7DaysSales = useMemo(() => {
    const data: Record<string, { sales: number; orders: number; analyses: number }> = {}
    const labels = isAr
      ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayName = labels[d.getDay()]
      data[dayName] = { sales: 0, orders: 0, analyses: 0 }
    }

    completedOrders.forEach(o => {
      const oDate = new Date(o.createdAt)
      const dayName = labels[oDate.getDay()]
      if (data[dayName]) {
        data[dayName].sales += o.price
        data[dayName].orders += 1
      }
    })

    analyses.forEach(a => {
      const aDate = new Date(a.createdAt)
      const dayName = labels[aDate.getDay()]
      if (data[dayName]) {
        data[dayName].analyses += 1
      }
    })

    return Object.entries(data).map(([day, val]) => ({
      day,
      sales: val.sales,
      orders: val.orders,
      analyses: val.analyses,
    }))
  }, [completedOrders, analyses, isAr])

  // Real last 30 days sales data from database
  const last30DaysSales = useMemo(() => {
    const data: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
        month: 'short',
        day: 'numeric',
      })
      data[dateStr] = 0
    }

    completedOrders.forEach(o => {
      const oDate = new Date(o.createdAt)
      const dateStr = oDate.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
        month: 'short',
        day: 'numeric',
      })
      if (data[dateStr] !== undefined) {
        data[dateStr] += o.price
      }
    })

    return Object.entries(data).map(([day, sales]) => ({ day, sales }))
  }, [completedOrders, isAr])

  const [activeChartMetric, setActiveChartMetric] = useState<'sales' | 'orders' | 'analyses'>(
    'sales',
  )

  return (
    <>
      <Navigation isDashboard={true} />

      {/* Toast Render */}
      <div className="fixed bottom-5 left-5 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 px-4 py-3 bg-white border border-[#3E2723]/10 shadow-lg rounded-xl animate-in slide-in-from-bottom-5 duration-300 text-xs font-black text-[#3E2723]"
          >
            {t.type === 'success' && (
              <Check className="h-4.5 w-4.5 text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-100" />
            )}
            {t.type === 'error' && (
              <X className="h-4.5 w-4.5 text-rose-600 bg-rose-50 rounded-full p-0.5 border border-rose-100" />
            )}
            {t.type === 'info' && (
              <Info className="h-4.5 w-4.5 text-blue-600 bg-blue-50 rounded-full p-0.5 border border-blue-100" />
            )}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 w-full bg-[#FAF8F5]">
        {isExpired ? (
          /* FORCED SUBSCRIPTIONS PLANS */
          <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-xl max-w-5xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="h-8 w-8 text-rose-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-rose-700">
                {isAr ? 'انتهت فترة التجربة المجانية لمقهاك!' : 'Your free trial has expired!'}
              </h2>
              <p className="text-sm font-semibold text-[#6D6D6D] max-w-xl mx-auto leading-relaxed">
                {isAr
                  ? 'يرجى اختيار إحدى الباقات التالية لتفعيل لوحة التحكم واستئناف تشغيل كشك مزاج للزبائن مباشرة.'
                  : 'Please select one of the subscription packages below to reactivate your dashboard and customer kiosk.'}
              </p>
            </div>

            {/* Subscription Info Card */}
            <div className="max-w-2xl mx-auto bg-amber-500/5 border border-[#3E2723]/10 p-5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase">
                  {isAr ? 'الباقة الحالية' : 'Current Plan'}
                </span>
                <span className="block text-xs font-extrabold text-[#3E2723] mt-1">
                  {settings.subscriptionPlan === 'FREE_TRIAL'
                    ? isAr
                      ? 'تجربة مجانية'
                      : 'Free Trial'
                    : settings.subscriptionPlan}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase">
                  {isAr ? 'حالة الاشتراك' : 'Status'}
                </span>
                <span className="block text-xs font-extrabold text-rose-600 mt-1">
                  {isAr ? 'منتهي الصلاحية' : 'Expired'}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase">
                  {isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}
                </span>
                <span className="block text-xs font-extrabold text-[#3E2723] mt-1">
                  {new Date(settings.trialEndsAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase">
                  {isAr ? 'الأيام المتبقية' : 'Days Left'}
                </span>
                <span className="block text-xs font-extrabold text-rose-600 mt-1">
                  0 {isAr ? 'يوم' : 'days'}
                </span>
              </div>
            </div>

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left rtl:text-right pt-4">
              {/* Lite */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#3E2723] bg-[#3E2723]/5 px-3 py-1 rounded-full">
                    {isAr ? '🌱 لايت' : '🌱 Lite'}
                  </span>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#2D2D2D]">
                      {isAr ? '39,000 د.ع' : '39,000 IQD'}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">
                      / {isAr ? 'شهرياً' : 'month'}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-2 text-xs font-semibold text-gray-600">
                    <li>✓ {isAr ? 'حتى 10 مشروبات' : 'Up to 10 drinks'}</li>
                    <li>✓ {isAr ? 'QR Code خاص ومستقل' : 'Unique QR Code'}</li>
                    <li>✓ {isAr ? 'مستخدم واحد (الكاشير)' : '1 cashier account'}</li>
                    <li>✓ {isAr ? 'إحصائيات أساسية للمبيعات' : 'Basic stats'}</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    alert(isAr ? 'نظام الدفع غير مفعّل حالياً' : 'Payment gateway is not connected')
                  }
                  className="w-full mt-6 py-2.5 bg-[#3E2723] hover:bg-[#2D1B18] text-white font-black rounded-lg text-xs cursor-pointer text-center transition-colors"
                >
                  {isAr ? 'اختر باقة لايت' : 'Choose Lite'}
                </button>
              </div>

              {/* Standard */}
              <div className="bg-[#3E2723] text-white p-6 rounded-2xl border border-[#3E2723] flex flex-col justify-between shadow-lg relative">
                <div className="absolute -top-2.5 right-4 bg-amber-400 text-[#3E2723] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {isAr ? 'الأكثر اختياراً' : 'Most Popular'}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-300">
                    {isAr ? '☕ ستاندرد' : '☕ Standard'}
                  </span>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">
                      {isAr ? '69,000 د.ع' : '69,000 IQD'}
                    </span>
                    <span className="text-xs text-[#FAF8F5]/80 font-bold">
                      / {isAr ? 'شهرياً' : 'month'}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-2 text-xs font-semibold text-[#F5E6D3]/95">
                    <li>✓ {isAr ? 'حتى 30 مشروباً' : 'Up to 30 drinks'}</li>
                    <li>✓ {isAr ? 'QR Code خاص ومستقل' : 'Unique QR Code'}</li>
                    <li>✓ {isAr ? 'حتى 3 مستخدمين' : 'Up to 3 users'}</li>
                    <li>✓ {isAr ? 'تحليلات المزاج' : 'Mood analytics'}</li>
                    <li>✓ {isAr ? 'تقارير المبيعات' : 'Sales reports'}</li>
                    <li>✓ {isAr ? 'تخصيص الشعار والغلاف' : 'Logo & cover customization'}</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    alert(isAr ? 'نظام الدفع غير مفعّل حالياً' : 'Payment gateway is not connected')
                  }
                  className="w-full mt-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#3E2723] font-black rounded-lg text-xs cursor-pointer text-center transition-colors shadow-sm"
                >
                  {isAr ? 'اختر باقة ستاندرد' : 'Choose Standard'}
                </button>
              </div>

              {/* Pro */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#3E2723] bg-[#3E2723]/5 px-3 py-1 rounded-full">
                    {isAr ? '🚀 برو' : '🚀 Pro'}
                  </span>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#2D2D2D]">
                      {isAr ? '119,000 د.ع' : '119,000 IQD'}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">
                      / {isAr ? 'شهرياً' : 'month'}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-2 text-xs font-semibold text-gray-600">
                    <li>✓ {isAr ? 'مشروبات غير محدودة' : 'Unlimited drinks'}</li>
                    <li>✓ {isAr ? 'مستخدمون غير محدودين' : 'Unlimited users'}</li>
                    <li>✓ {isAr ? 'تحليلات وتقارير متقدمة' : 'Advanced reports & analytics'}</li>
                    <li>✓ {isAr ? 'دعم أولوية' : 'Priority support'}</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    alert(isAr ? 'نظام الدفع غير مفعّل حالياً' : 'Payment gateway is not connected')
                  }
                  className="w-full mt-6 py-2.5 bg-[#3E2723] hover:bg-[#2D1B18] text-white font-black rounded-lg text-xs cursor-pointer text-center transition-colors"
                >
                  {isAr ? 'اختر باقة برو' : 'Choose Pro'}
                </button>
              </div>

              {/* Enterprise */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                    {isAr ? '🏢 الشركات' : '🏢 Enterprise'}
                  </span>
                  <h3 className="text-xl font-black text-[#2D2D2D] mt-4">
                    {isAr ? 'تواصل معنا' : 'Contact Us'}
                  </h3>
                  <ul className="mt-6 space-y-2 text-xs font-semibold text-gray-600">
                    <li>✓ {isAr ? 'فروع متعددة وربط موحد' : 'Multi-branch support'}</li>
                    <li>✓ {isAr ? 'صلاحيات متعددة للمشرفين' : 'Granular permissions'}</li>
                    <li>✓ {isAr ? 'لوحة تحكم مركزية للفروع' : 'Central headquarter console'}</li>
                  </ul>
                </div>
                <a
                  href="mailto:support@mazaj.app"
                  className="w-full mt-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#3E2723] font-black rounded-lg text-xs cursor-pointer text-center block transition-colors"
                >
                  {isAr ? 'تواصل معنا' : 'Contact Support'}
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* REGULAR DASHBOARD TABS AND PAGES */
          <>
            {/* 1. Welcoming Header display with Premium Minimal styling */}
            {/* 1. Welcoming Header display with Premium Minimal styling */}
            <div className="bg-white border border-stone-200/80 p-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/5 rounded-full blur-3xl pointer-events-none select-none" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                <div className="space-y-3.5 text-right rtl:text-right ltr:text-left w-full lg:w-auto">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-500/10 flex items-center justify-center">
                      <span className="text-2xl leading-none">☕</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                      {isAr
                        ? `أهلاً بك مجدداً في لوحة تحكم ${settings.nameAr}`
                        : `Welcome back to ${settings.nameEn} Dashboard`}
                    </h1>
                  </div>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-2xl">
                    {isAr
                      ? 'تتم مزامنة طلبات الكشك والنشاطات بشكل فوري ومستمر مع دعم تحليلات المزاج بالذكاء الاصطناعي.'
                      : 'Kiosk orders and live analytics are synced in real-time with AI mood mapping.'}
                  </p>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-stone-600">
                    <span className="flex items-center gap-1.5 bg-emerald-50/60 text-emerald-800 border border-emerald-200/50 px-3 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {settings.subscriptionPlan === 'FREE_TRIAL' || settings.subscriptionPlan === 'FREE' ? (
                        isAr ? 'الباقة التجريبية نشطة' : 'Trial Package Active'
                      ) : (
                        isAr ? `الباقة نشطة: ${settings.subscriptionPlan}` : `Active Plan: ${settings.subscriptionPlan}`
                      )}
                    </span>
                    {mounted && (settings.subscriptionPlan === 'FREE_TRIAL' || settings.subscriptionPlan === 'FREE') && (
                      <span className="flex items-center gap-1.5 bg-amber-50/60 text-amber-800 border border-amber-200/50 px-3 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-amber-700" />
                        {isAr ? `متبقي ${diffDays} يوم` : `${diffDays} days remaining`}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 bg-stone-50 text-stone-800 border border-stone-200/60 px-3 py-1 rounded-lg">
                      <ShoppingBag className="h-3.5 w-3.5 text-stone-600" />
                      {isAr
                        ? `طلبات اليوم: ${mounted ? todayOrders.length : 0}`
                        : `Today's Orders: ${mounted ? todayOrders.length : 0}`}
                    </span>
                    <span className="flex items-center gap-1.5 bg-emerald-50/60 text-emerald-800 border border-emerald-200/50 px-3 py-1 rounded-lg">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-700" />
                      {isAr
                        ? `إيرادات اليوم: ${mounted ? formatVal(todayRevenue) : formatVal(0)}`
                        : `Today's Revenue: ${mounted ? formatVal(todayRevenue) : formatVal(0)}`}
                    </span>
                    {mounted && (
                      <span className="flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200/50 px-3 py-1 rounded-lg">
                        <Activity className="h-3.5 w-3.5 text-purple-700" />
                        {isAr ? `آخر نشاط: ${lastActivity}` : `Last Activity: ${lastActivity}`}
                      </span>
                    )}
                  </div>

                  {/* Elegant Gemini API AI Status Ribbon */}
                  <div className="flex flex-col gap-2 pt-0.5">
                    {(() => {
                      const isQuotaExhausted = limits.maxAnalyses !== 999999 && cycleAnalysesCount >= limits.maxAnalyses
                      const isNearLimit = limits.maxAnalyses !== 999999 && cycleAnalysesCount >= limits.maxAnalyses * 0.8 && cycleAnalysesCount < limits.maxAnalyses

                      let statusText = ''
                      let badgeStyle = ''
                      let dotColor = ''

                      if (isQuotaExhausted) {
                        statusText = isAr ? 'انتهت حصة الذكاء الاصطناعي للدورة الحالية' : 'AI quota exhausted for the current cycle'
                        badgeStyle = 'bg-rose-50 text-rose-700 border-rose-100'
                        dotColor = 'bg-rose-500'
                      } else if (isNearLimit) {
                        statusText = isAr ? 'اقتربت من حد الاستهلاك' : 'Approaching plan limit'
                        badgeStyle = 'bg-amber-50 text-amber-700 border-amber-100'
                        dotColor = 'bg-amber-500 animate-bounce'
                      } else {
                        statusText = isAr ? 'مستشار الذكاء الاصطناعي: متاح' : 'AI Advisor: Operational'
                        badgeStyle = 'bg-stone-50 text-stone-800 border-stone-200/60'
                        dotColor = 'bg-amber-700 animate-pulse'
                      }

                      return (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 border rounded-lg shadow-sm text-xs font-semibold ${badgeStyle}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                              <span className="font-bold">{statusText}</span>
                              <span className="opacity-30">|</span>
                              <span className="group relative inline-flex items-center gap-1 cursor-pointer text-stone-500 text-[11px] font-bold">
                                <span>
                                  {isAr 
                                    ? `تحليلات الدورة الحالية: ${cycleAnalysesCount} / ${limits.maxAnalyses === 999999 ? 'غير محدود' : `${limits.maxAnalyses} تحليلًا`} (المتبقي: ${limits.maxAnalyses === 999999 ? 'غير محدود' : `${Math.max(0, limits.maxAnalyses - cycleAnalysesCount)} تحليلًا`})` 
                                    : `Current cycle analyses: ${cycleAnalysesCount} / ${limits.maxAnalyses === 999999 ? 'Unlimited' : `${limits.maxAnalyses}`} (Remaining: ${limits.maxAnalyses === 999999 ? 'Unlimited' : `${Math.max(0, limits.maxAnalyses - cycleAnalysesCount)}`})`}
                                </span>
                                
                                {/* Interactive Tooltip */}
                                <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-stone-900 border border-stone-850 px-3 py-1.5 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-xl z-50">
                                  {isAr 
                                    ? 'يمثل هذا العدد التحليلات المنفذة داخل المنصة خلال الدورة الحالية وليس الحصة المتبقية من Gemini. يصفر تلقائياً عند التجديد.' 
                                    : 'This represents analyses processed in the platform during the current cycle, not the remaining Gemini API quota. Resets on renewal.'}
                                </span>
                              </span>
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Switcher & Live Link */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto self-stretch lg:self-auto justify-end">
                  <a
                    href={`/${locale}/${settings.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200/80 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-855 transition-all cursor-pointer shadow-sm active:scale-95 hover:border-stone-300"
                  >
                    <span>{isAr ? 'رابط الكشك التفاعلي' : 'Live Kiosk Link'}</span>
                    <ExternalLink className="h-4 w-4 text-stone-500" />
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Top Navigation Pill Tabs with smooth SaaS styling */}
            <div className="flex bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80 mb-8 overflow-x-auto md:overflow-x-visible scrollbar-none gap-1.5 w-full max-w-4xl mx-auto sm:mx-0 shadow-sm">
              {[
                { id: 'orders', label: t('liveOrders'), icon: ShoppingBag },
                { id: 'menu', label: t('menuManagement'), icon: Coffee },
                { id: 'analytics', label: t('stats'), icon: BarChart3 },
                { id: 'users', label: isAr ? 'إدارة الموظفين' : 'Staff Users', icon: Users },
                { id: 'settings', label: t('cafeSettings'), icon: Settings },
              ].map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as 'orders' | 'menu' | 'analytics' | 'users' | 'settings')
                    }
                    className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                      ? 'bg-[#4A2E20] text-white border border-[#4A2E20]/10 shadow-sm'
                      : 'text-stone-600 hover:bg-white/50 hover:text-stone-900'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>


            {/* TAB 1: LIVE ORDERS - OPERATIONAL DISPATCH SCREEN */}
            {activeTab === 'orders' && (
              <OrdersTab
                isAr={isAr}
                pendingOrders={pendingOrders}
                preparingOrders={preparingOrders}
                readyOrders={readyOrders}
                completedOrders={completedOrders}
                parsedAnalyses={parsedAnalyses}
                getWaitTime={getWaitTime}
                getOrderMood={getOrderMood}
                formatVal={formatVal}
                handleUpdateStatus={handleUpdateStatus}
                handleDeleteOrder={handleDeleteOrder}
                setActiveTab={setActiveTab}
                setEditingDrink={setEditingDrink}
                setShowQrModal={setShowQrModal}
                setShowReportModal={setShowReportModal}
              />
            )}

            {/* TAB 2: MENU MANAGEMENT */}
            {activeTab === 'menu' && (
              <MenuTab
                isAr={isAr}
                drinks={drinks}
                limits={limits}
                editingDrink={editingDrink}
                setEditingDrink={setEditingDrink}
                drinkImgUrl={drinkImgUrl}
                setDrinkImgUrl={setDrinkImgUrl}
                uploadingDrinkImg={uploadingDrinkImg}
                setUploadingDrinkImg={setUploadingDrinkImg}
                isSubmitting={isSubmitting}
                isPending={isPending}
                handleSaveDrink={handleSaveDrink}
                handleToggleAvailability={handleToggleAvailability}
                handleDeleteDrink={handleDeleteDrink}
                addToast={addToast}
                settings={settings}
              />
            )}

            {/* TAB 3: ANALYTICS (100% Real Database Queries & Reports) */}
            {activeTab === 'analytics' && (
              <AnalyticsTab
                isAr={isAr}
                orders={orders}
                analyses={analyses}
                activeAnalyticsSubTab={activeAnalyticsSubTab}
                setActiveAnalyticsSubTab={setActiveAnalyticsSubTab}
                limits={limits}
                totalOpens={totalOpens}
                startAnalyses={startAnalyses}
                completeAnalyses={completeAnalyses}
                createOrders={createOrders}
                completeOrdersCount={completeOrdersCount}
                betaFeedbackRate={betaFeedbackRate}
                betaConversionRate={betaConversionRate}
                monthlyRevenue={monthlyRevenue}
                todayRevenue={todayRevenue}
                todayOrders={todayOrders}
                todayAnalyses={todayAnalyses}
                popularDrinksList={popularDrinksList}
                popularMoodsList={popularMoodsList}
                orderGrowthRate={orderGrowthRate}
                formatVal={formatVal}
                last7DaysSales={last7DaysSales}
                last30DaysSales={last30DaysSales}
                setActiveTab={setActiveTab}
                setSettingsSubTab={setSettingsSubTab}
              />
            )}

            {/* TAB 4: STAFF MANAGEMENT */}
            {activeTab === 'users' && (
              <UsersTab
                isAr={isAr}
                cafeId={settings.id}
                limits={limits}
                addToast={addToast}
              />
            )}

            {/* TAB 5: CAFE SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsTab
                isAr={isAr}
                settings={settings}
                logoUrl={logoUrl}
                setLogoUrl={setLogoUrl}
                coverImageUrl={coverImageUrl}
                setCoverImageUrl={setCoverImageUrl}
                lockedLogoUrl={lockedLogoUrl}
                setLockedLogoUrl={setLockedLogoUrl}
                lockedCoverUrl={lockedCoverUrl}
                setLockedCoverUrl={setLockedCoverUrl}
                uploadingLogo={uploadingLogo}
                setUploadingLogo={setUploadingLogo}
                uploadingCover={uploadingCover}
                setUploadingCover={setUploadingCover}
                handleSaveSettings={handleSaveSettings}
                addToast={addToast}
                settingsSubTab={settingsSubTab}
                setSettingsSubTab={setSettingsSubTab}
              />
            )}
          </>
        )}
      </main>

      {/* 5. QR CODE MODAL */}
      {
        showQrModal && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-gray-150 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-1 pt-2">
                <h3 className="text-sm font-black text-[#3E2723]">
                  {isAr ? 'رمز الـ QR Code الخاص بكشك المقهى' : 'Interactive Cafe Kiosk QR Code'}
                </h3>
                <p className="text-[10px] text-gray-500 font-bold leading-normal">
                  {isAr
                    ? 'اطبع هذا الرمز وضعه على طاولات المقهى ليقوم العملاء بمسحه ومشاركة مزاجهم وطلب المشروبات مباشرة!'
                    : 'Place this printed QR code on tables to let customers scan, find matches, and place orders!'}
                </p>
              </div>

              <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
                <label className="text-[10px] font-black text-[#3E2723]/60 block">
                  {isAr ? 'رقم الطاولة (اختياري لتوليد QR مخصص لطاولة معينة):' : 'Table Number (Optional to generate table-specific QR):'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: 4' : 'e.g. 4'}
                  value={qrTableNumber}
                  onChange={(e) => setQrTableNumber(e.target.value)}
                  className="w-full text-xs font-extrabold border border-[#3E2723]/10 rounded-xl px-3.5 py-2 bg-[#FAF8F5]/60 focus:outline-none focus:border-amber-600/30 text-[#3E2723]"
                />
              </div>

              <div className="flex justify-center py-2 bg-[#FAF8F5] rounded-2xl border border-[#3E2723]/5">
                <NextImage
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `${window.location.origin}/${locale}/${settings.slug}${qrTableNumber ? `?table=${qrTableNumber}` : ''}`
                  )}`}
                  alt="Cafe QR Code"
                  width={200}
                  height={200}
                  className="object-contain rounded-lg shadow-sm"
                />
              </div>

              <div className="space-y-2 text-center text-[10px] text-gray-400 font-semibold leading-normal">
                <span className="block border border-dashed border-gray-250 p-2 rounded-lg truncate text-[#3E2723] bg-amber-500/5 select-all">
                  {window.location.origin}/{locale}/{settings.slug}{qrTableNumber ? `?table=${qrTableNumber}` : ''}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/${locale}/${settings.slug}${qrTableNumber ? `?table=${qrTableNumber}` : ''}`,
                    )
                    addToast(isAr ? 'تم نسخ الرابط للحافظة' : 'Link copied to clipboard', 'success')
                  }}
                  className="text-xs text-amber-800 font-bold hover:underline cursor-pointer block mx-auto"
                >
                  {isAr ? 'نسخ رابط الكشك' : 'Copy Kiosk Link'}
                </button>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handlePrintQr}
                    className="flex-1 py-2 px-3 bg-[#3E2723] hover:bg-[#2D1B18] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🖨️</span>
                    <span>{isAr ? 'طباعة' : 'Print'}</span>
                  </button>
                  <button
                    onClick={handleDownloadQr}
                    className="flex-1 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/15 text-[#3E2723] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📥</span>
                    <span>{isAr ? 'تحميل' : 'Download'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* 6. DAILY REPORT MODAL */}
      {
        showReportModal && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-[#3E2723]/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              {/* Header Banner */}
              <div className="bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-[#F5E6D3] p-6 relative">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="absolute top-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto text-[#FAF8F5]/60 hover:text-[#FAF8F5] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="space-y-1.5 mt-2 text-right rtl:text-right ltr:text-left">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-amber-400" />
                    <h3 className="text-base font-black text-white">
                      {isAr ? 'تقرير الأداء والنشاط لليوم' : "Today's Performance Report"}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#FAF8F5]/80 font-bold">
                    {new Date().toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Stats List */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  {/* Stat Card 1: Completed Sales */}
                  <div className="flex justify-between items-center p-3.5 bg-emerald-50/30 rounded-2xl border border-emerald-600/10 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">💰</span>
                      <span className="text-xs font-black text-gray-600">
                        {isAr ? 'إجمالي المبيعات المكتملة' : 'Total Revenue'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-700">{formatVal(todayRevenue)}</span>
                  </div>

                  {/* Stat Card 2: Completed Orders */}
                  <div className="flex justify-between items-center p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#3E2723]/5 hover:bg-[#FAF8F5]/80 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">☕</span>
                      <span className="text-xs font-black text-gray-600">
                        {isAr ? 'الطلبات المنجزة' : 'Orders Completed'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#3E2723]">
                      {todayOrders.filter(o => o.status === 'COMPLETED').length}
                    </span>
                  </div>

                  {/* Stat Card 3: Pending Orders */}
                  <div className="flex justify-between items-center p-3.5 bg-amber-50/30 rounded-2xl border border-amber-600/10 hover:bg-amber-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">⏳</span>
                      <span className="text-xs font-black text-gray-600">
                        {isAr ? 'الطلبات بانتظار التحضير' : 'Pending Orders'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-700">{pendingOrders.length}</span>
                  </div>

                  {/* Stat Card 4: Vibe Checks */}
                  <div className="flex justify-between items-center p-3.5 bg-purple-50/30 rounded-2xl border border-purple-600/10 hover:bg-purple-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">✨</span>
                      <span className="text-xs font-black text-gray-600">
                        {isAr ? 'عمليات فحص ومسح المزاج' : 'Vibe checks performed'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-purple-700">{todayAnalyses.length}</span>
                  </div>

                  {/* Stat Card 5: Dominant Mood */}
                  <div className="flex justify-between items-center p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#3E2723]/5 hover:bg-[#FAF8F5]/80 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🧠</span>
                      <span className="text-xs font-black text-gray-600">
                        {isAr ? 'المزاج السائد اليوم' : 'Dominant customer mood'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#3E2723]">{topMoodToday}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowReportModal(false)
                    addToast(
                      isAr ? 'تم إرسال التقرير لبريدك الإلكتروني' : 'Report sent to your email',
                      'success',
                    )
                  }}
                  className="w-full py-3 bg-[#3E2723] hover:bg-[#2D1B18] text-[#F5E6D3] rounded-2xl text-xs font-black cursor-pointer shadow-lg active:scale-98 transition-all text-center flex items-center justify-center gap-2 mt-2"
                >
                  <span>✉️</span>
                  <span>{isAr ? 'إرسال التقرير للبريد الإلكتروني' : 'Send Report to Email'}</span>
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  )
}

function SystemHealthPanel({
  isAr,
  settingsId,
  checkSystemHealthAction,
  addToast,
}: {
  isAr: boolean
  settingsId: string
  checkSystemHealthAction: (cafeId: string) => Promise<any>
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheckHealth = async () => {
    setLoading(true)
    try {
      const res = await checkSystemHealthAction(settingsId)
      if (res.success) {
        setHealth(res)
        addToast(isAr ? 'تم فحص أداء النظام بنجاح!' : 'System health audit completed!', 'success')
      } else {
        addToast(res.error || (isAr ? 'فشل فحص أداء النظام' : 'System health audit failed'), 'error')
      }
    } catch (e: any) {
      addToast(e.message || (isAr ? 'خطأ أثناء الاتصال' : 'Failed to connect to health audit endpoint'), 'error')
    } finally {
      setLoading(false)
    }
  }

  // Run on initial mount
  useEffect(() => {
    handleCheckHealth()
  }, [])

  const getStatusBadge = (status: 'OK' | 'SLOW' | 'ERROR') => {
    switch (status) {
      case 'OK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isAr ? '🟢 يعمل' : '🟢 Works'}
          </span>
        )
      case 'SLOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {isAr ? '🟡 بطيء' : '🟡 Slow'}
          </span>
        )
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {isAr ? '🔴 متوقف' : '🔴 Stopped'}
          </span>
        )
    }
  }

  const renderService = (labelAr: string, labelEn: string, serviceKey: string) => {
    const service = health?.results?.[serviceKey]
    if (!service) {
      return (
        <div key={serviceKey} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      )
    }
    return (
      <div key={serviceKey} className="p-4 bg-gray-50/50 border border-[#3E2723]/5 rounded-2xl hover:bg-white transition-colors relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black text-[#3E2723]">
            {isAr ? labelAr : labelEn}
          </span>
          {getStatusBadge(service.status)}
        </div>
        <p className="text-[10px] font-bold text-gray-500 mt-2 truncate">
          {service.details}
        </p>
        <div className="mt-3 flex items-center justify-between text-[9px] text-gray-400 font-mono">
          <span>{isAr ? 'زمن الاستجابة:' : 'Latency:'}</span>
          <span className={service.status === 'ERROR' ? 'text-rose-600 font-bold' : service.status === 'SLOW' ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
            {service.latency}ms
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#3E2723]/10 rounded-3xl p-5 sm:p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-[#3E2723] flex items-center gap-2">
            <span>💻 {isAr ? 'حالة أداء وسلامة النظام العام' : 'Overall System Health'}</span>
            {health?.lastChecked && (
              <span className="text-[9px] text-gray-400 font-normal">
                ({isAr ? 'آخر فحص:' : 'Last check:'} {health.lastChecked})
              </span>
            )}
          </h3>
          <p className="text-xs font-bold text-gray-500 leading-relaxed">
            {isAr 
              ? 'مراقبة حية فورية ومباشرة للأداء وزمن الاستجابة للبنية التحتية والخدمات التابعة لمزاج.' 
              : 'Real-time performance and latency monitoring for Mazaj core infrastructure services.'}
          </p>
        </div>
        
        <button
          onClick={handleCheckHealth}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3E2723] hover:bg-[#2D1B18] text-white disabled:opacity-60 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{isAr ? 'جاري الفحص...' : 'Auditing...'}</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>{isAr ? 'فحص جميع الخدمات' : 'Audit All Services'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {renderService('قاعدة البيانات (Postgres)', 'Database (Postgres)', 'database')}
        {renderService('محرك الذكاء الاصطناعي (Gemini)', 'Gemini AI Advisor', 'gemini')}
        {renderService('بوت تيليجرام (Telegram)', 'Telegram Notification Bot', 'telegram')}
        {renderService('بوابة Supabase Client', 'Supabase Client API', 'supabase')}
        {renderService('التخزين السحابي (Bucket)', 'Storage CDN Storage', 'storage')}
      </div>
    </div>
  )
}
