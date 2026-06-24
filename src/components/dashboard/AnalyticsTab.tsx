'use client'

import React, { useState } from 'react'
import {
  Coffee,
  Heart,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  QrCode,
  ShoppingBag,
} from 'lucide-react'
import UpgradeOverlay from '@/components/dashboard/UpgradeOverlay'

interface Order {
  id: number
  drinkId: string
  drinkName: string
  price: number
  status: string
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

interface AnalyticsTabProps {
  isAr: boolean
  orders: Order[]
  analyses: Analysis[]
  activeAnalyticsSubTab: 'kiosk' | 'sales' | 'reports' | 'beta_analytics' | 'beta_reports'
  setActiveAnalyticsSubTab: (tab: 'kiosk' | 'sales' | 'reports' | 'beta_analytics' | 'beta_reports') => void
  limits: {
    maxDrinks: number
    maxUsers: number
    hasMoodAnalytics: boolean
    hasSalesReports: boolean
    hasBetaAnalytics: boolean
    hasFunnelAnalytics: boolean
    hasMultiBranch: boolean
  }
  totalOpens: number
  startAnalyses: number
  completeAnalyses: number
  createOrders: number
  completeOrdersCount: number
  betaFeedbackRate: number
  betaConversionRate: number
  monthlyRevenue: number
  todayRevenue: number
  todayOrders: Order[]
  todayAnalyses: Analysis[]
  popularDrinksList: Array<{ name: string; count: number }>
  popularMoodsList: Array<{ name: string; count: number }>
  orderGrowthRate: number
  formatVal: (val: number) => string
  last7DaysSales: Array<{ day: string; sales: number; orders: number; analyses: number }>
  last30DaysSales: Array<{ day: string; sales: number }>
  setActiveTab: (tab: 'orders' | 'menu' | 'analytics' | 'settings') => void
}

export default function AnalyticsTab({
  isAr,
  orders,
  analyses,
  activeAnalyticsSubTab,
  setActiveAnalyticsSubTab,
  limits,
  totalOpens,
  startAnalyses,
  completeAnalyses,
  createOrders,
  completeOrdersCount,
  betaFeedbackRate,
  betaConversionRate,
  monthlyRevenue,
  todayRevenue,
  todayOrders,
  todayAnalyses,
  popularDrinksList,
  popularMoodsList,
  orderGrowthRate,
  formatVal,
  last7DaysSales,
  last30DaysSales,
  setActiveTab,
}: AnalyticsTabProps) {
  const [activeChartMetric, setActiveChartMetric] = useState<'sales' | 'orders' | 'analyses'>('sales')

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Sub-tabs menu for Analytics */}
      <div className="flex bg-gray-150 p-1 rounded-2xl border border-gray-200 gap-1 w-full max-w-2xl mx-auto sm:mx-0 overflow-x-auto scrollbar-none">
        {[
          { id: 'kiosk', label: isAr ? '📊 إحصائيات الكشك' : 'Kiosk Stats' },
          { id: 'sales', label: isAr ? '💰 إحصائيات المبيعات' : 'Sales Stats' },
          { id: 'reports', label: isAr ? '📈 التقارير البيانية' : 'Visual Reports' },
          { id: 'beta_analytics', label: isAr ? '🧪 تحليلات البيتا' : 'Beta Analytics' },
          { id: 'beta_reports', label: isAr ? '📋 تقارير البيتا' : 'Beta Reports' },
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() =>
              setActiveAnalyticsSubTab(
                sub.id as
                  | 'kiosk'
                  | 'sales'
                  | 'reports'
                  | 'beta_analytics'
                  | 'beta_reports',
              )
            }
            className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeAnalyticsSubTab === sub.id
                ? 'bg-white text-[#3E2723] shadow-sm'
                : 'text-[#3E2723]/60 hover:text-[#3E2723]'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Sub Tab Content: 📊 KIOSK STATS */}
      {activeAnalyticsSubTab === 'kiosk' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-250">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <div className="text-right rtl:text-right ltr:text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {isAr ? 'عدد مرات فتح الكشك' : 'Kiosk Sessions'}
                </span>
                <h3 className="text-2xl font-black text-[#2D2D2D] mt-2">
                  {orders.length + analyses.length > 0
                    ? (orders.length + analyses.length * 1.5).toFixed(0)
                    : '0'}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                <ExternalLink className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[10.5px] text-gray-400 font-bold">
              {isAr
                ? 'محسوب من إجمالي التفاعلات الحقيقية'
                : 'Estimated visitor sessions from actions'}
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <div className="text-right rtl:text-right ltr:text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {isAr ? 'عدد تحليلات المزاج' : 'Vibe Analyses'}
                </span>
                <h3 className="text-2xl font-black text-[#2D2D2D] mt-2">
                  #{analyses.length}
                </h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[10.5px] text-gray-400 font-bold">
              {isAr
                ? 'فحوصات المزاج المكتملة بالذكاء الاصطناعي'
                : 'Vibe matching logs stored'}
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <div className="text-right rtl:text-right ltr:text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {isAr ? 'عدد المشروبات المقترحة' : 'AI Drinks Suggested'}
                </span>
                <h3 className="text-2xl font-black text-[#2D2D2D] mt-2">
                  {analyses.filter(a => a.aiResult).length}
                </h3>
              </div>
              <div className="p-3 bg-[#3E2723]/5 text-[#3E2723] rounded-xl border border-[#3E2723]/10">
                <Coffee className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[10.5px] text-gray-400 font-bold">
              {isAr
                ? 'المشروبات التي تم عرضها كترشيحات ذكية'
                : 'Drink recommendation results shown'}
            </span>
          </div>
        </div>
      )}

      {/* Sub Tab Content: 💰 SALES STATS */}
      {activeAnalyticsSubTab === 'sales' &&
        (!limits.hasSalesReports ? (
          <UpgradeOverlay
            isAr={isAr}
            setActiveTab={setActiveTab}
            titleAr="تقارير المبيعات المتقدمة"
            titleEn="Advanced Sales Analytics"
            requiredPlan="ستاندرد (Standard)"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-250">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {isAr ? 'إيرادات اليوم الحالية' : 'Today\'s Revenue'}
                  </span>
                  <h3 className="text-2xl font-black text-emerald-800 mt-2">
                    {formatVal(todayRevenue)}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10.5px] text-gray-400 font-bold">
                {isAr
                  ? 'مبيعات الكشك والطلبات المباشرة لليوم'
                  : 'Total sales processed today'}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {isAr ? 'مبيعات آخر 30 يوماً' : '30-Day Revenue'}
                  </span>
                  <h3 className="text-2xl font-black text-[#2D2D2D] mt-2">
                    {formatVal(monthlyRevenue)}
                  </h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10.5px] text-gray-400 font-bold">
                {isAr
                  ? 'إجمالي المبيعات للشهر الماضي'
                  : 'Accumulated revenue over 30 days'}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {isAr ? 'متوسط قيمة الطلب' : 'Avg Order Value'}
                  </span>
                  <h3 className="text-2xl font-black text-[#2D2D2D] mt-2">
                    {orders.length > 0
                      ? formatVal(
                          Math.round(
                            orders.reduce((sum, o) => sum + o.price, 0) /
                              orders.length,
                          ),
                        )
                      : '0'}
                  </h3>
                </div>
                <div className="p-3 bg-[#3E2723]/5 text-[#3E2723] rounded-xl border border-[#3E2723]/10">
                  <Coffee className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10.5px] text-gray-400 font-bold">
                {isAr
                  ? 'متوسط سلة المشتريات للزبون الواحد'
                  : 'Average spending per checkout session'}
              </span>
            </div>
          </div>
        ))}

      {/* Sub Tab Content: 📈 VISUAL REPORTS (Charts) */}
      {activeAnalyticsSubTab === 'reports' &&
        (!limits.hasSalesReports ? (
          <UpgradeOverlay
            isAr={isAr}
            setActiveTab={setActiveTab}
            titleAr="تقارير بيانية تفاعلية"
            titleEn="Interactive Visual Reports"
            requiredPlan="ستاندرد (Standard)"
          />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-250">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: 7-Day Performance */}
              <div className="bg-white p-6 rounded-2xl border border-gray-250 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="text-right rtl:text-right ltr:text-left">
                    <h3 className="text-xs font-black text-[#3E2723]">
                      {isAr ? 'مخطط الأداء الأسبوعي' : 'Weekly Activity Trend'}
                    </h3>
                    <p className="text-[9.5px] text-gray-400 font-bold">
                      {isAr
                        ? 'مقارنة المبيعات والطلبات وتحليلات المزاج للـ 7 أيام الأخيرة'
                        : 'Overview of sales, order volume, and vibe checks'}
                    </p>
                  </div>

                  <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                    {[
                      { id: 'sales', label: isAr ? 'المبيعات' : 'Sales' },
                      { id: 'orders', label: isAr ? 'الطلبات' : 'Orders' },
                      { id: 'analyses', label: isAr ? 'التحليلات' : 'Analyses' },
                    ].map(metric => (
                      <button
                        key={metric.id}
                        onClick={() =>
                          setActiveChartMetric(
                            metric.id as 'sales' | 'orders' | 'analyses',
                          )
                        }
                        className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                          activeChartMetric === metric.id
                            ? 'bg-white text-[#3E2723] shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {metric.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weekly SVG Chart Drawing */}
                <div className="relative h-48 w-full pt-4">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 700 200"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGrad7" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3E2723" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3E2723" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="50" y1="20" x2="650" y2="20" stroke="#f5f5f5" strokeWidth="1" />
                    <line x1="50" y1="70" x2="650" y2="70" stroke="#f5f5f5" strokeWidth="1" />
                    <line x1="50" y1="120" x2="650" y2="120" stroke="#f5f5f5" strokeWidth="1" />
                    <line x1="50" y1="170" x2="650" y2="170" stroke="#e9e9e9" strokeWidth="1" />

                    {(() => {
                      const maxVal =
                        activeChartMetric === 'sales'
                          ? Math.max(1000, ...last7DaysSales.map(d => d.sales))
                          : activeChartMetric === 'orders'
                            ? Math.max(1, ...last7DaysSales.map(d => d.orders))
                            : Math.max(1, ...last7DaysSales.map(d => d.analyses))

                      const points = last7DaysSales.map((d, i) => {
                        const val = d[activeChartMetric]
                        const x = 50 + i * 100
                        const y = 170 - (val / (maxVal || 1)) * 130
                        return { x, y, label: d.day, val }
                      })

                      const linePath = points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ')
                      const areaPath = `${linePath} L 650 170 L 50 170 Z`

                      return (
                        <>
                          <path d={areaPath} fill="url(#chartGrad7)" />
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#3E2723"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />

                          {points.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="4.5"
                                fill="#3E2723"
                                stroke="#FAF8F5"
                                strokeWidth="1.5"
                              />
                              <text
                                x={p.x}
                                y={p.y - 10}
                                textAnchor="middle"
                                className="text-[9px] font-black fill-[#3E2723] opacity-80"
                              >
                                {activeChartMetric === 'sales'
                                  ? `${(p.val / 1000).toFixed(0)}k`
                                  : p.val}
                              </text>
                              <text
                                x={p.x}
                                y="188"
                                textAnchor="middle"
                                className="text-[9px] font-bold fill-gray-400"
                              >
                                {p.label}
                              </text>
                            </g>
                          ))}
                        </>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              {/* Chart 2: 30-Day Sales Performance */}
              <div className="bg-white p-6 rounded-2xl border border-gray-250 shadow-sm space-y-4">
                <div className="text-right rtl:text-right ltr:text-left border-b border-gray-100 pb-4">
                  <h3 className="text-xs font-black text-[#3E2723]">
                    {isAr ? 'مخطط الإيرادات خلال 30 يوماً' : '30-Day Revenue Trend'}
                  </h3>
                  <p className="text-[9.5px] text-gray-400 font-bold">
                    {isAr
                      ? `إجمالي إيرادات الشهر: ${formatVal(monthlyRevenue)}`
                      : `Total monthly sales: ${formatVal(monthlyRevenue)}`}
                  </p>
                </div>

                {/* Monthly SVG Chart Drawing */}
                <div className="relative h-48 w-full pt-4">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 700 200"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGrad30" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3E2723" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3E2723" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="30" y1="20" x2="670" y2="20" stroke="#f7f7f7" strokeWidth="1" />
                    <line x1="30" y1="70" x2="670" y2="70" stroke="#f7f7f7" strokeWidth="1" />
                    <line x1="30" y1="120" x2="670" y2="120" stroke="#f7f7f7" strokeWidth="1" />
                    <line x1="30" y1="170" x2="670" y2="170" stroke="#e9e9e9" strokeWidth="1" />

                    {(() => {
                      const maxVal = Math.max(1000, ...last30DaysSales.map(d => d.sales))
                      const points = last30DaysSales.map((d, i) => {
                        const x = 30 + i * (640 / 29)
                        const y = 170 - (d.sales / (maxVal || 1)) * 130
                        return { x, y, label: d.day, val: d.sales }
                      })

                      const linePath = points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ')
                      const areaPath = `${linePath} L 670 170 L 30 170 Z`

                      return (
                        <>
                          <path d={areaPath} fill="url(#chartGrad30)" />
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#5D4037"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />

                          {/* Dots for key peaks only (to avoid screen clutter on 30 points) */}
                          {points.map((p, i) => {
                            const isPeak =
                              p.val > 0 &&
                              (i === 0 || i === 29 || p.val === maxVal || i % 5 === 0)
                            if (!isPeak) return null
                            return (
                              <g key={i} className="group">
                                <circle cx={p.x} cy={p.y} r="3" fill="#5D4037" />
                                <text
                                  x={p.x}
                                  y={p.y - 8}
                                  textAnchor="middle"
                                  className="text-[8px] font-black fill-[#3E2723]"
                                >
                                  {`${(p.val / 1000).toFixed(0)}k`}
                                </text>
                                <text
                                  x={p.x}
                                  y="188"
                                  textAnchor="middle"
                                  className="text-[8px] font-bold fill-gray-400"
                                >
                                  {p.label}
                                </text>
                              </g>
                            )
                          })}
                        </>
                      )
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Popular details lists & Growth indicator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Popular Drinks */}
              <div className="bg-white p-6 rounded-2xl border border-gray-250 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-[#2D2D2D] flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Coffee className="h-4.5 w-4.5 text-amber-600" />
                  <span>
                    {isAr ? 'أكثر المشروبات طلباً اليوم' : 'Top Ordered Drinks'}
                  </span>
                </h3>

                {popularDrinksList.length === 0 ? (
                  <p className="text-xs text-gray-500 font-bold text-center py-12">
                    {isAr ? 'لا توجد بيانات بعد.' : 'No data yet.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {popularDrinksList.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-2 border-b border-gray-55 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-[#3E2723]/5 text-[#3E2723] flex items-center justify-center font-black text-[9.5px]">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-[#2D2D2D]">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] bg-[#3E2723]/5 text-[#3E2723] font-black px-2 py-0.5 rounded-full">
                          {item.count} {isAr ? 'طلبات' : 'orders'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mood Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-gray-250 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-[#2D2D2D] flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Heart className="h-4.5 w-4.5 text-rose-600" />
                  <span>{isAr ? 'توزيع أمزجة العملاء' : 'Mood Distribution'}</span>
                </h3>

                {popularMoodsList.length === 0 ? (
                  <p className="text-xs text-gray-500 font-bold text-center py-12">
                    {isAr ? 'لا توجد بيانات بعد.' : 'No customer moods recorded.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {popularMoodsList.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-2 border-b border-gray-55 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-rose-50 text-rose-700 flex items-center justify-center font-black text-[9.5px]">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-[#2D2D2D]">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] bg-rose-50 text-rose-700 font-black px-2 py-0.5 rounded-full">
                          {item.count} {isAr ? 'تكرار' : 'times'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Growth Rate / Growth Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-250 shadow-sm flex flex-col justify-between h-fit min-h-[180px]">
                <div className="space-y-2 text-right rtl:text-right ltr:text-left">
                  <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest">
                    {isAr ? 'معدل نمو الطلبات' : 'Order Growth Rate'}
                  </span>
                  <h3 className="text-sm font-black text-[#2D2D2D] border-b border-gray-100 pb-3">
                    {isAr ? 'النمو مقارنة بالأسبوع الماضي' : 'Growth vs Previous Week'}
                  </h3>
                </div>

                <div className="py-2 flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl flex items-center justify-center ${
                      orderGrowthRate >= 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    <TrendingUp className="h-7 w-7" />
                  </div>
                  <div>
                    <span
                      className={`text-2xl font-black block ${
                        orderGrowthRate >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {orderGrowthRate >= 0
                        ? `+${orderGrowthRate}%`
                        : `${orderGrowthRate}%`}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                      {isAr
                        ? 'نمو الطلبات الكلية للأسبوع الحالي'
                        : 'Overall order count velocity'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed pt-2 border-t border-gray-100">
                  {isAr
                    ? 'يتم حساب هذا المؤشر أوتوماتيكياً بمقارنة مبيعات الـ 7 أيام الأخيرة بالـ 7 أيام التي سبقتها.'
                    : 'Automatically derived by comparing last 7 days vs previous 7-day window.'}
                </p>
              </div>
            </div>
          </div>
        ))}

      {/* Sub Tab Content: 🧪 BETA ANALYTICS & FUNNEL */}
      {activeAnalyticsSubTab === 'beta_analytics' &&
        (!limits.hasBetaAnalytics ? (
          <UpgradeOverlay
            isAr={isAr}
            setActiveTab={setActiveTab}
            titleAr="تحليلات البيتا المتقدمة"
            titleEn="Advanced Beta Analytics"
            requiredPlan="برو (Pro)"
          />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-250">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#3E2723]/10 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-36">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {isAr ? 'عدد مرات فتح الكشك' : 'Kiosk Opens'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#2D2D2D] leading-none">
                      {totalOpens}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/10 flex items-center justify-center">
                    <QrCode className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-[#3E2723]/5 mt-auto text-[9.5px]">
                  <span className="text-gray-400 font-bold">
                    {isAr ? 'مسح رمز الاستجابة السريع' : 'Scanned QR code events'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#3E2723]/10 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-36">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {isAr ? 'عمليات فحص ومسح المزاج' : 'Vibe Checks Done'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#2D2D2D] leading-none">
                      {completeAnalyses}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-700 border border-purple-500/10 flex items-center justify-center">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-[#3E2723]/5 mt-auto text-[9.5px]">
                  <span className="text-gray-400 font-bold">
                    {isAr
                      ? 'تحليلات الذكاء الاصطناعي الناجحة'
                      : 'Successful recommendation flows'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#3E2723]/10 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-36">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {isAr ? 'طلبات الكشك الكلية' : 'Kiosk Orders'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#2D2D2D] leading-none">
                      {createOrders}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-700 border border-blue-500/10 flex items-center justify-center">
                    <ShoppingBag className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-[#3E2723]/5 mt-auto text-[9.5px]">
                  <span className="text-gray-400 font-bold">
                    {isAr
                      ? 'الطلبات المنجزة من شاشة التوصية'
                      : 'Created orders from recommended screen'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#3E2723]/10 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-36">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {isAr ? 'معدل التحويل الكلي' : 'Beta Conversion Rate'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-800 leading-none">
                      %{betaConversionRate}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-[#3E2723]/5 mt-auto text-[9.5px]">
                  <span className="text-gray-400 font-bold">
                    {isAr ? 'مسح QR Code ← طلب مكتمل' : 'From scan to placed order'}
                  </span>
                </div>
              </div>
            </div>

            {/* Funnel Analytics Visual Representation */}
            <div className="bg-white p-6 rounded-2xl border border-gray-250 shadow-sm space-y-6">
              <div className="text-right rtl:text-right ltr:text-left space-y-1">
                <h3 className="text-sm font-black text-[#3E2723]">
                  {isAr
                    ? 'قناة التحليل والتفاعل للعملاء (Funnel)'
                    : 'Customer Conversion Funnel'}
                </h3>
                <p className="text-[10px] text-gray-550 font-bold">
                  {isAr
                    ? 'معدلات تسرب المستخدمين وانتقالهم بين خطوات تجربة الكشك الفورية.'
                    : 'Detailed conversion metrics and drop-off rates for the beta flow.'}
                </p>
              </div>

              <div className="space-y-4 max-w-4xl mx-auto pt-4">
                {[
                  {
                    stepName: isAr
                      ? '1. مسح رمز الاستجابة السريع (QR Scan)'
                      : '1. QR Scan',
                    count: totalOpens,
                    percent: 100,
                    color: 'from-amber-400 to-amber-500',
                  },
                  {
                    stepName: isAr
                      ? '2. بدء فحص المزاج (Mood Selection)'
                      : '2. Start Vibe Selection',
                    count: startAnalyses,
                    percent:
                      totalOpens > 0 ? Math.round((startAnalyses / totalOpens) * 100) : 0,
                    color: 'from-orange-400 to-orange-500',
                  },
                  {
                    stepName: isAr
                      ? '3. الحصول على التوصية (AI Recommendation)'
                      : '3. Get AI Recommendation',
                    count: completeAnalyses,
                    percent:
                      totalOpens > 0
                        ? Math.round((completeAnalyses / totalOpens) * 100)
                        : 0,
                    color: 'from-purple-500 to-purple-600',
                  },
                  {
                    stepName: isAr ? '4. إنشاء الطلب (Order Creation)' : '4. Place Order',
                    count: createOrders,
                    percent:
                      totalOpens > 0 ? Math.round((createOrders / totalOpens) * 100) : 0,
                    color: 'from-blue-500 to-blue-600',
                  },
                  {
                    stepName: isAr
                      ? '5. اكتمال الطلب عند الكاشير (Order Completed)'
                      : '5. Order Completed',
                    count: completeOrdersCount,
                    percent:
                      totalOpens > 0
                        ? Math.round((completeOrdersCount / totalOpens) * 100)
                        : 0,
                    color: 'from-emerald-500 to-emerald-600',
                  },
                ].map((step, idx, arr) => {
                  const dropOff =
                    idx > 0 && arr[idx - 1].count > 0
                      ? Math.round(
                          ((arr[idx - 1].count - step.count) / arr[idx - 1].count) * 100,
                        )
                      : 0

                  return (
                    <div key={idx} className="space-y-2">
                      {idx > 0 && (
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold px-4">
                          <span>
                            ↓ {isAr ? 'معدل التسرب:' : 'Drop-off rate:'} {dropOff}%
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-[#FAF8F5] rounded-xl border border-gray-150 relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-[#3E2723]/3 opacity-5 pointer-events-none" />
                        <div className="text-right rtl:text-right ltr:text-left z-10">
                          <h4 className="text-xs font-black text-[#3E2723]">
                            {step.stepName}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {step.count} {isAr ? 'تفاعلات' : 'actions'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-1/2 z-10">
                          <div className="flex-1 bg-gray-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${step.color} transition-all duration-500`}
                              style={{ width: `${step.percent}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-[#3E2723] whitespace-nowrap min-w-[40px]">
                            {step.percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}

      {/* Sub Tab Content: 📋 BETA REPORTS */}
      {activeAnalyticsSubTab === 'beta_reports' &&
        (!limits.hasBetaAnalytics ? (
          <UpgradeOverlay
            isAr={isAr}
            setActiveTab={setActiveTab}
            titleAr="تقارير البيتا المتقدمة"
            titleEn="Advanced Beta Reports"
            requiredPlan="برو (Pro)"
          />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-250">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left: Satisfaction Stats */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-250 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#3E2723]">
                    {isAr
                      ? 'تقييم رضا الزبائن (Feedback)'
                      : 'Customer Satisfaction Ratings'}
                  </h3>
                  <p className="text-[10px] text-gray-550 font-bold">
                    {isAr
                      ? 'التقييم الفوري للتوصية بعد عرض المشروب المقترح.'
                      : 'Real feedback recorded after vibe analysis recommendations.'}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-2xl border border-gray-150 relative">
                  <span className="text-5xl font-black text-emerald-800">
                    %{betaFeedbackRate}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                    {isAr ? 'معدل الرضا العام' : 'Overall Satisfaction Rate'}
                  </span>

                  <div className="flex gap-6 mt-6 w-full px-6">
                    <div className="flex-1 text-center bg-white p-3 rounded-xl border border-gray-150">
                      <span className="text-xl">👍</span>
                      <h4 className="text-xs font-black text-emerald-700 mt-1">
                        {analyses.filter(a => a.feedbackVal === true).length}
                      </h4>
                      <span className="text-[9px] text-gray-400 font-bold">
                        {isAr ? 'مناسب' : 'Accurate'}
                      </span>
                    </div>

                    <div className="flex-1 text-center bg-white p-3 rounded-xl border border-gray-150">
                      <span className="text-xl">👎</span>
                      <h4 className="text-xs font-black text-rose-700 mt-1">
                        {analyses.filter(a => a.feedbackVal === false).length}
                      </h4>
                      <span className="text-[9px] text-gray-400 font-bold">
                        {isAr ? 'غير مناسب' : 'Inaccurate'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                  {isAr
                    ? 'يتم تحديث هذه البيانات تلقائياً بمجرد ضغط الزبون على أزرار التقييم التفاعلية في شاشة النتيجة النهائية.'
                    : 'This data refreshes as soon as clients interact with the feedback mechanism on their device.'}
                </p>
              </div>

              {/* Right: Drinks Feedback Detailed */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-250 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#2D2D2D]">
                    {isAr
                      ? 'دقة التوصيات حسب المشروبات'
                      : 'Accuracy Breakdown by Recommended Drinks'}
                  </h3>
                  <p className="text-[10px] text-gray-550 font-bold">
                    {isAr
                      ? 'أداء توصيات الذكاء الاصطناعي لكل مشروب بناءً على التقييم.'
                      : 'Detailed recommendations accuracy statistics per menu item.'}
                  </p>
                </div>

                <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto pr-1">
                  {(() => {
                    const counts: Record<
                      string,
                      { positive: number; negative: number; total: number; name: string }
                    > = {}
                    analyses.forEach(ana => {
                      try {
                        const res = JSON.parse(ana.aiResult)
                        const name = isAr ? res.suitableDrinkAr : res.suitableDrinkEn
                        if (name) {
                          if (!counts[name]) {
                            counts[name] = { positive: 0, negative: 0, total: 0, name }
                          }
                          counts[name].total += 1
                          if (ana.feedbackVal === true) counts[name].positive += 1
                          if (ana.feedbackVal === false) counts[name].negative += 1
                        }
                      } catch (e) {}
                    })

                    const list = Object.values(counts).sort((a, b) => b.total - a.total)
                    if (list.length === 0) {
                      return (
                        <p className="text-xs text-gray-500 font-semibold text-center py-12">
                          {isAr
                            ? 'لا توجد بيانات تقييم حقيقية بعد.'
                            : 'No feedback data recorded yet.'}
                        </p>
                      )
                    }

                    return list.map((item, idx) => {
                      const positiveRate =
                        item.positive + item.negative > 0
                          ? Math.round(
                              (item.positive / (item.positive + item.negative)) * 100,
                            )
                          : 100

                      return (
                        <div
                          key={idx}
                          className="py-3 flex items-center justify-between text-xs gap-4"
                        >
                          <div className="flex-1">
                            <h4 className="font-extrabold text-[#2D2D2D]">{item.name}</h4>
                            <span className="text-[9.5px] text-gray-400 font-bold block mt-0.5">
                              {isAr
                                ? `إجمالي التوصيات: ${item.total}`
                                : `Suggested ${item.total} times`}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs font-black text-emerald-700">
                                %{positiveRate}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold block">
                                {isAr ? 'دقة المطابقة' : 'Accuracy'}
                              </span>
                            </div>
                            <div className="flex gap-2 text-[10px] font-black">
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                👍 {item.positive}
                              </span>
                              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                👎 {item.negative}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
