'use client'

import React from 'react'
import Image from 'next/image'
import { Sparkles, Check, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Cafe {
  id: string
  slug: string
  nameAr: string
  nameEn: string
  logo: string | null
  coverImage: string | null
  phone: string | null
  addressAr: string | null
  addressEn: string | null
  workingHoursAr: string | null
  workingHoursEn: string | null
  instagram: string | null
  facebook: string | null
}

interface MoodType {
  key: string
  label: string
  color: string
  bg: string
  border: string
  text: string
  hoverGlow: string
  ringColor: string
  glowColor: string
}

interface MoodSelectionProps {
  cafe: Cafe
  isAr: boolean
  selectedMood: string | null
  setSelectedMood: (mood: string | null) => void
  setCustomText: (text: string) => void
  handleAnalyze: () => void
  predefinedMoods: MoodType[]
}

export default function MoodSelection({
  cafe,
  isAr,
  selectedMood,
  setSelectedMood,
  setCustomText,
  handleAnalyze,
  predefinedMoods,
}: MoodSelectionProps) {
  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 140, damping: 16 },
    },
  }

  return (
    <motion.div
      key="mood-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-stretch gap-6"
    >
      {/* ═══ HERO CARD — Cafe branding area (Hidden on Mobile for professional UX) ═══ */}
      <div className="hidden md:flex w-full md:w-[35%] relative rounded-3xl overflow-hidden shadow-2xl border border-[#3E2723]/10 flex-col justify-end min-h-[280px] md:min-h-0 group">
        {/* Background Cover Image */}
        {cafe.coverImage && (
          <Image
            src={cafe.coverImage ?? ''}
            alt="Cafe Cover"
            fill
            priority={true}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            unoptimized={true}
          />
        )}
        {/* Premium rich overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0705] via-[#1A0F0D]/70 to-[#1A0F0D]/10 transition-opacity duration-500 group-hover:opacity-95" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-20, -80], opacity: [0, 0.6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeOut' }}
            className="absolute bottom-20 right-10 w-1.5 h-1.5 bg-amber-400/40 rounded-full"
          />
          <motion.div
            animate={{ y: [-10, -60], opacity: [0, 0.4, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, delay: 1.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-20 w-1.5 h-1.5 bg-amber-300/30 rounded-full"
          />
          <motion.div
            animate={{ y: [-15, -70], opacity: [0, 0.5, 0] }}
            transition={{ repeat: Infinity, duration: 5, delay: 2, ease: 'easeOut' }}
            className="absolute bottom-24 left-12 w-1.5 h-1.5 bg-white/20 rounded-full"
          />
        </div>

        {/* Hero Content Overlay Card */}
        <div className="relative z-10 m-4 p-5 rounded-2xl glass-card-dark">
          <div className="flex items-center gap-3.5 border-b border-white/10 pb-4">
            {cafe.logo && (
              <div className="w-[52px] h-[52px] rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src={cafe.logo ?? ''}
                  alt="Cafe Logo"
                  width={48}
                  height={48}
                  className="object-cover rounded-full w-full h-full transition-transform duration-500 group-hover:scale-105"
                  unoptimized={true}
                />
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white leading-tight tracking-tight drop-shadow-md">
                {isAr ? cafe.nameAr : cafe.nameEn}
              </h2>
              <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-[0.15em] block drop-shadow-sm">
                {isAr ? 'مستشارك المزاجي للقهوة' : 'Your Personal Coffee Matcher'}
              </span>
            </div>
          </div>

          <p className="text-[13px] text-gray-200/90 leading-relaxed font-semibold drop-shadow-sm pt-4">
            {isAr
              ? 'اختر شعورك الحالي وسوف نقوم باختيار كوب القهوة الأنسب لك بدقة عالية.'
              : 'Tell us how you feel, and we will find the perfect cup tailored to your mood.'}
          </p>
        </div>
      </div>

      {/* ═══ MOOD SELECTION CONTROLS ═══ */}
      <div className="w-full md:w-[65%] flex flex-col justify-between py-1 space-y-5">
        <div>
          {/* Header & Title */}
          <div className="mb-5 w-full">
            <h3 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span>{isAr ? 'ما هو مزاجك اليوم؟' : 'What is your mood today?'}</span>
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1.5 ps-[42px]">
              {isAr
                ? 'سنحلل مزاجك ونقترح أفضل مشروب يناسبك باستخدام الذكاء الاصطناعي.'
                : 'We analyze your mood and suggest the best drink using AI.'}
            </p>
          </div>

          {/* ═══ MOOD CARDS GRID ═══ */}
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 gap-3"
          >
            {predefinedMoods.map(mood => {
              const isSelected = selectedMood === mood.key
              const emoji = mood.label.split(' ')[0]
              const text = mood.label.split(' ').slice(1).join(' ')

              return (
                <motion.button
                  variants={cardVariants}
                  whileTap={{ scale: 0.95 }}
                  key={mood.key}
                  onClick={() => {
                    setSelectedMood(isSelected ? null : mood.key)
                    setCustomText('')
                  }}
                  className={`relative overflow-hidden py-4 px-3 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group select-none mood-card-glow ${
                    isSelected
                      ? 'border-[#3E2723] bg-white shadow-xl z-10'
                      : `border-transparent ${mood.bg} hover:border-[#3E2723]/15 shadow-sm hover:shadow-md`
                  }`}
                  style={isSelected ? { '--glow-color': mood.glowColor } as React.CSSProperties : undefined}
                >
                  {/* Background glow when selected */}
                  {isSelected && (
                    <motion.div
                      layoutId="moodActiveGlow"
                      className="absolute inset-0 z-0 opacity-10 pointer-events-none rounded-2xl"
                      style={{ backgroundColor: mood.color }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    />
                  )}

                  {/* Checkmark badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-1.5 end-1.5 bg-[#3E2723] text-white rounded-full p-0.5 shadow-lg z-20"
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Emoji with colored glow ring */}
                  <div className={`relative z-10 text-4xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {isSelected && (
                      <div
                        className="absolute inset-0 rounded-full blur-xl opacity-30 -z-10 scale-150"
                        style={{ backgroundColor: mood.color }}
                      />
                    )}
                    {emoji}
                  </div>

                  {/* Label */}
                  <span className={`text-[11px] tracking-wide relative z-10 font-black transition-colors duration-200 ${
                    isSelected ? 'text-[#3E2723]' : mood.text
                  }`}>
                    {text}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        </div>

        <div className="space-y-4">
          {/* Status messages */}
          <div className="min-h-[40px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {selectedMood ? (
                <motion.div
                  key="selected-msg"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className="w-full text-xs font-black text-emerald-800 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 py-3 px-4 rounded-xl text-center shadow-sm flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white stroke-[3]" />
                  </div>
                  <span>
                    {isAr
                      ? 'رائع! اضغط على زر الاقتراح أدناه ✨'
                      : 'Great choice! Tap the button below ✨'}
                  </span>
                </motion.div>
              ) : (
                <motion.p
                  key="empty-msg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-bold text-gray-400 text-center flex items-center justify-center gap-1.5 select-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
                  <span>
                    {isAr
                      ? 'اختر أحد المشاعر لنقترح لك أفضل مشروب'
                      : 'Select a feeling to get a recommendation'}
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ CTA BUTTON ═══ */}
          <div>
            <motion.button
              whileHover={
                selectedMood
                  ? {
                    scale: 1.015,
                    boxShadow: '0 20px 50px rgba(62, 39, 35, 0.4)',
                  }
                  : {}
              }
              whileTap={selectedMood ? { scale: 0.985 } : {}}
              onClick={handleAnalyze}
              disabled={!selectedMood}
              className={`w-full py-5 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all relative z-10 overflow-hidden ${selectedMood
                ? 'bg-gradient-to-r from-[#5D4037] via-[#3E2723] to-[#2D1C1A] hover:opacity-95 text-[#FAF8F5] ring-4 ring-[#3E2723]/15 shadow-2xl cursor-pointer shimmer-btn animate-glow-pulse'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                }`}
              style={selectedMood ? { '--glow-color': 'rgba(62, 39, 35, 0.2)' } as React.CSSProperties : undefined}
            >
              <Sparkles className={`h-5 w-5 ${selectedMood ? 'text-amber-300' : 'text-gray-300'}`} />
              <span>{isAr ? 'اقترح لي مشروباً مناسباً ✨' : '✨ Recommend Me a Drink'}</span>
            </motion.button>
          </div>

          {/* ═══ POWERED BY AI BADGE ═══ */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-[#3E2723]/6 shadow-sm">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] font-black text-[#3E2723]/50 uppercase tracking-wider">
                {isAr ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
