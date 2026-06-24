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
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-amber-600/10 p-10 text-center flex flex-col items-center justify-center gap-5 shadow-lg min-h-[350px] w-full animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100 shadow-inner">
        <ShieldAlert className="h-8 w-8 text-amber-600" />
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
          {isAr ? 'ميزة مقفلة' : 'Locked Feature'}
        </span>
        <h3 className="text-base font-black text-[#2D2D2D] mt-2">{isAr ? titleAr : titleEn}</h3>
        <p className="text-xs text-gray-500 font-semibold max-w-md leading-relaxed">
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
        className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3E2723] rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
      >
        {isAr ? 'ترقية الباقة الآن 🚀' : 'Upgrade Plan Now 🚀'}
      </button>
    </div>
  )
}
