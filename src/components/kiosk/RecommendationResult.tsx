'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowLeft, Coffee, Sparkles, ShoppingBag, Loader2, CheckCircle, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface AIResult {
  moodNameAr: string
  moodNameEn: string
  suitableDrinkAr: string
  suitableDrinkEn: string
  drinkDescriptionAr: string
  drinkDescriptionEn: string
  energyLevel: number
  sweetnessLevel: number
  whyMatchesAr: string
  whyMatchesEn: string
  foodPairingAr: string
  foodPairingEn: string
  drinkId?: string
  price?: number
  image?: string
  suggestions?: {
    id: string
    nameAr: string
    nameEn: string
    price: number
    image: string | null
    description: string
  }[]
}

interface DrinkType {
  id: string
  nameAr: string
  nameEn: string
  price: number
  image: string | null
  description: string
}

interface RecommendationResultProps {
  isAr: boolean
  analysisResult: AIResult
  emptyState: boolean
  timeLeft: number
  feedbackSubmitted: boolean
  isOrdering: boolean
  handleReset: () => void
  handleSaveFeedback: (isAppropriate: boolean) => void
  handlePlaceOrder: () => void
  formattedPrice: (price: number) => string
  availableDrinks: DrinkType[]
}

export default function RecommendationResult({
  isAr,
  analysisResult,
  emptyState,
  timeLeft,
  feedbackSubmitted,
  isOrdering,
  handleReset,
  handleSaveFeedback,
  handlePlaceOrder,
  formattedPrice,
  availableDrinks,
}: RecommendationResultProps) {
  const matchScore = 90 + ((analysisResult?.energyLevel || 0) % 10)

  return (
    <motion.div
      key="results-screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-2 w-full flex flex-col gap-4"
    >
      {/* ── TOP NAV: Back + Auto-reset timer ── */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#3E2723] rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{isAr ? 'تغيير المزاج' : 'Change Mood'}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400">
            {isAr ? `${timeLeft}ث` : `${timeLeft}s`}
          </span>
          <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-500 ${timeLeft < 10 ? 'bg-red-400' : timeLeft < 20 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 60) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>
      </div>

      {/* ═══ MAIN RESULT CARD ═══ */}
      {emptyState ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#2C1B18] via-[#3E2723] to-[#1F1210] rounded-3xl p-5 relative overflow-hidden border border-white/5 shadow-2xl"
        >
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Coffee className="h-16 w-16 text-amber-300 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">{isAr ? '☕ لا توجد مشروبات متاحة حالياً' : '☕ No drinks available'}</h3>
            <p className="text-sm text-amber-200 max-w-sm">
              {isAr ? 'لم يقم المقهى بإضافة أي مشروبات بعد. يرجى المحاولة لاحقاً أو التواصل مع إدارة المقهى.' : 'The cafe has not added any drinks yet. Please try again later or contact the cafe management.'}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 18 }}
          className="relative overflow-hidden rounded-3xl shadow-2xl"
        >
          {/* Dark gradient background */}
          <div className="bg-gradient-to-br from-[#2C1B18] via-[#3E2723] to-[#1F1210] p-5 relative border border-white/5">
            {/* Radial glow effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />

            {/* Match Score badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="absolute top-4 start-4 z-20"
            >
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#1F1210] px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
                <Sparkles className="h-3 w-3" />
                <span>{matchScore}% {isAr ? 'تطابق' : 'Match'}</span>
              </div>
            </motion.div>

            {/* Content row: image + drink info */}
            <div className="flex items-center gap-5 pt-7 relative z-10">
              {/* Drink image with glow */}
              {analysisResult?.image && analysisResult.image.trim() !== '' && analysisResult.image !== '☕' && !analysisResult.image.startsWith('emoji:') && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 14 }}
                  className="flex-shrink-0 relative"
                >
                  {/* Glow behind image */}
                  <div className="absolute -inset-3 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="w-28 h-28 relative rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl ring-1 ring-amber-400/20">
                    <Image
                      src={analysisResult.image}
                      alt="drink"
                      fill
                      sizes="112px"
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>
                </motion.div>
              )}

              {/* Drink info */}
              <div className="flex-grow min-w-0">
                <motion.span
                  initial={{ opacity: 0, x: isAr ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-[9px] uppercase tracking-[0.2em] font-black text-amber-400/80 block mb-1"
                >
                  {isAr ? 'مشروبك المقترح' : 'Your Recommended Drink'}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl sm:text-2xl font-black text-white leading-tight break-words line-clamp-2 md:line-clamp-none"
                >
                  {isAr ? analysisResult?.suitableDrinkAr : analysisResult?.suitableDrinkEn}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[11px] text-amber-200/60 mt-1 font-semibold line-clamp-2 leading-relaxed"
                >
                  {isAr ? analysisResult?.drinkDescriptionAr : analysisResult?.drinkDescriptionEn}
                </motion.p>

                {/* Mood + Effect tags */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-wrap gap-1.5 mt-2.5"
                >
                  <span className="text-[9px] bg-white/8 text-white/70 border border-white/10 px-2.5 py-1 rounded-full font-black backdrop-blur-sm">
                    🎭 {isAr ? analysisResult?.moodNameAr : analysisResult?.moodNameEn}
                  </span>
                  <span className="text-[9px] bg-white/8 text-white/70 border border-white/10 px-2.5 py-1 rounded-full font-black backdrop-blur-sm">
                    {(analysisResult?.energyLevel || 0) > 60 ? '⚡' : '😌'}{' '}
                    {(analysisResult?.energyLevel || 0) > 60
                      ? isAr ? 'منشط' : 'Energizing'
                      : isAr ? 'مريح' : 'Calming'}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* ═══ PRICE + ORDER BUTTON ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-5 flex items-stretch gap-3 relative z-10"
            >
              {analysisResult?.price && analysisResult?.price > 0 && (
                <div className="bg-white/8 border border-white/10 rounded-2xl px-5 py-3 text-center flex-shrink-0 flex flex-col justify-center backdrop-blur-sm">
                  <p className="text-[8px] text-amber-300/60 font-black uppercase tracking-wider">
                    {isAr ? 'السعر' : 'Price'}
                  </p>
                  <p className="text-lg font-black text-amber-300 leading-tight mt-0.5">
                    {formattedPrice(analysisResult?.price ?? 0)}
                  </p>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(16,185,129,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePlaceOrder}
                disabled={isOrdering || emptyState}
                className="flex-grow py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer relative overflow-hidden shimmer-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOrdering ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingBag className="h-5 w-5" />
                )}
                <span className="text-base">{isOrdering ? (isAr ? 'جاري الطلب...' : 'Ordering...') : isAr ? 'اطلب الآن' : 'Order Now'}</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ── DETAIL CARDS GRID ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Why it matches */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card rounded-2xl p-4 col-span-2"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-[10px] font-black text-[#3E2723] uppercase tracking-wider">
              {isAr ? 'لماذا هذا المشروب؟' : 'Why this drink?'}
            </h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed font-semibold">
            {isAr ? analysisResult.whyMatchesAr : analysisResult.whyMatchesEn}
          </p>
        </motion.div>

        {/* Vibe stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-4 space-y-3"
        >
          <h4 className="text-[10px] font-black text-[#3E2723] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-500" />
            {isAr ? 'مؤشرات المشروب' : 'Drink Stats'}
          </h4>
          {[
            {
              label: isAr ? 'قوة القهوة' : 'Strength',
              value: analysisResult.sweetnessLevel != null ? Math.max(30, 100 - analysisResult.sweetnessLevel) : 0,
              color: 'bg-gradient-to-r from-amber-400 to-amber-500',
              icon: '☕',
            },
            {
              label: isAr ? 'الحلاوة' : 'Sweetness',
              value: analysisResult.sweetnessLevel,
              color: 'bg-gradient-to-r from-rose-300 to-rose-400',
              icon: '🍬',
            },
            {
              label: isAr ? 'الطاقة' : 'Energy',
              value: analysisResult.energyLevel,
              color: 'bg-gradient-to-r from-yellow-300 to-yellow-400',
              icon: '⚡',
            },
          ].map(stat => (
            <div key={stat.label}>
              <div className="flex justify-between text-[9.5px] font-black text-gray-500 mb-1">
                <span>
                  {stat.icon} {stat.label}
                </span>
                <span className="text-[#3E2723]">{stat.value}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <motion.div
                  className={`${stat.color} h-full rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center"
        >
          {feedbackSubmitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-emerald-500" />
              </div>
              <p className="text-xs font-black text-emerald-700">
                {isAr ? 'شكراً على رأيك!' : 'Thanks for feedback!'}
              </p>
            </motion.div>
          ) : (
            <>
              <p className="text-[11px] font-black text-[#3E2723] leading-snug">
                {isAr ? 'هل الاقتراح مناسب لمزاجك؟' : 'Does this match your vibe?'}
              </p>
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleSaveFeedback(true)}
                  className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                >
                  👍 {isAr ? 'نعم' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveFeedback(false)}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                >
                  👎 {isAr ? 'لا' : 'No'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── UPSELL: You might also like ── */}
      {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-4"
        >
          <h4 className="text-[10px] font-black text-[#3E2723] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>🍪</span>
            <span>{isAr ? 'قد يعجبك أيضاً:' : 'You might also like:'}</span>
          </h4>
          <div className="grid grid-cols-3 gap-2.5">
            {analysisResult.suggestions.map((drink: any, i: number) => (
              <motion.div
                key={drink.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.08 }}
                className="border border-gray-100/80 rounded-xl p-2.5 text-center bg-white/50 flex flex-col items-center gap-2 hover:shadow-md hover:border-amber-200/50 transition-all cursor-default mood-card-glow"
              >
                {drink.image && drink.image.trim() !== '' && drink.image !== '☕' && !drink.image.startsWith('emoji:') && (
                  <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                    <Image
                      src={drink.image}
                      alt={drink.nameAr}
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>
                )}
                <p className="text-[10px] font-black text-[#3E2723] truncate w-full">
                  {isAr ? drink.nameAr : drink.nameEn}
                </p>
                <p className="text-[9px] font-black text-amber-700">
                  {formattedPrice(drink.price)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
