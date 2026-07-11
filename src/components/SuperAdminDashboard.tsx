'use client'

import React, { useState, useTransition, useEffect } from 'react'
import {
  Building2,
  Users,
  Coffee,
  Cpu,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Moon,
  Sun,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Layers,
  DollarSign,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  getSuperAdminStats,
  updateCafeSubscriptionAction,
  updateSuperAdminSettingsAction,
  backupDatabaseAction,
  resetDatabaseAction,
  restoreDatabaseAction,
  deleteCafeAction,
} from '@/app/actions/super-admin'
import { logoutAction, getSessionAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

interface CafeRow {
  id: string
  name: string
  plan: string
  status: string
  createdAt: Date
  analysesCount: number
  ordersCount: number
  conversionRate: number
  satisfaction: number
}

interface StatsData {
  overview: {
    totalCafes: number
    cafeGrowth: number
    activeCafes: number
    activeGrowth: number
    trialCafes: number
    paidCafes: number
    expiredCafes: number
    suspendedCafes: number
    mrr: number
    arr: number
    arpu: number
    geminiCost: number
    netProfit: number
    profitMargin: number
  }
  platformStats: {
    totalAnalyses: number
    totalOrders: number
    totalDrinks: number
    totalUsers: number
    totalScans: number
  }
  funnel: Array<{ stage: string; count: number; labelAr: string }>
  gemini: {
    geminiCalls: number
    geminiCallsToday: number
    geminiCallsMonth: number
    dailyAnalyses: Array<{ date: string; count: number }>
    avgLatency: number
    modelName: string
    popularMoods: Array<{ mood: string; count: number }>
    popularDrinks: Array<{ name: string; count: number }>
  }
  retention: {
    newSubscriptions: number
    churnedSubscriptions: number
    churnRate: number
    retentionRate: number
  }
  satisfaction: {
    positiveFeedback: number
    negativeFeedback: number
    satisfactionRate: number
  }
  expiringCafes: Array<{
    id: string
    name: string
    slug: string
    trialEndsAt: Date
    daysLeft: number
  }>
  top10: {
    byOrders: Array<{ id: string; name: string; slug: string; count: number }>
    byAnalyses: Array<{ id: string; name: string; slug: string; count: number }>
    byRevenue: Array<{ id: string; name: string; slug: string; revenue: number }>
  }
  alerts: Array<{
    id: string
    type: 'EXPIRING' | 'GEMINI_SPIKE' | 'NEW_CAFE' | 'LOW_CONVERSION'
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
    messageAr: string
    messageEn: string
    createdAt: Date
  }>
  cafesTable: CafeRow[]
}

interface Props {
  initialStats: StatsData
  locale: string
}

// Simple translation dictionary
const translations = {
  ar: {
    title: 'لوحة الإدارة العليا (Super Admin)',
    subtitle: 'متابعة نمو منصة مزاج، أداء الذكاء الاصطناعي، والإيرادات بشكل مباشر',
    refresh: 'تحديث البيانات',
    refreshing: 'جاري التحديث...',
    searchPlaceholder: 'البحث عن مقهى باسمه أو باقته...',
    allPlans: 'كل الباقات',
    allStatuses: 'كل الحالات',
    active: 'نشط',
    expired: 'منتهي',
    cancelled: 'معلق / ملغي',
    freeTrial: 'فترة تجريبية',
    totalCafes: 'إجمالي المقاهي',
    activeCafes: 'المقاهي النشطة',
    trialCafes: 'المقاهي التجريبية',
    paidCafes: 'المقاهي المدفوعة',
    expiredCafes: 'المقاهي المنتهية',
    suspendedCafes: 'المقاهي المعلقة',
    growthWeek: 'مقارنة بالأسبوع الماضي',
    totalAnalyses: 'إجمالي تحليلات الذكاء الاصطناعي',
    totalOrders: 'إجمالي الطلبات المستلمة',
    totalDrinks: 'إجمالي المشروبات المضافة',
    totalUsers: 'إجمالي الكاشيرية والمستخدمين',
    totalScans: 'إجمالي مسحات رمز QR',
    mrr: 'الإيراد الشهري المتوقع (MRR)',
    arr: 'الإيراد السنوي المتوقع (ARR)',
    arpu: 'متوسط الإيراد للمقهى (ARPU)',
    geminiCost: 'تكلفة Gemini التقريبية',
    netProfit: 'صافي الربح الشهري',
    profitMargin: 'هامش الربح التشغيلي',
    modelName: 'اسم نموذج Gemini المستعمل',
    avgLatency: 'متوسط زمن استجابة الـ API',
    popularMoods: 'الحالات المزاجية الأكثر طلباً',
    popularDrinks: 'المشروبات الأكثر توصية بها',
    satisfactionRate: 'نسبة الرضا العامة للعملاء',
    positiveFeedback: 'التقييمات الإيجابية',
    negativeFeedback: 'التقييمات السلبية',
    conversionRate: 'معدل التحويل العام',
    funnelTitle: 'مسار التحويل الذكي (Funnel)',
    dropoff: 'نسبة التسرب',
    cafeName: 'اسم المقهى',
    plan: 'نوع الباقة',
    status: 'حالة الاشتراك',
    registeredAt: 'تاريخ التسجيل',
    analysesCount: 'التحليلات',
    ordersCount: 'الطلبات',
    satisfaction: 'الرضا',
    actions: 'الإجراءات',
    emptyState: 'لا توجد نتائج تطابق خيارات البحث.',
    overviewTab: 'نظرة عامة',
    geminiTab: 'تحليلات الذكاء الاصطناعي',
    cafesTab: 'إدارة المقاهي',
    funnelTab: 'قنوات التحويل والرضا',
    financials: 'المؤشرات المالية والأرباح',
    logout: 'تسجيل الخروج',
    expiringSoonTitle: 'الاشتراكات التي ستنتهي قريباً (خلال 7 أيام)',
    expiringSoonDesc: 'مقاهي شارف اشتراكها أو فترة تجربتها على الانتهاء.',
    daysLeftLabel: 'أيام متبقية',
    geminiToday: 'طلبات Gemini اليوم',
    geminiMonth: 'طلبات Gemini هذا الشهر',
    top10Title: 'أفضل 10 مقاهي في المنصة',
    byOrders: 'حسب عدد الطلبات',
    byAnalyses: 'حسب عدد التحليلات',
    byRevenue: 'حسب إجمالي الإيرادات',
    alertsCenter: 'مركز التنبيهات الذكي',
    noAlerts: 'لا توجد أي تنبيهات نشطة حالياً.',
    settingsTab: 'إعدادات الحساب',
    emailLabel: 'البريد الإلكتروني للـ Super Admin',
    passwordLabel: 'كلمة المرور الجديدة',
    confirmPasswordLabel: 'تأكيد كلمة المرور',
    saveSettings: 'حفظ الإعدادات',
    settingsSuccessMsg: 'تم تحديث بيانات الـ Super Admin بنجاح!',
    passwordMismatchMsg: 'كلمتا المرور غير متطابقتين!',
    backupDbBtn: 'تحميل نسخة احتياطية لقاعدة البيانات (JSON) 📥',
    resetDbBtn: 'حذف وإعادة تهيئة قاعدة البيانات بالكامل 🚨',
    resetDbWarning:
      'تنبيه: هذا الإجراء سيقوم بحذف كافة المقاهي، الطلبات، التحليلات، الكاشيرية، والمشروبات بشكل نهائي! حساب السوبر أدمن فقط لن يُحذف.',
    resetDbConfirm:
      'هل أنت متأكد من حذف قاعدة البيانات بالكامل؟ لا يمكن التراجع عن هذا الإجراء مطلقاً!',
    resetDbSuccess: 'تمت إعادة تهيئة قاعدة البيانات بنجاح وتم مسح كافة الجداول!',
    maintenanceTitle: 'صيانة النظام وقاعدة البيانات',
    restoreDbBtn: 'استرجاع قاعدة البيانات من نسخة احتياطية (JSON) 📤',
    restoreDbConfirm:
      'هل أنت متأكد من استعادة قاعدة البيانات؟ سيتم مسح كافة البيانات الحالية واستبدالها بالنسخة الاحتياطية بالكامل! لا يمكن التراجع.',
    restoreDbSuccess: 'تمت استعادة قاعدة البيانات بنجاح وجاري إعادة تحميل الصفحة...',
  },
  en: {
    title: 'Super Admin Dashboard',
    subtitle: 'Monitor Mazaj platform growth, AI performance, and real-time revenue stats',
    refresh: 'Refresh Data',
    refreshing: 'Refreshing...',
    searchPlaceholder: 'Search cafes by name or plan...',
    allPlans: 'All Plans',
    allStatuses: 'All Statuses',
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Suspended',
    freeTrial: 'Free Trial',
    totalCafes: 'Total Cafes',
    activeCafes: 'Active Cafes',
    trialCafes: 'Trial Cafes',
    paidCafes: 'Paid Cafes',
    expiredCafes: 'Expired Cafes',
    suspendedCafes: 'Suspended Cafes',
    growthWeek: 'vs last week',
    totalAnalyses: 'Total AI Analyses',
    totalOrders: 'Total Orders Created',
    totalDrinks: 'Total Menu Drinks',
    totalUsers: 'Total Platform Users',
    totalScans: 'Total QR Code Scans',
    mrr: 'Monthly Recurring Revenue (MRR)',
    arr: 'Annual Recurring Revenue (ARR)',
    arpu: 'Avg Revenue per Cafe (ARPU)',
    geminiCost: 'Estimated Gemini API Cost',
    netProfit: 'Net Monthly Profit',
    profitMargin: 'Operating Margin',
    modelName: 'Active Gemini Model',
    avgLatency: 'Average API Response Latency',
    popularMoods: 'Most Popular User Moods',
    popularDrinks: 'Most Recommended Drinks',
    satisfactionRate: 'General Customer Satisfaction',
    positiveFeedback: 'Positive Feedback',
    negativeFeedback: 'Negative Feedback',
    conversionRate: 'Overall Conversion Rate',
    funnelTitle: 'User Conversion Funnel',
    dropoff: 'Drop-off Rate',
    cafeName: 'Cafe Name',
    plan: 'Subscription Plan',
    status: 'Status',
    registeredAt: 'Registration Date',
    analysesCount: 'Analyses',
    ordersCount: 'Orders',
    satisfaction: 'Satisfaction',
    actions: 'Actions',
    emptyState: 'No results match your search query.',
    overviewTab: 'Overview',
    geminiTab: 'Gemini AI Analytics',
    cafesTab: 'Cafes Management',
    funnelTab: 'Funnel & Satisfaction',
    financials: 'Financial Metrics & Profitability',
    logout: 'Log Out',
    expiringSoonTitle: 'Subscriptions Expiring Soon (Next 7 Days)',
    expiringSoonDesc: 'Cafes whose free trial or subscription is ending soon.',
    daysLeftLabel: 'days left',
    geminiToday: 'Gemini Requests Today',
    geminiMonth: 'Gemini Requests This Month',
    top10Title: 'Top 10 Platform Cafes',
    byOrders: 'By Orders Count',
    byAnalyses: 'By Analyses Count',
    byRevenue: 'By Revenue',
    alertsCenter: 'Smart Alerts Center',
    noAlerts: 'No active alerts at the moment.',
    settingsTab: 'Account Settings',
    emailLabel: 'Super Admin Email',
    passwordLabel: 'New Password',
    confirmPasswordLabel: 'Confirm Password',
    saveSettings: 'Save Settings',
    settingsSuccessMsg: 'Super Admin settings updated successfully!',
    passwordMismatchMsg: 'Passwords do not match!',
    backupDbBtn: 'Download Database Backup (JSON) 📥',
    resetDbBtn: 'Factory Reset Database 🚨',
    resetDbWarning:
      'Warning: This action will permanently delete all cafes, orders, analyses, users, and drinks! Your Super Admin account will not be deleted.',
    resetDbConfirm:
      'Are you sure you want to completely reset the database? This action cannot be undone!',
    resetDbSuccess: 'Database has been reset successfully!',
    maintenanceTitle: 'System & Database Maintenance',
    restoreDbBtn: 'Restore Database from Backup (JSON) 📤',
    restoreDbConfirm:
      'Are you sure you want to restore the database? Current data will be completely replaced by the backup! This cannot be undone.',
    restoreDbSuccess: 'Database restored successfully, reloading page...',
  },
}

export default function SuperAdminDashboard({ initialStats, locale }: Props) {
  const [stats, setStats] = useState<StatsData>(initialStats)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortField, setSortField] = useState<keyof CafeRow>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'gemini' | 'cafes' | 'funnel' | 'settings'
  >('overview')
  const [isPending, startTransition] = useTransition()
  const [darkMode, setDarkMode] = useState(true)
  const [currentLocale, setCurrentLocale] = useState(locale)

  // Super Admin Credentials states
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [settingsSuccess, setSettingsSuccess] = useState('')

  const t = translations[currentLocale as 'ar' | 'en'] || translations.ar
  const isRTL = currentLocale === 'ar'

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const freshStats = await getSuperAdminStats(search)
        setStats(freshStats)
      } catch (err) {
        console.error(err)
      }
    })
  }

  useEffect(() => {
    handleRefresh()
  }, [search])

  useEffect(() => {
    async function loadSession() {
      const sess = await getSessionAction()
      if (sess && sess.email) {
        setAdminEmail(sess.email)
      }
    }
    loadSession()
  }, [])

  // Sorting and filtering cafe table
  const sortedCafes = [...stats.cafesTable]
    .filter(cafe => {
      const matchPlan = planFilter === 'ALL' || cafe.plan === planFilter
      const matchStatus = statusFilter === 'ALL' || cafe.status === statusFilter
      return matchPlan && matchStatus
    })
    .sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      if (valA instanceof Date && valB instanceof Date) {
        return sortAsc ? valA.getTime() - valB.getTime() : valB.getTime() - a.createdAt.getTime()
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number)
    })

  const handleSort = (field: keyof CafeRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-300 ${isRTL ? 'font-sans' : 'font-sans'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Navigation */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${darkMode ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white/80 border-zinc-200/80'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-amber-700 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-white">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Mazaj Super Admin
              </h1>
              <p className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Locale switcher */}
            <button
              onClick={() => setCurrentLocale(currentLocale === 'ar' ? 'en' : 'ar')}
              className={`p-2 rounded-lg border text-xs font-semibold hover:scale-105 transition-transform ${darkMode ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-amber-400' : 'border-zinc-200 bg-white hover:bg-zinc-100 text-amber-700'}`}
            >
              {currentLocale === 'ar' ? 'English 🇺🇸' : 'العربية 🇮🇶'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-lg border hover:scale-105 transition-transform ${darkMode ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-amber-400' : 'border-zinc-200 bg-white hover:bg-zinc-100 text-amber-600'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 shadow-sm ${
                isPending
                  ? 'opacity-70 cursor-not-allowed'
                  : darkMode
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/20'
                    : 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-200/20'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isPending ? t.refreshing : t.refresh}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={async () => {
                await logoutAction()
                window.location.href = `/${currentLocale}`
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold hover:scale-105 transition-all cursor-pointer ${
                darkMode
                  ? 'border border-zinc-800 bg-zinc-900 hover:bg-rose-950/30 hover:border-rose-900/50 text-rose-400'
                  : 'border border-zinc-200 bg-white hover:bg-rose-50 text-rose-700'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div
          className={`flex border-b mb-8 overflow-x-auto scrollbar-none ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}
        >
          {(['overview', 'gemini', 'cafes', 'funnel', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'border-amber-500 text-amber-500 scale-105'
                  : `border-transparent hover:border-zinc-500 ${darkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'}`
              }`}
            >
              {tab === 'overview' && t.overviewTab}
              {tab === 'gemini' && t.geminiTab}
              {tab === 'cafes' && t.cafesTab}
              {tab === 'funnel' && t.funnelTab}
              {tab === 'settings' && t.settingsTab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Overview Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                {
                  title: t.totalCafes,
                  value: stats.overview.totalCafes,
                  growth: stats.overview.cafeGrowth,
                  icon: Building2,
                  color: 'from-blue-500/20 to-indigo-500/20 text-blue-500',
                },
                {
                  title: t.activeCafes,
                  value: stats.overview.activeCafes,
                  growth: stats.overview.activeGrowth,
                  icon: CheckCircle2,
                  color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500',
                },
                {
                  title: t.trialCafes,
                  value: stats.overview.trialCafes,
                  growth: 0,
                  icon: HelpCircle,
                  color: 'from-amber-500/20 to-orange-500/20 text-amber-500',
                },
                {
                  title: t.paidCafes,
                  value: stats.overview.paidCafes,
                  growth: 0,
                  icon: DollarSign,
                  color: 'from-purple-500/20 to-pink-500/20 text-purple-500',
                },
                {
                  title: t.expiredCafes,
                  value: stats.overview.expiredCafes,
                  growth: 0,
                  icon: AlertTriangle,
                  color: 'from-rose-500/20 to-red-500/20 text-rose-500',
                },
                {
                  title: t.suspendedCafes,
                  value: stats.overview.suspendedCafes,
                  growth: 0,
                  icon: ShieldAlert,
                  color: 'from-zinc-500/20 to-slate-500/20 text-zinc-500',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                    darkMode
                      ? 'bg-zinc-900 border-zinc-800/80 shadow-md shadow-zinc-950/50'
                      : 'bg-white border-zinc-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-semibold ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}
                    >
                      {card.title}
                    </span>
                    <div className={`p-2 rounded-xl bg-gradient-to-tr ${card.color}`}>
                      <card.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tight">{card.value}</span>
                    {card.growth !== 0 && (
                      <span
                        className={`text-xs font-bold flex items-center ${card.growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                      >
                        {card.growth > 0 ? (
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-0.5" />
                        )}
                        {Math.abs(card.growth)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* General Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                {
                  title: t.totalAnalyses,
                  value: stats.platformStats.totalAnalyses,
                  icon: Cpu,
                  bg: 'bg-violet-500/10 text-violet-400',
                },
                {
                  title: t.totalOrders,
                  value: stats.platformStats.totalOrders,
                  icon: Coffee,
                  bg: 'bg-orange-500/10 text-orange-400',
                },
                {
                  title: t.totalDrinks,
                  value: stats.platformStats.totalDrinks,
                  icon: BarChart3,
                  bg: 'bg-emerald-500/10 text-emerald-400',
                },
                {
                  title: t.totalUsers,
                  value: stats.platformStats.totalUsers,
                  icon: Users,
                  bg: 'bg-blue-500/10 text-blue-400',
                },
                {
                  title: t.totalScans,
                  value: stats.platformStats.totalScans,
                  icon: Layers,
                  bg: 'bg-amber-500/10 text-amber-400',
                },
              ].map((pStat, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 ${
                    darkMode ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-white border-zinc-200'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${pStat.bg}`}>
                    <pStat.icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span
                      className={`text-[10px] uppercase font-bold block tracking-wider ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}
                    >
                      {pStat.title}
                    </span>
                    <span className="text-xl font-bold tracking-tight">{pStat.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Metrics Section */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base">{t.financials}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {[
                  {
                    label: t.mrr,
                    value: `$${stats.overview.mrr.toLocaleString()}`,
                    color: 'text-amber-500',
                  },
                  {
                    label: t.arr,
                    value: `$${stats.overview.arr.toLocaleString()}`,
                    color: 'text-indigo-500',
                  },
                  {
                    label: t.arpu,
                    value: `$${stats.overview.arpu.toLocaleString()}`,
                    color: 'text-emerald-500',
                  },
                  {
                    label: t.geminiCost,
                    value: `$${stats.overview.geminiCost.toLocaleString()}`,
                    color: 'text-rose-500',
                  },
                  {
                    label: t.netProfit,
                    value: `$${stats.overview.netProfit.toLocaleString()}`,
                    color: 'text-teal-500',
                  },
                  {
                    label: t.profitMargin,
                    value: `${stats.overview.profitMargin}%`,
                    color: 'text-purple-500',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}
                    >
                      {item.label}
                    </span>
                    <span className={`text-2xl font-black tracking-tight mt-2 ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Custom SVG MRR Growth Chart */}
              <div className="mt-8">
                <h4
                  className={`text-xs font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  Revenue & Subscription Growth Projection (SVG Area Chart)
                </h4>
                <div className="h-64 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line
                      x1="0"
                      y1="50"
                      x2="1000"
                      y2="50"
                      stroke={darkMode ? '#27272a' : '#e4e4e7'}
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="125"
                      x2="1000"
                      y2="125"
                      stroke={darkMode ? '#27272a' : '#e4e4e7'}
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="200"
                      x2="1000"
                      y2="200"
                      stroke={darkMode ? '#27272a' : '#e4e4e7'}
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="275"
                      x2="1000"
                      y2="275"
                      stroke={darkMode ? '#27272a' : '#e4e4e7'}
                      strokeWidth="1"
                    />

                    {/* Area path */}
                    <path
                      d={`M 0 300 Q 150 240, 300 210 T 600 120 T 900 60 L 1000 50 L 1000 300 Z`}
                      fill="url(#revenueGrad)"
                    />

                    {/* Line path */}
                    <path
                      d={`M 0 300 Q 150 240, 300 210 T 600 120 T 900 60 L 1000 50`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                    />

                    {/* Interactive dots representation */}
                    <circle
                      cx="300"
                      cy="210"
                      r="5"
                      fill="#f59e0b"
                      stroke={darkMode ? '#09090b' : '#fff'}
                      strokeWidth="2"
                    />
                    <circle
                      cx="600"
                      cy="120"
                      r="5"
                      fill="#f59e0b"
                      stroke={darkMode ? '#09090b' : '#fff'}
                      strokeWidth="2"
                    />
                    <circle
                      cx="900"
                      cy="60"
                      r="5"
                      fill="#f59e0b"
                      stroke={darkMode ? '#09090b' : '#fff'}
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Chart Legends */}
                  <div className="absolute top-2 left-2 flex items-center gap-2 bg-zinc-950/80 px-2 py-1 rounded text-[10px]">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
                    <span>MRR: ${stats.overview.mrr.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-2 px-1">
                  <span>Week -4</span>
                  <span>Week -3</span>
                  <span>Week -2</span>
                  <span>Week -1</span>
                  <span>Current Week</span>
                </div>
              </div>
            </div>

            {/* Grid of Alert Center & Expiring soon & Top 10 Cafes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (8 cols): Top 10 Cafes & Expiring Subscriptions */}
              <div className="lg:col-span-8 space-y-6">
                {/* Expiring Subscriptions */}
                <div
                  className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-extrabold text-base flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        {t.expiringSoonTitle}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">{t.expiringSoonDesc}</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 text-xs rounded-full font-bold">
                      {stats.expiringCafes?.length || 0}
                    </span>
                  </div>

                  {!stats.expiringCafes || stats.expiringCafes.length === 0 ? (
                    <div className="text-center py-6 text-xs text-zinc-500 border border-dashed rounded-xl border-zinc-800">
                      {currentLocale === 'ar'
                        ? 'لا توجد اشتراكات تنتهي قريباً.'
                        : 'No subscriptions expiring soon.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.expiringCafes.map(cafe => (
                        <div
                          key={cafe.id}
                          className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                            darkMode
                              ? 'bg-zinc-900 border-zinc-800/60 hover:bg-zinc-850'
                              : 'bg-zinc-50 border-zinc-150 hover:bg-zinc-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm">
                              {cafe.daysLeft}
                            </div>
                            <div>
                              <span className="text-sm font-black block">{cafe.name}</span>
                              <span className="text-[10px] text-zinc-500 font-semibold">
                                Slug: {cafe.slug}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-rose-500 block">
                              {cafe.daysLeft} {t.daysLeftLabel}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(cafe.trialEndsAt).toLocaleDateString(
                                currentLocale === 'ar' ? 'ar-EG' : 'en-US',
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top 10 Cafes Tables */}
                <div
                  className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'}`}
                >
                  <h3 className="font-extrabold text-base mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    {t.top10Title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* By Orders */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b pb-2 border-zinc-805/40">
                        {t.byOrders}
                      </h4>
                      {!stats.top10?.byOrders || stats.top10.byOrders.length === 0 ? (
                        <span className="text-xs text-zinc-500 block">لا توجد بيانات</span>
                      ) : (
                        stats.top10.byOrders.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium truncate max-w-[120px]">
                              {idx + 1}. {item.name}
                            </span>
                            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                              {item.count}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* By Analyses */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b pb-2 border-zinc-805/40">
                        {t.byAnalyses}
                      </h4>
                      {!stats.top10?.byAnalyses || stats.top10.byAnalyses.length === 0 ? (
                        <span className="text-xs text-zinc-500 block">لا توجد بيانات</span>
                      ) : (
                        stats.top10.byAnalyses.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium truncate max-w-[120px]">
                              {idx + 1}. {item.name}
                            </span>
                            <span className="bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full font-bold">
                              {item.count}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* By Revenue */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b pb-2 border-zinc-805/40">
                        {t.byRevenue}
                      </h4>
                      {!stats.top10?.byRevenue || stats.top10.byRevenue.length === 0 ? (
                        <span className="text-xs text-zinc-500 block">لا توجد بيانات</span>
                      ) : (
                        stats.top10.byRevenue.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium truncate max-w-[120px]">
                              {idx + 1}. {item.name}
                            </span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                              ${item.revenue.toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Alert Center */}
              <div className="lg:col-span-4">
                <div
                  className={`p-6 rounded-2xl border sticky top-24 ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'}`}
                >
                  <div className="flex items-center justify-between mb-4 border-b pb-3 border-zinc-800/40">
                    <h3 className="font-extrabold text-base flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-500 animate-bounce" />
                      {t.alertsCenter}
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full font-bold">
                      {stats.alerts?.length || 0}
                    </span>
                  </div>

                  {!stats.alerts || stats.alerts.length === 0 ? (
                    <div className="text-center py-12 text-xs text-zinc-500">{t.noAlerts}</div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {stats.alerts.map(alert => {
                        let severityColor = 'border-blue-500/20 bg-blue-500/5 text-blue-400'
                        let badgeColor = 'bg-blue-500/10 text-blue-400'
                        if (alert.severity === 'WARNING') {
                          severityColor = 'border-amber-500/20 bg-amber-500/5 text-amber-400'
                          badgeColor = 'bg-amber-500/10 text-amber-400'
                        } else if (alert.severity === 'CRITICAL') {
                          severityColor = 'border-rose-500/20 bg-rose-500/5 text-rose-400'
                          badgeColor = 'bg-rose-500/10 text-rose-400'
                        }

                        return (
                          <div
                            key={alert.id}
                            className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${severityColor}`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 text-[8px] rounded font-black tracking-wider uppercase ${badgeColor}`}
                              >
                                {alert.type}
                              </span>
                              <span className="text-[9px] text-zinc-500">
                                {new Date(alert.createdAt).toLocaleTimeString(
                                  currentLocale === 'ar' ? 'ar-EG' : 'en-US',
                                  { hour: '2-digit', minute: '2-digit' },
                                )}
                              </span>
                            </div>
                            <p className="text-xs font-bold leading-relaxed">
                              {currentLocale === 'ar' ? alert.messageAr : alert.messageEn}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gemini & AI Analytics */}
        {activeTab === 'gemini' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gemini details card */}
              <div
                className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-sm">Gemini Runtime Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2 border-zinc-800/40">
                    <span className="text-xs text-zinc-500">{t.modelName}</span>
                    <span className="text-xs font-bold text-amber-500">
                      {stats.gemini.modelName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2 border-zinc-800/40">
                    <span className="text-xs text-zinc-500">{t.avgLatency}</span>
                    <span className="text-xs font-bold text-emerald-500">
                      {stats.gemini.avgLatency}s
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2 border-zinc-800/40">
                    <span className="text-xs text-zinc-500">{t.geminiToday}</span>
                    <span className="text-xs font-bold text-violet-500">
                      {stats.gemini.geminiCallsToday || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2 border-zinc-800/40">
                    <span className="text-xs text-zinc-500">{t.geminiMonth}</span>
                    <span className="text-xs font-bold text-indigo-500">
                      {stats.gemini.geminiCallsMonth || 0}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-xs text-zinc-500">Gemini Cost Per Call</span>
                    <span className="text-xs font-bold text-zinc-400">$0.00022</span>
                  </div>
                </div>
              </div>

              {/* Popular Moods */}
              <div
                className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-extrabold text-sm">{t.popularMoods}</h3>
                </div>
                <div className="space-y-3">
                  {stats.gemini.popularMoods.length === 0 ? (
                    <div className="text-xs text-zinc-500">{t.emptyState}</div>
                  ) : (
                    stats.gemini.popularMoods.map((moodObj, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="font-medium">{moodObj.mood}</span>
                        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                          {moodObj.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Popular Drinks */}
              <div
                className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Coffee className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-sm">{t.popularDrinks}</h3>
                </div>
                <div className="space-y-3">
                  {stats.gemini.popularDrinks.length === 0 ? (
                    <div className="text-xs text-zinc-500">{t.emptyState}</div>
                  ) : (
                    stats.gemini.popularDrinks.map((drinkObj, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="font-medium truncate max-w-[200px]">{drinkObj.name}</span>
                        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                          {drinkObj.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Daily Requests (SVG Bar Chart) */}
            <div
              className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
            >
              <h3 className="font-extrabold text-sm mb-4">
                Gemini Daily Requests Trend (Last 30 Days)
              </h3>

              <div className="h-64 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 1000 250" preserveAspectRatio="none">
                  {/* Background grid */}
                  <line
                    x1="0"
                    y1="50"
                    x2="1000"
                    y2="50"
                    stroke={darkMode ? '#222' : '#eee'}
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="125"
                    x2="1000"
                    y2="125"
                    stroke={darkMode ? '#222' : '#eee'}
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="200"
                    x2="1000"
                    y2="200"
                    stroke={darkMode ? '#222' : '#eee'}
                    strokeWidth="1"
                  />

                  {/* Bars */}
                  {stats.gemini.dailyAnalyses.map((day, idx) => {
                    const barWidth = 20
                    const spacing = 10
                    const x = idx * (barWidth + spacing) + 30
                    const maxVal = Math.max(...stats.gemini.dailyAnalyses.map(d => d.count), 10)
                    const barHeight = (day.count / maxVal) * 180
                    const y = 200 - barHeight

                    return (
                      <g key={idx} className="group">
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(barHeight, 5)}
                          rx="4"
                          fill={darkMode ? '#f59e0b' : '#d97706'}
                          className="transition-all duration-300 hover:fill-amber-400 cursor-pointer"
                        />
                        {/* Hover Tooltip */}
                        <text
                          x={x + 10}
                          y={y - 8}
                          fill={darkMode ? '#fff' : '#000'}
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {day.count}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              <div className="flex justify-between text-[10px] text-zinc-500 mt-2 px-1">
                <span>{stats.gemini.dailyAnalyses[0]?.date || '-'}</span>
                <span>{stats.gemini.dailyAnalyses[15]?.date || '-'}</span>
                <span>{stats.gemini.dailyAnalyses[29]?.date || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Cafe Management Table */}
        {activeTab === 'cafes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Search & Filter bar */}
            <div
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`w-full text-xs py-2.5 rounded-lg border outline-none transition-all ${
                    isRTL ? 'pr-3 pl-10' : 'pl-10 pr-3'
                  } ${
                    darkMode
                      ? 'border-zinc-800 bg-zinc-950 focus:border-amber-500 text-zinc-100'
                      : 'border-zinc-200 bg-zinc-50 focus:border-amber-600 text-zinc-950'
                  }`}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                  <select
                    value={planFilter}
                    onChange={e => setPlanFilter(e.target.value)}
                    className={`text-xs p-2 rounded-lg border outline-none ${
                      darkMode
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-200'
                        : 'bg-white border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <option value="ALL">{t.allPlans}</option>
                    <option value="FREE_TRIAL">FREE_TRIAL</option>
                    <option value="STARTER">STARTER</option>
                    <option value="LITE">LITE</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="PRO">PRO</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={`text-xs p-2 rounded-lg border outline-none ${
                    darkMode
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      : 'bg-white border-zinc-200 text-zinc-800'
                  }`}
                >
                  <option value="ALL">{t.allStatuses}</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CONFIG_ERROR">⚠️ CONFIG_ERROR</option>
                  <option value="CANCELLED">CANCELLED / SUSPENDED</option>
                </select>
              </div>
            </div>

            {/* Cafe performance rows table */}
            <div
              className={`border rounded-2xl overflow-hidden shadow-lg ${
                darkMode
                  ? 'border-zinc-800 bg-zinc-900/40 shadow-zinc-950/20'
                  : 'border-zinc-200 bg-white'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead
                    className={`${darkMode ? 'bg-zinc-900/80 border-b border-zinc-800' : 'bg-zinc-100 border-b border-zinc-200'}`}
                  >
                    <tr>
                      {[
                        { key: 'name', label: t.cafeName },
                        { key: 'plan', label: t.plan },
                        { key: 'status', label: t.status },
                        { key: 'createdAt', label: t.registeredAt },
                        { key: 'analysesCount', label: t.analysesCount },
                        { key: 'ordersCount', label: t.ordersCount },
                        { key: 'conversionRate', label: t.conversionRate },
                        { key: 'satisfaction', label: t.satisfaction },
                        { key: 'actions', label: t.actions },
                      ].map(th => (
                        <th
                          key={th.key}
                          onClick={() =>
                            th.key !== 'actions' && handleSort(th.key as keyof CafeRow)
                          }
                          className={`p-4 font-bold tracking-wide cursor-pointer select-none transition-colors hover:text-amber-500 ${
                            isRTL ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{th.label}</span>
                            {sortField === th.key && (sortAsc ? ' 🔼' : ' 🔽')}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/20">
                    {sortedCafes.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-zinc-500 font-medium">
                          {t.emptyState}
                        </td>
                      </tr>
                    ) : (
                      sortedCafes.map(cafe => (
                        <tr key={cafe.id} className={`hover:bg-zinc-800/10 transition-colors`}>
                          <td
                            className={`p-4 font-semibold text-zinc-100 ${isRTL ? 'text-right' : 'text-left'}`}
                          >
                            {cafe.name}
                          </td>
                          <td className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cafe.plan === 'PRO'
                                  ? 'bg-purple-500/10 text-purple-400'
                                  : cafe.plan === 'STANDARD'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : cafe.plan === 'LITE' || cafe.plan === 'STARTER'
                                      ? 'bg-orange-500/10 text-orange-400'
                                      : 'bg-zinc-500/10 text-zinc-400'
                              }`}
                            >
                              {cafe.plan}
                            </span>
                          </td>
                          <td className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {cafe.status === 'CONFIG_ERROR' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                CONFIG_ERROR
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  cafe.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : cafe.status === 'EXPIRED'
                                      ? 'bg-rose-500/10 text-rose-400'
                                      : 'bg-zinc-500/10 text-zinc-400'
                                }`}
                              >
                                {cafe.status}
                              </span>
                            )}
                          </td>
                          <td className={`p-4 text-zinc-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {new Date(cafe.createdAt).toLocaleDateString(
                              currentLocale === 'ar' ? 'ar-IQ' : 'en-US',
                            )}
                          </td>
                          <td className={`p-4 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                            {cafe.analysesCount}
                          </td>
                          <td className={`p-4 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                            {cafe.ordersCount}
                          </td>
                          <td className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{cafe.conversionRate}%</span>
                              <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="h-full bg-amber-500"
                                  style={{ width: `${Math.min(cafe.conversionRate, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-center gap-1 font-bold text-emerald-400">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{cafe.satisfaction}%</span>
                            </div>
                          </td>
                          <td
                            className={`p-4 flex items-center gap-2 flex-wrap ${isRTL ? 'justify-start' : 'justify-start'}`}
                          >
                            <select
                              value={cafe.plan}
                              onChange={async e => {
                                const newPlan = e.target.value
                                const paidPlans = ['STARTER', 'LITE', 'STANDARD', 'PRO', 'ENTERPRISE']
                                const payload: any = { subscriptionPlan: newPlan }
                                if (paidPlans.includes(newPlan.toUpperCase())) {
                                  const futureDate = new Date()
                                  futureDate.setDate(futureDate.getDate() + 30)
                                  payload.subscriptionEndsAt = futureDate
                                }
                                try {
                                  await updateCafeSubscriptionAction(cafe.id, payload)
                                } catch (err) {
                                  alert((err as Error).message || 'Error updating plan')
                                }
                                handleRefresh()
                              }}
                              className={`text-[10px] p-1 rounded border outline-none cursor-pointer ${
                                darkMode
                                  ? 'bg-zinc-950 border-zinc-800 text-zinc-300'
                                  : 'bg-white border-zinc-200 text-zinc-800'
                              }`}
                            >
                              <option value="FREE_TRIAL">TRIAL</option>
                              <option value="STARTER">STARTER</option>
                              <option value="LITE">LITE</option>
                              <option value="STANDARD">STANDARD</option>
                              <option value="PRO">PRO</option>
                              <option value="ENTERPRISE">ENTERPRISE</option>
                            </select>

                            <button
                              onClick={async () => {
                                const newStatus = cafe.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE'
                                await updateCafeSubscriptionAction(cafe.id, {
                                  subscriptionStatus: newStatus,
                                })
                                handleRefresh()
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold cursor-pointer transition-all ${
                                cafe.status === 'ACTIVE'
                                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              }`}
                            >
                              {cafe.status === 'ACTIVE'
                                ? currentLocale === 'ar'
                                  ? 'تعطيل ⏸'
                                  : 'Suspend'
                                : currentLocale === 'ar'
                                  ? 'تفعيل ▶'
                                  : 'Activate'}
                            </button>

                            <button
                              onClick={async () => {
                                const newEnds = new Date()
                                newEnds.setDate(newEnds.getDate() + 7)
                                await updateCafeSubscriptionAction(cafe.id, {
                                  trialEndsAt: newEnds,
                                })
                                handleRefresh()
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold cursor-pointer transition-all ${
                                darkMode
                                  ? 'bg-amber-600/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                                  : 'bg-amber-700/15 border border-amber-600/30 text-amber-700 hover:bg-amber-600/25'
                              }`}
                            >
                              {currentLocale === 'ar' ? '+7 أيام 📅' : '+7 Days'}
                            </button>

                            <button
                              onClick={async () => {
                                const confirmMsg = currentLocale === 'ar'
                                  ? `هل أنت متأكد من حذف المقهى "${cafe.name}"؟ سيتم حذف جميع البيانات والملفات الخاصة به نهائياً!`
                                  : `Are you sure you want to delete cafe "${cafe.name}"? This will delete all its data and storage files permanently!`
                                if (!window.confirm(confirmMsg)) return

                                try {
                                  const res = await deleteCafeAction(cafe.id)
                                  if (res && res.success && res.report) {
                                    const reportMsg = currentLocale === 'ar'
                                      ? `تم حذف المقهى بنجاح!\n\nتقرير الحذف:\n- عدد الملفات المحذوفة من Storage: ${res.report.deletedFilesCount}\n- عدد السجلات المحذوفة من قاعدة البيانات: ${res.report.deletedRecordsCount}${res.report.failedFiles.length > 0 ? `\n\nملفات فشل حذفها:\n${res.report.failedFiles.join('\n')}` : ''}`
                                      : `Cafe deleted successfully!\n\nDeletion Report:\n- Deleted files from Storage: ${res.report.deletedFilesCount}\n- Deleted database records: ${res.report.deletedRecordsCount}${res.report.failedFiles.length > 0 ? `\n\nFailed to delete files:\n${res.report.failedFiles.join('\n')}` : ''}`
                                    alert(reportMsg)
                                  } else {
                                    alert(currentLocale === 'ar' ? 'فشل حذف المقهى' : 'Failed to delete cafe')
                                  }
                                  handleRefresh()
                                } catch (err) {
                                  alert((err as Error).message || 'Error deleting cafe')
                                }
                              }}
                              className="px-2 py-0.5 rounded text-[9px] font-extrabold cursor-pointer transition-all bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
                            >
                              {currentLocale === 'ar' ? 'حذف 🗑️' : 'Delete 🗑️'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Funnel & Satisfaction */}
        {activeTab === 'funnel' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Funnel chart card */}
              <div
                className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-sm">{t.funnelTitle}</h3>
                </div>

                <div className="space-y-4">
                  {stats.funnel.map((item, idx) => {
                    const firstCount = stats.funnel[0]?.count || 1
                    const percent = ((item.count / firstCount) * 100).toFixed(1)
                    const widthPercent = (item.count / firstCount) * 100

                    let prevPercent = 100
                    if (idx > 0 && stats.funnel[idx - 1]?.count) {
                      prevPercent = (item.count / stats.funnel[idx - 1].count) * 100
                    }
                    const dropoff = idx > 0 ? (100 - prevPercent).toFixed(1) : '0.0'

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{currentLocale === 'ar' ? item.labelAr : item.stage}</span>
                          <span className="font-black text-zinc-400">
                            {item.count}{' '}
                            <span className="text-[10px] font-normal">({percent}%)</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-6 bg-zinc-800/40 rounded-lg overflow-hidden border border-zinc-800/30">
                            <div
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-r-lg transition-all duration-500"
                              style={{ width: `${widthPercent}%` }}
                            ></div>
                          </div>
                          {idx > 0 && (
                            <div className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                              {t.dropoff}: {dropoff}%
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Satisfaction Breakdown */}
              <div
                className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
              >
                <div className="flex items-center gap-2 mb-6">
                  <ThumbsUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-extrabold text-sm">{t.satisfactionRate}</h3>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                  <span className="text-5xl font-black text-emerald-400 mb-2">
                    {stats.satisfaction.satisfactionRate}%
                  </span>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold justify-center">
                        <ThumbsUp className="w-4.5 h-4.5" />
                        <span>{stats.satisfaction.positiveFeedback}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{t.positiveFeedback}</span>
                    </div>

                    <div className="text-center border-l pl-6 border-zinc-800">
                      <div className="flex items-center gap-1.5 text-rose-400 text-sm font-bold justify-center">
                        <ThumbsDown className="w-4.5 h-4.5" />
                        <span>{stats.satisfaction.negativeFeedback}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{t.negativeFeedback}</span>
                    </div>
                  </div>
                </div>

                {/* Satisfaction custom SVG gauge */}
                <div className="w-full flex justify-center mt-6">
                  <svg className="w-48 h-24" viewBox="0 0 100 50">
                    {/* Background Arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke={darkMode ? '#27272a' : '#e4e4e7'}
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Gauge Arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${stats.satisfaction.satisfactionRate * 1.25}, 125`}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Account Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-md mx-auto animate-in fade-in duration-200">
            <div
              className={`p-6 rounded-2xl border ${
                darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-6 border-b pb-3 border-zinc-800/40">
                <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base">{t.settingsTab}</h3>
              </div>

              {settingsError && (
                <div className="p-3 mb-4 text-xs font-bold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  {settingsError}
                </div>
              )}

              {settingsSuccess && (
                <div className="p-3 mb-4 text-xs font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {settingsSuccess}
                </div>
              )}

              <form
                onSubmit={async e => {
                  e.preventDefault()
                  setSettingsError('')
                  setSettingsSuccess('')

                  if (!adminEmail.trim()) {
                    setSettingsError(isRTL ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email')
                    return
                  }

                  if (adminPassword && adminPassword !== adminConfirmPassword) {
                    setSettingsError(t.passwordMismatchMsg)
                    return
                  }

                  try {
                    await updateSuperAdminSettingsAction({
                      email: adminEmail,
                      password: adminPassword || undefined,
                    })
                    setSettingsSuccess(t.settingsSuccessMsg)
                    setAdminPassword('')
                    setAdminConfirmPassword('')
                  } catch (err) {
                    setSettingsError((err as Error).message || 'Error occurred')
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                      darkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@mazaj.com"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-lg border outline-none transition-all ${
                      darkMode
                        ? 'border-zinc-800 bg-zinc-950 focus:border-amber-500 text-zinc-100'
                        : 'border-zinc-200 bg-zinc-50 focus:border-amber-600 text-zinc-950'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                      darkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-lg border outline-none transition-all ${isRTL ? 'pl-10 pr-3' : 'pr-10 pl-3'} ${
                        darkMode
                          ? 'border-zinc-800 bg-zinc-950 focus:border-amber-500 text-zinc-100'
                          : 'border-zinc-200 bg-zinc-50 focus:border-amber-600 text-zinc-950'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-zinc-400 hover:text-zinc-200 focus:outline-none`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                      darkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={adminConfirmPassword}
                      onChange={e => setAdminConfirmPassword(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-lg border outline-none transition-all ${isRTL ? 'pl-10 pr-3' : 'pr-10 pl-3'} ${
                        darkMode
                          ? 'border-zinc-800 bg-zinc-950 focus:border-amber-500 text-zinc-100'
                          : 'border-zinc-200 bg-zinc-50 focus:border-amber-600 text-zinc-950'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-zinc-400 hover:text-zinc-200 focus:outline-none`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all duration-200 ${
                    darkMode
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/20'
                      : 'bg-amber-700 hover:bg-amber-800 text-white shadow-md'
                  }`}
                >
                  {t.saveSettings}
                </button>
              </form>

              <div className="my-6 border-t border-zinc-800/40" />

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <h4 className="font-extrabold text-sm text-rose-500">{t.maintenanceTitle}</h4>
                </div>

                <div className="p-3 text-[11px] leading-relaxed rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  {t.resetDbWarning}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setSettingsError('')
                      setSettingsSuccess('')
                      const res = await backupDatabaseAction()
                      if (res && res.data) {
                        const blob = new Blob([JSON.stringify(res.data, null, 2)], {
                          type: 'application/json',
                        })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `mazaj_backup_${new Date().toISOString().slice(0, 10)}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      } else {
                        setSettingsError(
                          isRTL ? 'فشل تحميل النسخة الاحتياطية' : 'Failed to download backup',
                        )
                      }
                    } catch (err) {
                      setSettingsError((err as Error).message || 'Backup failed')
                    }
                  }}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all duration-200 border ${
                    darkMode
                      ? 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {t.backupDbBtn}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.json'
                    input.onchange = async (e: Event) => {
                      const target = e.target as HTMLInputElement
                      const file = target.files?.[0]
                      if (!file) return

                      if (!window.confirm(t.restoreDbConfirm)) return

                      try {
                        setSettingsError('')
                        setSettingsSuccess('')
                        const reader = new FileReader()
                        reader.onload = async (event) => {
                          try {
                            const resultStr = event.target?.result as string
                            const backupData = JSON.parse(resultStr)
                            const res = await restoreDatabaseAction(backupData) as { success: boolean; message?: string }
                            if (res && res.success) {
                              setSettingsSuccess(t.restoreDbSuccess)
                              setTimeout(() => {
                                window.location.reload()
                              }, 1500)
                            } else {
                              setSettingsError(res.message || 'Restore failed')
                            }
                          } catch (parseErr) {
                            setSettingsError(
                              isRTL
                                ? 'ملف النسخة الاحتياطية غير صالح'
                                : 'Invalid backup file format',
                            )
                          }
                        }
                        reader.readAsText(file)
                      } catch (err) {
                        setSettingsError((err as Error).message || 'Restore failed')
                      }
                    }
                    input.click()
                  }}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all duration-200 border ${
                    darkMode
                      ? 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {t.restoreDbBtn}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(t.resetDbConfirm)) return
                    if (
                      !window.confirm(
                        isRTL
                          ? 'هل أنت متأكد تماماً بنسبة 100%؟ سيتم مسح كافة المقاهي، الطلبات، التحليلات، الكاشيرية، والمشروبات بشكل نهائي ولن تتمكن من التراجع!'
                          : 'Are you absolutely 100% sure? All cafes, orders, analyses, users, and drinks will be deleted permanently!',
                      )
                    )
                      return

                    try {
                      setSettingsError('')
                      setSettingsSuccess('')
                      const res = await resetDatabaseAction()
                      if (res && res.success && res.report) {
                        const reportMsg = isRTL
                          ? `تمت إعادة تهيئة قاعدة البيانات بنجاح!\n\nتقرير الحذف:\n- عدد الملفات المحذوفة من Storage: ${res.report.deletedFilesCount}\n- عدد السجلات المحذوفة من قاعدة البيانات: ${res.report.deletedRecordsCount}${res.report.failedFiles.length > 0 ? `\n\nملفات فشل حذفها:\n${res.report.failedFiles.join('\n')}` : ''}`
                          : `Database reset successfully!\n\nDeletion Report:\n- Deleted files from Storage: ${res.report.deletedFilesCount}\n- Deleted database records: ${res.report.deletedRecordsCount}${res.report.failedFiles.length > 0 ? `\n\nFailed to delete files:\n${res.report.failedFiles.join('\n')}` : ''}`
                        alert(reportMsg)
                        setSettingsSuccess(t.resetDbSuccess)
                        setTimeout(() => {
                          window.location.reload()
                        }, 1500)
                      } else {
                        setSettingsError((res as { message?: string }).message || 'Reset failed')
                      }
                    } catch (err) {
                      setSettingsError((err as Error).message || 'Reset failed')
                    }
                  }}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all duration-200 ${
                    darkMode
                      ? 'bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/60'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  {t.resetDbBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
