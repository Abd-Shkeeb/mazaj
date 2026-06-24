'use client'

import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export default function Footer() {
  const tc = useTranslations('common')
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-r from-[#5D4037] via-[#3E2723] to-[#1A0C0A] text-[#F5E6D3] border-t border-[#3E2723]/30 py-10 relative overflow-hidden mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Name */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/10 text-white flex items-center justify-center">
            <svg
              className="h-5.5 w-5.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3C7 3 4 7 4 12C4 17 7 21 12 21" strokeWidth="2" />
              <path d="M12 3C17 3 20 7 20 12C20 17 17 21 12 21" strokeWidth="2" />
              <path d="M12 3C10 7.5 14 11.5 12 16.5C11.2 18.3 10.8 19.8 12 21" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-white">{tc('title')}</span>
        </div>

        {/* Rights */}
        <div className="text-sm font-bold text-[#F5E6D3]/85 text-center sm:text-left rtl:sm:text-right">
          {isAr
            ? `© ${new Date().getFullYear()} مزاج - Mazaj | جميع الحقوق محفوظة.`
            : `© ${new Date().getFullYear()} Mazaj | All rights reserved.`}
        </div>
      </div>
    </motion.footer>
  )
}
