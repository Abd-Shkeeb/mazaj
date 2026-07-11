'use client'

import React from 'react'
import { ShieldAlert } from 'lucide-react'

interface UpgradeOverlayProps {
  isAr: boolean
  titleAr: string
  titleEn: string
  requiredPlan: string
  setActiveTab: (tab: 'orders' | 'menu' | 'analytics' | 'settings') => void
}

export default function UpgradeOverlay({
  isAr,
  titleAr,
  titleEn,
  requiredPlan,
  setActiveTab,
}: UpgradeOverlayProps) {
  return (
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
          setTimeout(() => {
            const el = document.getElementById('pricing-plans-section')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }, 150)
        }}
        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer border border-transparent"
      >
        {isAr ? 'ترقية الباقة الآن 🚀' : 'Upgrade Plan Now 🚀'}
      </button>
    </div>
  )
}
