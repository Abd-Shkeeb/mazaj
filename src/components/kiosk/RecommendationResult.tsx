'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowLeft, Coffee, Sparkles, ShoppingBag, Loader2, CheckCircle } from 'lucide-react'
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
  return (
    <motion.div
      key="results-screen"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-2 w-full flex flex-col gap-4"
    >
      {/* ── TOP NAV: Back + Auto-reset ── */}
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
          <div className="w-16 bg-gray-100 h-1 rounded-full overflow-hidden">
            <motion.div
              className="bg-amber-400 h-full rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 60) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>
      </div>

      {/* Conditional rendering for empty or result state */}
      {emptyState ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#2C1B18] via-[#3E2723] to-[#1F1210] rounded-3xl p-5 relative overflow-hidden border border-white/5 shadow-2xl"
        >
          {/* Icon and message */}
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
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#2C1B18] via-[#3E2723] to-[#1F1210] rounded-3xl p-5 relative overflow-hidden border border-white/5 shadow-2xl"
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.12),transparent_60%)] pointer-events-none" />

          {/* Match Score badge */}
          <div className="absolute top-4 left-4 bg-amber-500 text-[#1F1210] px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg z-20">
            ✨ {90 + ((analysisResult?.energyLevel || 0) % 10)}% {isAr ? 'تطابق' : 'Match'}
          </div>

          <div className="flex items-center gap-5 pt-6 relative z-10">
            {/* Drink image */}
            {analysisResult?.image && analysisResult.image.trim() !== '' && analysisResult.image !== '☕' && !analysisResult.image.startsWith('emoji:') && (
              <div className="flex-shrink-0">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
                  className="w-24 h-24 relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl"
                >
                  <Image
                    src={analysisResult.image}
                    alt="drink"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized={true}
                  />
                </motion.div>
              </div>
            )}

            {/* Drink info */}
            <div className="flex-grow text-right rtl:text-right ltr:text-left min-w-0">
              <span className="text-[9px] uppercase tracking-widest font-black text-amber-400 block mb-0.5">
                {isAr ? 'مشروبك المقترح' : 'Your Recommended Drink'}
              </span>
              <h2 className="text-xl font-black text-white leading-tight truncate">
                {isAr ? analysisResult?.suitableDrinkAr : analysisResult?.suitableDrinkEn}
              </h2>
              <p className="text-xs text-amber-200/70 mt-0.5 font-semibold line-clamp-2 leading-relaxed">
                {isAr ? analysisResult?.drinkDescriptionAr : analysisResult?.drinkDescriptionEn}
              </p>
              {/* Mood + Effect tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[9px] bg-white/10 text-white/70 border border-white/10 px-2 py-0.5 rounded-full font-black">
                  🎭 {isAr ? analysisResult?.moodNameAr : analysisResult?.moodNameEn}
                </span>
                <span className="text-[9px] bg-white/10 text-white/70 border border-white/10 px-2 py-0.5 rounded-full font-black">
                  {(analysisResult?.energyLevel || 0) > 60 ? '⚡' : '😌'}{' '}
                  {(analysisResult?.energyLevel || 0) > 60
                    ? isAr
                      ? 'منشط'
                      : 'Energizing'
                    : isAr
                      ? 'مريح'
                      : 'Calming'}
                </span>
              </div>
            </div>
          </div>

          {/* Price + Order button */}
          <div className="mt-5 flex items-center gap-3 relative z-10">
            {analysisResult?.price && analysisResult?.price > 0 && (
              <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-center flex-shrink-0">
                <p className="text-[9px] text-amber-300/70 font-black uppercase tracking-wider">
                  {isAr ? 'السعر' : 'Price'}
                </p>
                <p className="text-base font-black text-amber-300 leading-tight">
                  {formattedPrice(analysisResult?.price ?? 0)}
                </p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(16,185,129,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlaceOrder}
              disabled={isOrdering || emptyState}
              className="flex-grow py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-sm font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isOrdering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              <span>{isOrdering ? 'Loading...' : isAr ? 'اطلب الآن' : 'Order Now'}</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── DETAIL CARDS GRID ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Why it matches */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm col-span-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5"
        >
          <h4 className="text-[10px] font-black text-[#3E2723] uppercase tracking-wider mb-1">
            {isAr ? 'مؤشرات المشروب' : 'Drink Stats'}
          </h4>
          {[
            {
              label: isAr ? 'قوة القهوة' : 'Strength',
              value: analysisResult.sweetnessLevel != null ? Math.max(30, 100 - analysisResult.sweetnessLevel) : 0,
              color: 'bg-amber-500',
              icon: '☕',
            },
            {
              label: isAr ? 'الحلاوة' : 'Sweetness',
              value: analysisResult.sweetnessLevel,
              color: 'bg-rose-400',
              icon: '🍬',
            },
            {
              label: isAr ? 'الطاقة' : 'Energy',
              value: analysisResult.energyLevel,
              color: 'bg-yellow-400',
              icon: '⚡',
            },
          ].map(stat => (
            <div key={stat.label}>
              <div className="flex justify-between text-[9.5px] font-black text-gray-500 mb-0.5">
                <span>
                  {stat.icon} {stat.label}
                </span>
                <span>{stat.value}%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className={`${stat.color} h-full rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 0.9, delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 text-center"
        >
          {feedbackSubmitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <CheckCircle className="h-8 w-8 text-emerald-500" />
              <p className="text-xs font-black text-emerald-700">
                {isAr ? 'شكراً على رأيك!' : 'Thanks for feedback!'}
              </p>
            </motion.div>
          ) : (
            <>
              <p className="text-[10px] font-black text-[#3E2723] leading-snug">
                {isAr ? 'هل الاقتراح مناسب لمزاجك؟' : 'Does this match your vibe?'}
              </p>
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleSaveFeedback(true)}
                  className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                >
                  👍 {isAr ? 'نعم' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveFeedback(false)}
                  className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                >
                  👎 {isAr ? 'لا' : 'No'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── UPSELL ── */}
      {availableDrinks &&
        availableDrinks.filter(d => d.id !== analysisResult.drinkId).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <h4 className="text-[10px] font-black text-[#3E2723] uppercase tracking-wider mb-3">
              🍪 {isAr ? 'قد يعجبك أيضاً:' : 'You might also like:'}
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              {availableDrinks
                .filter(d => d.id !== analysisResult.drinkId)
                .slice(0, 3)
                .map(drink => (
                  <div
                    key={drink.id}
                    className="border border-gray-100 rounded-xl p-2 text-center bg-[#FAF8F5] flex flex-col items-center gap-1.5 hover:shadow-sm transition-all"
                  >
                    {drink.image && drink.image.trim() !== '' && drink.image !== '☕' && !drink.image.startsWith('emoji:') && (
                      <div className="w-10 h-10 relative rounded-full overflow-hidden border border-gray-200 shadow-sm">
                        <Image
                          src={drink.image}
                          alt={drink.nameAr}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized={true}
                        />
                      </div>
                    )}
                    <p className="text-[9.5px] font-black text-[#3E2723] truncate w-full">
                      {isAr ? drink.nameAr : drink.nameEn}
                    </p>
                    <p className="text-[9px] font-black text-amber-700">
                      {formattedPrice(drink.price)}
                    </p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
    </motion.div>
  )
}
