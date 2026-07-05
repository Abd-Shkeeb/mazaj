'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Landmark, X } from 'lucide-react'

export default function Demo() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  // Advanced Cashier-Kiosk Simulator States
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
    <section
      id="simulator"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full border-t border-[#3E2723]/10"
    >
      <motion.div
        className="text-center mb-16 space-y-3"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase tracking-wider">
          <Landmark className="h-3.5 w-3.5" />
          <span>{isAr ? 'تجربة المحاكاة الثنائية المغلقة' : 'Closed-loop Mockup Simulation'}</span>
        </div>
        <h2 className="text-4xl font-black text-[#3E2723] tracking-tight sm:text-5xl">
          {isAr
            ? 'شاهد مزاج أثناء العمل: لوحة تحكم ومحاكي تفاعلي متقدم'
            : 'See Mazaj in Action: Cashier & Kiosk Simulator'}
        </h2>
        <p className="text-[#5D4037]/80 font-bold text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'تفاعل مع كشك الزبون على اليمين واشهد كيف تنتقل الطلبات فورياً وتتحرك الإحصائيات في لوحة تحكم الكاشير على اليسار!'
            : 'Interact with the customer kiosk on the right and watch mock orders transmit instantly to the cashier dashboard on the left!'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT: CASHIER DASHBOARD MOCKUP */}
        <motion.div
          className="lg:col-span-7 bg-[#3E2723] rounded-3xl px-6 pb-6 pt-9 border border-[#5D4037]/20 shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[520px]"
          initial={{ opacity: 0, x: isAr ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#3E2723]/90 text-amber-300 border border-amber-300/20 text-[8px] font-black px-2.5 py-0.5 rounded-full z-30 uppercase tracking-widest shadow-sm">
            {isAr ? '⚠️ بيانات تجريبية - Demo Data' : '⚠️ Demo Data'}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-30 pointer-events-none" />

          <div className="flex justify-between items-center pb-4 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="text-sm font-black text-white">
                  {isAr ? 'لوحة تحكم الكاشير الذكية' : 'Smart Cashier Console'}
                </h3>
                <span className="text-[9px] text-[#F5E6D3]/60 font-semibold">
                  {isAr ? 'مقهى مزاج الدافئ - اتصال نشط' : 'Warm Mazaj Cafe - Connected'}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-wider">
              {isAr ? 'مباشر' : 'Live'}
            </span>
          </div>

          <AnimatePresence>
            {dashNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-20 inset-x-6 z-20 bg-emerald-600 text-white p-3 rounded-xl shadow-lg border border-emerald-500 text-xs font-black flex items-center justify-between"
              >
                <span>{dashNotification}</span>
                <button
                  onClick={() => setDashNotification(null)}
                  className="p-1 text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-4 py-6 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="text-[9px] font-bold text-[#FAF8F5]/60 block mb-1">
                {isAr ? 'إجمالي عمليات المسح' : 'Total Scans'}
              </span>
              <span className="text-xl font-black text-white">{dashScans}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center relative overflow-hidden">
              <span className="text-[9px] font-bold text-[#FAF8F5]/60 block mb-1">
                {isAr ? 'الطلبات المستلمة' : 'Mock Orders'}
              </span>
              <span className="text-xl font-black text-amber-300">{dashOrdersCount}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="text-[9px] font-bold text-[#FAF8F5]/60 block mb-1">
                {isAr ? 'الأرباح المحاكاة' : 'Est. Revenue'}
              </span>
              <span className="text-xl font-black text-emerald-400">
                {isAr
                  ? `${dashRevenue.toLocaleString('ar-IQ')} د.ع`
                  : `${dashRevenue.toLocaleString('en-US')} IQD`}
              </span>
            </div>
          </div>

          <div className="flex-grow space-y-3 relative z-10">
            <h4 className="text-[10px] font-black text-amber-300 uppercase tracking-widest">
              {isAr ? 'طلبات الكشك الواردة مباشرة' : 'Live Kiosk Incoming Orders Feed'}
            </h4>

            <div className="space-y-2 max-h-[200px] overflow-hidden">
              <AnimatePresence initial={false}>
                {dashOrdersList.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -30, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 30, height: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className="bg-white/10 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs text-white"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{order.mood}</span>
                      <div>
                        <div className="font-black text-white">{order.drink}</div>
                        <div className="text-[9px] text-[#F5E6D3]/60 font-semibold">
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
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">
                        {isAr ? 'جديد' : 'New'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[9px] font-bold text-[#FAF8F5]/40 flex justify-between relative z-10">
            <span>{isAr ? 'صلاحيات المشرف: نشطة' : 'Staff Role: Active Cashier'}</span>
            <span>{isAr ? 'تحديث فوري عبر WebSocket' : 'Real-time WebSocket connection'}</span>
          </div>
        </motion.div>

        {/* RIGHT: CUSTOMER KIOSK SMARTPHONE MOCKUP */}
        <motion.div
          className="lg:col-span-5 flex items-center justify-center"
          initial={{ opacity: 0, x: isAr ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full max-w-[380px] bg-white rounded-3xl px-4 pb-4 pt-9 border border-[#3E2723]/10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-[#3E2723] text-[8px] font-black px-2.5 py-0.5 rounded-full z-30 uppercase tracking-widest shadow-sm">
              {isAr ? '⚠️ بيانات تجريبية - Demo Data' : '⚠️ Demo Data'}
            </div>

            <div className="flex justify-between items-center px-2 pb-3 border-b border-gray-100 text-[9px] font-black tracking-widest text-[#3E2723]/40 select-none">
              <span>12:00 PM</span>
              <span className="text-[9px] text-[#3E2723]/60">
                {isAr ? 'كشك الزبون' : 'Customer Kiosk'}
              </span>
              <div className="flex gap-1">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            <div className="flex-grow py-6 flex flex-col justify-center space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-[#3E2723]">
                  {isAr ? 'كيف تشعر الآن؟' : 'How do you feel today?'}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold">
                  {isAr
                    ? 'اضغط لتجربة الاقتراح الفوري وإرسال الطلب'
                    : 'Tap to trigger matching & order transfer'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    drink: isAr ? '☕ شوكولاتة ساخنة بالنعناع' : '☕ Hot Mint Cocoa',
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
                    className="p-3 bg-gray-50 border border-gray-200/60 rounded-2xl text-xs font-black text-[#3E2723] hover:bg-[#3E2723] hover:text-white hover:border-transparent transition-all duration-300 cursor-pointer flex flex-col items-center gap-1 shadow-sm active:scale-95"
                  >
                    <span className="text-xl">{m.label.split(' ')[0]}</span>
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
                    className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center space-y-2"
                  >
                    <div className="w-5 h-5 border-2 border-[#3E2723] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] text-amber-900 font-black">
                      {isAr
                        ? 'الذكاء الاصطناعي يحلل مزاجك ويرسل الطلب...'
                        : 'AI processing mood and transmitting order...'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
              <span className="text-[8px] font-black text-gray-400 tracking-widest uppercase">
                {isAr ? 'انقر على المزاج للإرسال' : 'TAP A MOOD BUTTON TO TEST'}
              </span>
              <div className="w-24 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
