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
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center text-center p-6 overflow-hidden"
        >
          {/* Background with gradient + blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A0F0D] via-[#3E2723] to-[#1A0F0D]" />
          <div className="absolute inset-0 bg-dots-animated opacity-20" />

          {/* Radial glow behind cup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* ═══ ANIMATED COFFEE CUP ═══ */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-8">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 border-t-amber-400 animate-spin" />
            {/* Inner counter-spinning ring */}
            <div className="absolute inset-2 rounded-full border-4 border-[#FAF8F5]/5 border-b-[#FAF8F5]/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />

            {/* Coffee cup body */}
            <div className="relative z-10 w-16 h-16 bg-[#FAF8F5] rounded-b-2xl border-x-4 border-b-4 border-[#FAF8F5]/90 flex flex-col justify-end p-1.5 shadow-lg">
              {/* Steam wisps */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 justify-center opacity-60">
                <motion.div
                  animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                  className="w-1 h-5 bg-[#FAF8F5] rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  className="w-1 h-5 bg-[#FAF8F5] rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
                  className="w-1 h-5 bg-[#FAF8F5] rounded-full"
                />
              </div>
              {/* Coffee fill animation */}
              <motion.div
                animate={{ height: ['25%', '85%', '25%'] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="w-full bg-[#5D4037] rounded-b-xl"
              />
            </div>
          </div>

          {/* ═══ TEXT CONTENT ═══ */}
          <div className="space-y-4 max-w-sm relative z-10">
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

            {/* Progress steps */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {loadingTexts.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i <= loadingStage
                      ? 'bg-amber-400 w-6'
                      : 'bg-white/15 w-3'
                  }`}
                  layout
                />
              ))}
            </div>
          </div>

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
              style={{
                left: `${15 + i * 18}%`,
                bottom: '15%',
              }}
              animate={{
                y: [-20, -120 - i * 20],
                opacity: [0, 0.5, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 3 + i * 0.7,
                delay: i * 0.8,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
