'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Root boundary caught error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F5] text-[#3E2723] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-[#5D4037]/10 p-8 rounded-3xl shadow-xl space-y-6"
      >
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-rose-100">
          ⚠️
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black">حدث خطأ غير متوقع</h2>
          <p className="text-sm font-semibold text-[#5D4037]/80">
            An unexpected error occurred while loading this page.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-left rtl:text-right text-[10px] font-mono text-gray-500 overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-grow py-3 px-5 bg-[#3E2723] hover:bg-[#2D1B18] text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            إعادة المحاولة / Try Again
          </button>
          <Link
            href="/"
            className="flex-grow py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black transition-colors cursor-pointer block text-center"
          >
            الرئيسية / Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
