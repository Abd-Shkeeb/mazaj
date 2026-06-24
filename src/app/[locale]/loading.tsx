'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F5] text-[#3E2723] p-4">
      <div className="relative flex flex-col items-center gap-6">
        {/* Outer rotating/pulsing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-4 border-amber-500/10 border-t-amber-500"
        />

        {/* Inner pulsing coffee cup symbol */}
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="absolute text-3xl top-4"
        >
          ☕
        </motion.div>

        {/* Loading text with shimmer */}
        <div className="text-center space-y-1 mt-2">
          <h2 className="text-lg font-black tracking-wide">جاري تحضير مزاجك...</h2>
          <p className="text-xs text-amber-800/60 font-bold tracking-wider">
            Preparing your experience...
          </p>
        </div>
      </div>
    </div>
  )
}
