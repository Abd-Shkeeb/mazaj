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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* 1. Pending Column */}
        <div className="bg-amber-50/20 p-5 rounded-2xl border border-amber-600/10 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center border-b border-amber-600/10 pb-3 mb-4">
            <span className="text-xs font-black text-amber-900 tracking-wider">
              {isAr ? 'الطلبات الواردة (الانتظار)' : 'Incoming Orders (Pending)'}
            </span>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 flex-1">
            {pendingOrders.map(order => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-xl border border-amber-600/10 shadow-sm hover:border-amber-600/25 transition-all space-y-3 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-start">
                  <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded">
                    #{order.id}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {getWaitTime(order.createdAt)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-[#3E2723]">
                    {order.drinkName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[9.5px] text-gray-500">
                    <span className="font-bold">
                      {isAr ? 'المزاج المكتشف:' : 'Detected Mood:'}
                    </span>
                    <span className="font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                      {getOrderMood(order)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 text-xs">
                  <span className="font-black text-amber-900">
                    {formatVal(order.price)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="px-3.5 py-1.5 bg-[#3E2723] hover:bg-[#2D1B18] text-white rounded-lg text-[10px] font-black cursor-pointer shadow-sm active:scale-95 transition-transform"
                    >
                      {isAr ? 'بدء التحضير ⏳' : 'Prepare'}
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-[10px] text-gray-400 font-semibold py-8 text-center bg-white rounded-xl border border-dashed border-gray-200">
                {isAr ? 'لا توجد طلبات معلقة' : 'No pending orders'}
              </p>
            )}
          </div>
        </div>

        {/* 2. Preparing Column */}
        <div className="bg-blue-50/20 p-5 rounded-2xl border border-blue-600/10 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center border-b border-blue-600/10 pb-3 mb-4">
            <span className="text-xs font-black text-blue-900 tracking-wider">
              {isAr ? 'جاري التحضير (في الكوب)' : 'Preparing (In the cup)'}
            </span>
            <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 flex-1">
            {preparingOrders.map(order => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-xl border border-blue-600/10 shadow-sm hover:border-blue-600/25 transition-all space-y-3 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-start">
                  <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded">
                    #{order.id}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {getWaitTime(order.createdAt)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-[#3E2723]">
                    {order.drinkName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[9.5px] text-gray-500">
                    <span className="font-bold">
                      {isAr ? 'المزاج المكتشف:' : 'Detected Mood:'}
                    </span>
                    <span className="font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                      {getOrderMood(order)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 text-xs">
                  <span className="font-black text-amber-900">
                    {formatVal(order.price)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-sm active:scale-95 transition-transform"
                    >
                      {isAr ? 'جاهز للتسليم 🔔' : 'Ready'}
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {preparingOrders.length === 0 && (
              <p className="text-[10px] text-gray-400 font-semibold py-8 text-center bg-white rounded-xl border border-dashed border-gray-200">
                {isAr ? 'لا توجد طلبات قيد التحضير' : 'No orders in prep'}
              </p>
            )}
          </div>
        </div>

        {/* 3. Ready Column */}
        <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-600/10 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center border-b border-emerald-600/10 pb-3 mb-4">
            <span className="text-xs font-black text-emerald-900 tracking-wider">
              {isAr ? 'جاهز للاستلام (التسليم)' : 'Ready for pickup'}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 flex-1">
            {readyOrders.map(order => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-xl border border-emerald-600/10 shadow-sm hover:border-emerald-600/25 transition-all space-y-3 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-start">
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded">
                    #{order.id}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {getWaitTime(order.createdAt)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-[#3E2723]">
                    {order.drinkName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[9.5px] text-gray-500">
                    <span className="font-bold">
                      {isAr ? 'المزاج المكتشف:' : 'Detected Mood:'}
                    </span>
                    <span className="font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                      {getOrderMood(order)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 text-xs">
                  <span className="font-black text-amber-900">
                    {formatVal(order.price)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-sm active:scale-95 transition-transform"
                    >
                      {isAr ? 'تم التسليم ✔️' : 'Done'}
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {readyOrders.length === 0 && (
              <p className="text-[10px] text-gray-400 font-semibold py-8 text-center bg-white rounded-xl border border-dashed border-gray-200">
                {isAr ? 'لا توجد طلبات جاهزة للاستلام' : 'No orders ready'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: COMPLETED LOGS & FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (8 Cols): Completed Orders Log */}
        <div className="lg:col-span-8">
          <details className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-sm space-y-4 group">
            <summary className="flex justify-between items-center cursor-pointer list-none focus:outline-none select-none">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                <h2 className="text-xs font-black text-[#3E2723] uppercase tracking-wider">
                  {isAr ? 'الطلبات المكتملة لليوم' : "Today's Completed Orders"}
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-black">
                  {completedOrders.length}
                </span>
              </div>
              <span className="text-[10px] font-black text-amber-800 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>

            <div className="pt-4 border-t border-gray-150 space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {completedOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 font-bold">
                  {isAr
                    ? 'لا توجد طلبات مكتملة اليوم بعد.'
                    : 'No orders completed today yet.'}
                </div>
              ) : (
                completedOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-3 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] rounded-xl border border-[#3E2723]/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
                  >
                    <div className="space-y-1 text-right rtl:text-right ltr:text-left">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#3E2723]/50 text-[#FAF8F5] text-[9px] font-black px-2 py-0.5 rounded">
                          #{order.id}
                        </span>
                        <span className="font-extrabold text-sm text-[#2D2D2D]/60 line-through">
                          {order.drinkName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                        <span>{formatVal(order.price)}</span>
                        <span>•</span>
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString(
                            isAr ? 'ar-IQ' : 'en-US',
                            { hour: '2-digit', minute: '2-digit' },
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PENDING')}
                        className="flex-grow sm:flex-none px-3.5 py-1.5 bg-[#3E2723]/10 hover:bg-[#3E2723]/15 text-[#3E2723] rounded-xl text-[10px] font-black cursor-pointer transition-colors"
                      >
                        {isAr ? 'إرجاع للانتظار' : 'Mark Pending'}
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
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
          <div className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <h3 className="text-[10px] font-black text-[#3E2723] uppercase tracking-widest">
                  {isAr ? 'نشاط محرك المزاج الحي' : 'Live Mood Feed'}
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {parsedAnalyses.length === 0 ? (
              <p className="text-[11px] text-gray-400 font-bold py-6 text-center">
                {isAr
                  ? 'بانتظار أول عملية فحص للمزاج...'
                  : 'Awaiting first vibe check...'}
              </p>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {parsedAnalyses.slice(0, 5).map(ana => (
                  <div
                    key={ana.id}
                    className="p-3 bg-amber-50/40 hover:bg-amber-50 border border-amber-500/10 rounded-xl space-y-1.5 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-amber-500/10 text-amber-800 px-2 py-0.5 rounded font-black">
                        {ana.moodNameAr || ana.rawMood}
                      </span>
                      <span className="text-[8px] text-gray-400 font-semibold">
                        {ana.time.toLocaleTimeString(isAr ? 'ar-IQ' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-bold leading-normal">
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
      {(pendingOrders.length > 0 ||
        preparingOrders.length > 0 ||
        readyOrders.length > 0) && (
          <div className="bg-white border border-[#3E2723]/10 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-[#3E2723] uppercase tracking-wider border-b border-gray-100 pb-3">
              {isAr ? 'الإجراءات السريعة للنظام' : 'System Quick Actions'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setActiveTab('menu')
                  setEditingDrink(null)
                }}
                className="bg-[#FAF8F5] p-4.5 rounded-xl border border-gray-200 shadow-sm text-center flex flex-col items-center gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-[#3E2723]/20 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-black text-[#3E2723]">
                  {isAr ? '➕ إضافة مشروب' : 'Add Drink'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="bg-[#FAF8F5] p-4.5 rounded-xl border border-gray-200 shadow-sm text-center flex flex-col items-center gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-[#3E2723]/20 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Settings className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-black text-[#3E2723]">
                  {isAr ? '⚙️ إعدادات المقهى' : 'Cafe Settings'}
                </span>
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="bg-[#FAF8F5] p-4.5 rounded-xl border border-gray-200 shadow-sm text-center flex flex-col items-center gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-[#3E2723]/20 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <QrCode className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-black text-[#3E2723]">
                  {isAr ? '📷 رمز QR كود' : 'QR Code'}
                </span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="bg-[#FAF8F5] p-4.5 rounded-xl border border-gray-200 shadow-sm text-center flex flex-col items-center gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-[#3E2723]/20 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ClipboardList className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-black text-[#3E2723]">
                  {isAr ? '📊 تقرير اليوم' : 'Daily Report'}
                </span>
              </button>
            </div>
          </div>
        )}
    </div>
  )
}
