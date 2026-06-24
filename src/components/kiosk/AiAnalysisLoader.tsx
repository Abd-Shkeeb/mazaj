'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AiAnalysisLoaderProps {
  isPending: boolean
  isAr: boolean
  loadingStage: number
  loadingTexts: string[]
}

export default function AiAnalysisLoader({
  isPending,
  isAr,
  loadingStage,
  loadingTexts,
}: AiAnalysisLoaderProps) {
  return (
    <AnimatePresence>
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-[#3E2723]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
        >
          <div className="relative w-28 h-28 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 border-t-amber-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-[#FAF8F5]/10 border-b-[#FAF8F5]/40 animate-spin duration-1000" />

            <div className="relative z-10 w-16 h-16 bg-[#FAF8F5] rounded-b-2xl border-x-4 border-b-4 border-[#FAF8F5]/90 flex flex-col justify-end p-1.5 shadow-lg">
              <motion.div
                animate={{ y: [-15, -45], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                className="absolute -top-3 left-6 text-xl"
              >
                ☕
              </motion.div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 justify-center opacity-60">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }}
                  className="w-1 h-5 bg-[#FAF8F5] rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                  className="w-1 h-5 bg-[#FAF8F5] rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }}
                  className="w-1 h-5 bg-[#FAF8F5] rounded-full"
                />
              </div>
              <motion.div
                animate={{ height: ['25%', '90%', '25%'] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="w-full bg-[#5D4037] rounded-b-xl"
              />
            </div>
          </div>

          <div className="space-y-4 max-w-sm">
            <h3 className="text-xl font-black text-white tracking-wide">
              {isAr ? 'يجري تحضير الاقتراح المثالي...' : 'Brewing your suggestion...'}
            </h3>
            <div className="h-7">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingStage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-bold text-amber-300"
                >
                  {loadingTexts[loadingStage]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
