'use client'

import { useTranslations } from 'next-intl'
import {
  Trash2,
  CheckCircle2,
  Sparkles,
  Plus,
  Settings,
  QrCode,
  ClipboardList,
} from 'lucide-react'

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

interface Order {
  id: number
  drinkId: string
  drinkName: string
  price: number
  status: string
  tableNumber?: string | null
  orderType?: string | null
  createdAt: Date
}

interface OrdersTabProps {
  isAr: boolean
  pendingOrders: Order[]
  preparingOrders: Order[]
  readyOrders: Order[]
  completedOrders: Order[]
  parsedAnalyses: Array<{
    id: string
    rawMood: string
    moodNameAr: string
    moodNameEn: string
    drinkNameAr: string
    drinkNameEn: string
    time: Date
  }>
  getWaitTime: (createdAt: Date) => string
  getOrderMood: (order: Order) => string
  formatVal: (val: number) => string
  handleUpdateStatus: (id: number, nextStatus: string) => void
  handleDeleteOrder: (id: number) => void
  setActiveTab: (tab: 'orders' | 'menu' | 'analytics' | 'settings') => void
  setEditingDrink: (drink: Drink | null) => void
  setShowQrModal: (show: boolean) => void
  setShowReportModal: (show: boolean) => void
}

export default function OrdersTab({
  isAr,
  pendingOrders,
  preparingOrders,
  readyOrders,
  completedOrders,
  parsedAnalyses,
  getWaitTime,
  getOrderMood,
  formatVal,
  handleUpdateStatus,
  handleDeleteOrder,
  setActiveTab,
  setEditingDrink,
  setShowQrModal,
  setShowReportModal,
}: OrdersTabProps) {
  const t = useTranslations('admin')

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 3 Columns Grid for Live Kitchen Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* 1. Pending Column */}
        <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/80 flex flex-col min-h-[420px] shadow-sm">
          <div className="flex justify-between items-center border-b border-stone-200/80 pb-3 mb-4">
            <span className="text-xs font-extrabold text-stone-700 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {isAr ? 'الطلبات الواردة (الانتظار)' : 'Incoming Orders (Pending)'}
            </span>
            <span className="bg-stone-200/70 text-stone-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-stone-300/40">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 flex-1 scrollbar-none">
            {pendingOrders.map(order => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-stone-900 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      #{order.id}
                    </span>
                    {order.orderType === 'TABLE' || order.tableNumber ? (
                      <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200/40 flex items-center gap-0.5">
                        🍽️ {isAr ? `طاولة ${order.tableNumber || ''}` : `Table ${order.tableNumber || ''}`}
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200/40 flex items-center gap-0.5">
                        🛍️ {isAr ? 'سفري' : 'Takeaway'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {getWaitTime(order.createdAt)}
                  </span>
                </div>

                <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                  <h4 className="font-bold text-sm text-stone-900">
                    {order.drinkName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-500">
                    <span className="font-semibold">
                      {isAr ? 'المزاج المكتشف:' : 'Detected Mood:'}
                    </span>
                    <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/30">
                      {getOrderMood(order)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-stone-100 text-xs">
                  <span className="font-bold text-stone-900">
                    {formatVal(order.price)}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-[10px] font-bold cursor-pointer shadow-sm active:scale-95 transition-transform"
                    >
                      {isAr ? 'بدء التحضير ⏳' : 'Prepare'}
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <div className="py-12 text-center bg-white rounded-xl border border-dashed border-stone-200/80 flex flex-col items-center justify-center p-6">
                <span className="text-xl mb-1">⏱️</span>
                <p className="text-xs text-stone-400 font-bold">
                  {isAr ? 'لا توجد طلبات معلقة حالياً' : 'No pending orders'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Preparing Column */}
        <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/80 flex flex-col min-h-[420px] shadow-sm">
          <div className="flex justify-between items-center border-b border-stone-200/80 pb-3 mb-4">
            <span className="text-xs font-extrabold text-stone-700 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {isAr ? 'جاري التحضير (في الكوب)' : 'Preparing (In the cup)'}
            </span>
            <span className="bg-stone-200/70 text-stone-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-stone-300/40">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 flex-1 scrollbar-none">
            {preparingOrders.map(order => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-stone-900 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      #{order.id}
                    </span>
                    {order.orderType === 'TABLE' || order.tableNumber ? (
                      <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200/40 flex items-center gap-0.5">
                        🍽️ {isAr ? `طاولة ${order.tableNumber || ''}` : `Table ${order.tableNumber || ''}`}
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200/40 flex items-center gap-0.5">
                        🛍️ {isAr ? 'سفري' : 'Takeaway'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {getWaitTime(order.createdAt)}
                  </span>
                </div>

                <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                  <h4 className="font-bold text-sm text-stone-900">
                    {order.drinkName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-500">
                    <span className="font-semibold">
                      {isAr ? 'المزاج المكتشف:' : 'Detected Mood:'}
                    </span>
                    <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/30">
                      {getOrderMood(order)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-stone-100 text-xs">
                  <span className="font-bold text-stone-900">
                    {formatVal(order.price)}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold cursor-pointer shadow-sm active:scale-95 transition-transform border border-blue-700"
                    >
                      {isAr ? 'جاهز للتسليم 🔔' : 'Ready'}
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {preparingOrders.length === 0 && (
              <div className="py-12 text-center bg-white rounded-xl border border-dashed border-stone-200/80 flex flex-col items-center justify-center p-6">
                <span className="text-xl mb-1">⏳</span>
                <p className="text-xs text-stone-400 font-bold">
                  {isAr ? 'لا توجد طلبات قيد التحضير حالياً' : 'No orders in prep'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Ready Column */}
        <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/80 flex flex-col min-h-[420px] shadow-sm">
          <div className="flex justify-between items-center border-b border-stone-200/80 pb-3 mb-4">
            <span className="text-xs font-extrabold text-stone-700 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? 'جاهز للاستلام (التسليم)' : 'Ready for pickup'}
            </span>
            <span className="bg-stone-200/70 text-stone-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-stone-300/40">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 flex-1 scrollbar-none">
            {readyOrders.map(order => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-stone-900 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      #{order.id}
                    </span>
                    {order.orderType === 'TABLE' || order.tableNumber ? (
                      <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200/40 flex items-center gap-0.5">
                        🍽️ {isAr ? `طاولة ${order.tableNumber || ''}` : `Table ${order.tableNumber || ''}`}
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200/40 flex items-center gap-0.5">
                        🛍️ {isAr ? 'سفري' : 'Takeaway'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {getWaitTime(order.createdAt)}
                  </span>
                </div>

                <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                  <h4 className="font-bold text-sm text-stone-900">
                    {order.drinkName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-500">
                    <span className="font-semibold">
                      {isAr ? 'المزاج المكتشف:' : 'Detected Mood:'}
                    </span>
                    <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/30">
                      {getOrderMood(order)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-stone-100 text-xs">
                  <span className="font-bold text-stone-900">
                    {formatVal(order.price)}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer shadow-sm active:scale-95 transition-transform border border-emerald-700"
                    >
                      {isAr ? 'تم التسليم ✔️' : 'Done'}
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {readyOrders.length === 0 && (
              <div className="py-12 text-center bg-white rounded-xl border border-dashed border-stone-200/80 flex flex-col items-center justify-center p-6">
                <span className="text-xl mb-1">🔔</span>
                <p className="text-xs text-stone-400 font-bold">
                  {isAr ? 'لا توجد طلبات جاهزة حالياً' : 'No orders ready'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: COMPLETED LOGS & FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (8 Cols): Completed Orders Log */}
        <div className="lg:col-span-8">
          <details className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 group">
            <summary className="flex justify-between items-center cursor-pointer list-none focus:outline-none select-none">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  {isAr ? 'الطلبات المكتملة لليوم' : "Today's Completed Orders"}
                </h2>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  {completedOrders.length}
                </span>
              </div>
              <span className="text-[10px] font-bold text-stone-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>

            <div className="pt-4 border-t border-stone-200/60 space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {completedOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400 font-bold">
                  {isAr
                    ? 'لا توجد طلبات مكتملة اليوم بعد.'
                    : 'No orders completed today yet.'}
                </div>
              ) : (
                completedOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-3 bg-stone-50/50 hover:bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
                  >
                    <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                      <div className="flex items-center gap-2">
                        <span className="bg-stone-200 text-stone-800 text-[9px] font-bold px-2 py-0.5 rounded border border-stone-300/30">
                          #{order.id}
                        </span>
                        <span className="font-bold text-sm text-stone-400 line-through">
                          {order.drinkName}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-400 font-semibold">
                        <span>{formatVal(order.price)}</span>
                        <span>•</span>
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString(
                            isAr ? 'ar-IQ' : 'en-US',
                            { hour: '2-digit', minute: '2-digit' },
                          )}
                        </span>
                        <span>•</span>
                        {order.orderType === 'TABLE' || order.tableNumber ? (
                          <span className="text-blue-700 bg-blue-50/60 px-1.5 py-0.5 rounded font-bold border border-blue-100 flex items-center gap-0.5">
                            🍽️ {isAr ? `طاولة ${order.tableNumber || ''}` : `Table ${order.tableNumber || ''}`}
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50/60 px-1.5 py-0.5 rounded font-bold border border-emerald-100 flex items-center gap-0.5">
                            🛍️ {isAr ? 'سفري' : 'Takeaway'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PENDING')}
                        className="flex-grow sm:flex-none px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200/80 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        {isAr ? 'إرجاع للانتظار' : 'Mark Pending'}
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </details>
        </div>

        {/* Right (4 Cols): Live Vibe Feed */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <h3 className="text-[10px] font-extrabold text-stone-700 uppercase tracking-widest">
                  {isAr ? 'نشاط محرك المزاج الحي' : 'Live Mood Feed'}
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {parsedAnalyses.length === 0 ? (
              <p className="text-[11px] text-stone-400 font-bold py-6 text-center">
                {isAr
                  ? 'بانتظار أول عملية فحص للمزاج...'
                  : 'Awaiting first vibe check...'}
              </p>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-none">
                {parsedAnalyses.slice(0, 5).map(ana => (
                  <div
                    key={ana.id}
                    className="p-3 bg-stone-50/50 hover:bg-stone-50 border border-stone-200/80 rounded-xl space-y-1.5 transition-colors text-right rtl:text-right ltr:text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-amber-500/10 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded font-bold">
                        {ana.moodNameAr || ana.rawMood}
                      </span>
                      <span className="text-[8px] text-stone-400 font-semibold">
                        {ana.time.toLocaleTimeString(isAr ? 'ar-IQ' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 font-bold leading-normal">
                      {isAr
                        ? `الترشيح الذكي: ${ana.drinkNameAr}`
                        : `AI Pick: ${ana.drinkNameEn}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM OF PAGE: QUICK ACTIONS */}
      <div className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3 text-right rtl:text-right ltr:text-left">
          {isAr ? 'الإجراءات السريعة للنظام' : 'System Quick Actions'}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setActiveTab('menu')
              setEditingDrink(null)
            }}
            className="bg-stone-50/50 p-4.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:-translate-y-0.5 shadow-sm text-center flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-stone-800">
              {isAr ? '➕ إضافة مشروب' : 'Add Drink'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="bg-stone-50/50 p-4.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:-translate-y-0.5 shadow-sm text-center flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <Settings className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-stone-800">
              {isAr ? '⚙️ إعدادات المقهى' : 'Cafe Settings'}
            </span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="bg-stone-50/50 p-4.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:-translate-y-0.5 shadow-sm text-center flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
              <QrCode className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-stone-800">
              {isAr ? '📷 رمز QR كود' : 'QR Code'}
            </span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="bg-stone-50/50 p-4.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:-translate-y-0.5 shadow-sm text-center flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
              <ClipboardList className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-stone-800">
              {isAr ? '📊 تقرير اليوم' : 'Daily Report'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
