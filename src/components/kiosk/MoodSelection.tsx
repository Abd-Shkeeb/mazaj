'use client'

import React from 'react'
import Image from 'next/image'
import { Sparkles, Check, Info } from 'lucide-react'
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
        staggerChildren: 0.04,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 120, damping: 14 },
    },
  }

  return (
    <motion.div
      key="mood-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-stretch gap-8"
    >
      {/* RIGHT SIDE (RTL: appears on right, LTR: appears on left): Cafe Image / Branding card (35% width on desktop) */}
      <div className="w-full md:w-[35%] relative rounded-3xl overflow-hidden shadow-2xl border border-[#3E2723]/10 flex flex-col justify-end p-6 text-white min-h-[300px] md:min-h-0 group">
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
        {/* Premium Dark rich overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0D] via-[#1A0F0D]/65 to-[#1A0F0D]/15 transition-opacity duration-500 group-hover:opacity-95" />

        {/* Hero Content Glass Overlay Card */}
        <div className="relative z-10 text-right rtl:text-right ltr:text-left bg-black/45 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl transition-all duration-300 group-hover:bg-black/50 group-hover:border-white/20">
          <div className="flex items-center gap-3.5 border-b border-white/10 pb-4">
            {cafe.logo && (
              <div className="w-[50px] h-[50px] rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src={cafe.logo ?? ''}
                  alt="Cafe Logo"
                  width={46}
                  height={46}
                  className="object-cover rounded-full w-full h-full transition-transform duration-500 group-hover:scale-105"
                  unoptimized={true}
                />
              </div>
            )}
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-white leading-tight tracking-tight drop-shadow-md">
                {isAr ? cafe.nameAr : cafe.nameEn}
              </h2>
              <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest block drop-shadow-sm">
                {isAr ? 'مستشارك المزاجي للقهوة' : 'Your Personal Coffee Matcher'}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-200/90 leading-relaxed font-bold drop-shadow-sm pt-4">
            {isAr
              ? 'اختر شعورك الحالي وسوف نقوم باختيار كوب القهوة الأنسب لك بدقة عالية.'
              : 'Tell us how you feel, and we will find the perfect cup tailored to your mood.'}
          </p>
        </div>
      </div>

      {/* LEFT SIDE (RTL: appears on left, LTR: appears on right): Mood Selection Controls (65% width on desktop) */}
      <div className="w-full md:w-[65%] flex flex-col justify-between py-1 space-y-6">
        <div>
          {/* Header & Title */}
          <div className="text-right rtl:text-right ltr:text-left mb-6 w-full">
            <h3 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight flex items-center gap-2 justify-start">
              <span>{isAr ? 'ما هو مزاجك اليوم؟' : 'What is your mood today?'}</span>
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1 text-right rtl:text-right ltr:text-left">
              {isAr
                ? 'سنحلل مزاجك ونقترح أفضل مشروب يناسبك باستخدام الذكاء الاصطناعي.'
                : 'We analyze your mood and suggest the best drink using AI.'}
            </p>
          </div>

          {/* Mood Cards Grid */}
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 gap-4"
          >
            {predefinedMoods.map(mood => {
              const isSelected = selectedMood === mood.key

              return (
                <motion.button
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: `0 12px 30px ${mood.glowColor}`,
                  }}
                  whileTap={{ scale: 0.98 }}
                  key={mood.key}
                  onClick={() => {
                    setSelectedMood(isSelected ? null : mood.key)
                    setCustomText('')
                  }}
                  className={`relative overflow-hidden py-5 px-4 rounded-2xl border text-sm font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group ring-offset-2 select-none ${mood.bg} ${mood.border} ${mood.text} ${isSelected
                    ? `ring-2 ${mood.ringColor} scale-[1.03] border-[3px] border-[#3E2723] shadow-lg z-10`
                    : 'border-opacity-100 hover:border-[#3E2723]/30 shadow-sm'
                    }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 z-0 opacity-15 pointer-events-none"
                      style={{ backgroundColor: mood.color }}
                    />
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#3E2723] text-white rounded-full p-0.5 shadow-md z-20">
                      <Check className="h-3 w-3 stroke-[4]" />
                    </div>
                  )}

                  <span className="text-4xl select-none relative z-10 transition-transform duration-300 group-hover:scale-110">
                    {mood.label.split(' ')[0]}
                  </span>
                  <span className="text-xs tracking-wide relative z-10 font-black">
                    {mood.label.split(' ').slice(1).join(' ')}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        </div>

        <div className="space-y-4">
          {/* Helper notice / status messages */}
          <div className="min-h-[40px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {selectedMood ? (
                <motion.div
                  key="selected-glow"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="w-full text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-100 py-3 px-4 rounded-xl text-center shadow-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                  <span>
                    {isAr
                      ? 'رائع ✨ اضغط على زر الاقتراح أدناه للحصول على التوصية'
                      : 'Awesome ✨ Click the discover button below for recommendation'}
                  </span>
                </motion.div>
              ) : (
                <motion.p
                  key="empty-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-bold text-gray-400 text-center animate-pulse flex items-center justify-center gap-1.5 select-none"
                >
                  <Info className="h-4 w-4 text-gray-400" />
                  <span>
                    {isAr
                      ? 'اختر أحد المشاعر لنقترح لك أفضل مشروب.'
                      : 'Select a feeling to get a recommendation.'}
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit trigger button */}
          <div>
            <motion.button
              whileHover={
                selectedMood
                  ? {
                    scale: 1.01,
                    boxShadow: '0 20px 45px rgba(62, 39, 35, 0.35)',
                  }
                  : {}
              }
              whileTap={selectedMood ? { scale: 0.99 } : {}}
              onClick={handleAnalyze}
              disabled={!selectedMood}
              className={`w-full py-5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all relative z-10 overflow-hidden ${selectedMood
                ? 'bg-gradient-to-r from-[#5D4037] via-[#3E2723] to-[#2D1C1A] hover:opacity-95 text-[#FAF8F5] ring-4 ring-[#3E2723]/15 shadow-xl active:scale-98 cursor-pointer'
                : 'bg-gray-150 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                }`}
            >
              {selectedMood && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              )}
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              <span>{isAr ? '✨ اقترح لي مشروباً مناسباً' : '✨ Recommend Me a Drink'}</span>
            </motion.button>
          </div>

          {/* Trust Indicator Cards */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="bg-white/60 backdrop-blur-sm border border-[#3E2723]/8 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
              <p className="text-xl mb-1">☕</p>
              <p className="text-xs font-black text-[#3E2723] leading-snug">
                {isAr ? 'أكثر من 500 تحليل مزاج' : '500+ Vibe Checks'}
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-[#3E2723]/8 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
              <p className="text-xl mb-1">❤️</p>
              <p className="text-xs font-black text-[#3E2723] leading-snug">
                {isAr ? 'نسبة رضا 94%' : '94% Satisfaction'}
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-[#3E2723]/8 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
              <p className="text-xl mb-1">⚡</p>
              <p className="text-xs font-black text-[#3E2723] leading-snug">
                {isAr ? 'النتيجة خلال ثانيتين' : '2s Instant Advice'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
