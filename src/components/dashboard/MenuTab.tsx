'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import NextImage from 'next/image'
import {
  Coffee,
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  AlertCircle,
  X,
  Search,
} from 'lucide-react'
import { uploadFileToStorage, deleteFileFromStorage } from '@/lib/supabase'

interface Drink {
  id: string
  nameAr: string
  nameEn: string
  description: string
  price: number
  isAvailable: boolean
  category: string
  image: string | null
  caffeine: number
  energy: number
  sweetness: number
  isHot: boolean
}

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
  trialEndsAt: Date | string
  subscriptionPlan: string
  subscriptionStatus: string
}

interface MenuTabProps {
  isAr: boolean
  drinks: Drink[]
  limits: {
    maxDrinks: number
    maxUsers: number
    hasMoodAnalytics: boolean
    hasSalesReports: boolean
    hasBetaAnalytics: boolean
    hasFunnelAnalytics: boolean
    hasMultiBranch: boolean
  }
  editingDrink: Drink | null
  setEditingDrink: (drink: Drink | null) => void
  drinkImgUrl: string | null
  setDrinkImgUrl: (url: string | null) => void
  uploadingDrinkImg: boolean
  setUploadingDrinkImg: (val: boolean) => void
  isSubmitting: boolean
  isPending: boolean
  handleSaveDrink: (e: React.FormEvent<HTMLFormElement>) => void
  handleToggleAvailability: (drink: Drink) => void
  handleDeleteDrink: (id: string) => void
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void
  settings: Cafe
}

export default function MenuTab({
  isAr,
  drinks,
  limits,
  editingDrink,
  setEditingDrink,
  drinkImgUrl,
  setDrinkImgUrl,
  uploadingDrinkImg,
  setUploadingDrinkImg,
  isSubmitting,
  isPending,
  handleSaveDrink,
  handleToggleAvailability,
  handleDeleteDrink,
  addToast,
  settings,
}: MenuTabProps) {
  const t = useTranslations('admin')
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredDrinks = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return drinks
    return drinks.filter(
      d =>
        d.nameAr.toLowerCase().includes(q) ||
        d.nameEn.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.category && d.category.toLowerCase().includes(q))
    )
  }, [drinks, searchQuery])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-200">
      {/* Form to add or edit */}
      <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm h-fit space-y-5">
        <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3">
          <Plus className="h-4.5 w-4.5 text-stone-900" />
          <h3 className="text-sm font-bold text-stone-900">
            {editingDrink ? (isAr ? 'تعديل المشروب' : 'Edit Drink') : t('addDrink')}
          </h3>
        </div>

        <form key={editingDrink?.id || 'new'} onSubmit={handleSaveDrink} className="space-y-4">
          <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
            <label className="text-xs font-semibold text-stone-700 tracking-wide block">
              {t('nameAr')} *
            </label>
            <input
              type="text"
              required
              name="nameAr"
              defaultValue={editingDrink?.nameAr || ''}
              placeholder="إسبريسو غني"
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-transparent text-stone-900"
            />
          </div>

          <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
            <label className="text-xs font-semibold text-stone-700 tracking-wide block">
              {t('nameEn')} *
            </label>
            <input
              type="text"
              required
              name="nameEn"
              defaultValue={editingDrink?.nameEn || ''}
              placeholder="Rich Espresso"
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-transparent text-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
              <label className="text-xs font-semibold text-stone-700 tracking-wide block">
                {t('price')} *
              </label>
              <input
                type="number"
                required
                name="price"
                defaultValue={editingDrink?.price || ''}
                placeholder="3000"
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-transparent text-stone-900"
              />
            </div>

            <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
              <label className="text-xs font-semibold text-stone-700 tracking-wide block">
                {t('category')} *
              </label>
              <select
                name="category"
                defaultValue={editingDrink?.category || 'Hot'}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
              >
                <option value="Hot">{isAr ? 'حار - Hot' : 'Hot'}</option>
                <option value="Cold">{isAr ? 'بارد - Cold' : 'Cold'}</option>
              </select>
            </div>
          </div>

          {/* ─── Premium Ingredient Attributes Sliders (1-5 scale) ─── */}
          <div className="space-y-4 py-3.5 px-4 bg-stone-50/70 rounded-xl border border-stone-200/60">
            {/* Caffeine Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  ⚡ {isAr ? 'مستوى الكافيين' : 'Caffeine Level'}
                </span>
                <span className="text-[9px] font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-sm">
                  {editingDrink?.caffeine || 3} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                name="caffeine"
                defaultValue={editingDrink?.caffeine || 3}
                onChange={(e) => {
                  const val = e.target.value;
                  const displayId = 'caffeine-desc';
                  const label = document.getElementById(displayId);
                  const stars = document.getElementById('caffeine-stars');
                  if (label) {
                    label.textContent = val === '1' ? (isAr ? 'منخفض جدًا (بدون كافيين تقريباً)' : 'Very Low (Almost decaf)') :
                                      val === '2' ? (isAr ? 'منخفض (كافيين خفيف)' : 'Low (Mild caffeine)') :
                                      val === '3' ? (isAr ? 'متوسط (كافيين متوازن)' : 'Medium (Balanced caffeine)') :
                                      val === '4' ? (isAr ? 'مرتفع (كافيين قوي)' : 'High (Strong caffeine)') :
                                      (isAr ? 'مرتفع جدًا (كافيين عالٍ جدًا)' : 'Very High (High boost)');
                  }
                  if (stars) {
                    stars.textContent = '⭐'.repeat(parseInt(val, 10)) + '☆'.repeat(5 - parseInt(val, 10));
                  }
                }}
                className="w-full accent-stone-800 cursor-pointer h-1 bg-stone-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold">
                <span id="caffeine-desc" className="text-[9px] text-stone-500 italic">
                  {(editingDrink?.caffeine || 3) === 1 ? (isAr ? 'منخفض جدًا (بدون كافيين تقريباً)' : 'Very Low (Almost decaf)') :
                   (editingDrink?.caffeine || 3) === 2 ? (isAr ? 'منخفض (كافيين خفيف)' : 'Low (Mild caffeine)') :
                   (editingDrink?.caffeine || 3) === 3 ? (isAr ? 'متوسط (كافيين متوازن)' : 'Medium (Balanced caffeine)') :
                   (editingDrink?.caffeine || 3) === 4 ? (isAr ? 'مرتفع (كافيين قوي)' : 'High (Strong caffeine)') :
                   (isAr ? 'مرتفع جدًا (كافيين عالٍ جدًا)' : 'Very High (High boost)')}
                </span>
                <span id="caffeine-stars" className="text-amber-500 tracking-wider">
                  {'⭐'.repeat(editingDrink?.caffeine || 3) + '☆'.repeat(5 - (editingDrink?.caffeine || 3))}
                </span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  🔥 {isAr ? 'مستوى الطاقة والنشاط' : 'Energy Level'}
                </span>
                <span className="text-[9px] font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-sm">
                  {editingDrink?.energy || 3} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                name="energy"
                defaultValue={editingDrink?.energy || 3}
                onChange={(e) => {
                  const val = e.target.value;
                  const displayId = 'energy-desc';
                  const label = document.getElementById(displayId);
                  const stars = document.getElementById('energy-stars');
                  if (label) {
                    label.textContent = val === '1' ? (isAr ? 'منخفض جدًا (هدوء واسترخاء)' : 'Very Low (Calming & relaxing)') :
                                      val === '2' ? (isAr ? 'منخفض (تأثير لطيف)' : 'Low (Gentle energy)') :
                                      val === '3' ? (isAr ? 'متوسط (حيوية طبيعية)' : 'Medium (Moderate vitality)') :
                                      val === '4' ? (isAr ? 'مرتفع (نشاط عالي)' : 'High (Active boost)') :
                                      (isAr ? 'مرتفع جدًا (طاقة فائقة)' : 'Very High (Supercharged energy)');
                  }
                  if (stars) {
                    stars.textContent = '⭐'.repeat(parseInt(val, 10)) + '☆'.repeat(5 - parseInt(val, 10));
                  }
                }}
                className="w-full accent-stone-800 cursor-pointer h-1 bg-stone-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold">
                <span id="energy-desc" className="text-[9px] text-stone-500 italic">
                  {(editingDrink?.energy || 3) === 1 ? (isAr ? 'منخفض جدًا (هدوء واسترخاء)' : 'Very Low (Calming & relaxing)') :
                   (editingDrink?.energy || 3) === 2 ? (isAr ? 'منخفض (تأثير لطيف)' : 'Low (Gentle energy)') :
                   (editingDrink?.energy || 3) === 3 ? (isAr ? 'متوسط (حيوية طبيعية)' : 'Medium (Moderate vitality)') :
                   (editingDrink?.energy || 3) === 4 ? (isAr ? 'مرتفع (نشاط عالي)' : 'High (Active boost)') :
                   (isAr ? 'مرتفع جدًا (طاقة فائقة)' : 'Very High (Supercharged energy)')}
                </span>
                <span id="energy-stars" className="text-amber-500 tracking-wider">
                  {'⭐'.repeat(editingDrink?.energy || 3) + '☆'.repeat(5 - (editingDrink?.energy || 3))}
                </span>
              </div>
            </div>

            {/* Sweetness Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  🍯 {isAr ? 'مستوى الحلاوة' : 'Sweetness'}
                </span>
                <span className="text-[9px] font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-sm">
                  {editingDrink?.sweetness || 3} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                name="sweetness"
                defaultValue={editingDrink?.sweetness || 3}
                onChange={(e) => {
                  const val = e.target.value;
                  const displayId = 'sweetness-desc';
                  const label = document.getElementById(displayId);
                  const stars = document.getElementById('sweetness-stars');
                  if (label) {
                    label.textContent = val === '1' ? (isAr ? 'منخفض جدًا (بدون سكر)' : 'Very Low (No added sugar)') :
                                      val === '2' ? (isAr ? 'منخفض (حلاوة خفيفة)' : 'Low (Slightly sweet)') :
                                      val === '3' ? (isAr ? 'متوسط (حلاوة متوازنة)' : 'Medium (Semi-sweet)') :
                                      val === '4' ? (isAr ? 'مرتفع (حلو المذاق)' : 'High (Sweet & rich)') :
                                      (isAr ? 'مرتفع جدًا (حلو للغاية)' : 'Very High (Super sweet)');
                  }
                  if (stars) {
                    stars.textContent = '⭐'.repeat(parseInt(val, 10)) + '☆'.repeat(5 - parseInt(val, 10));
                  }
                }}
                className="w-full accent-stone-800 cursor-pointer h-1 bg-stone-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold">
                <span id="sweetness-desc" className="text-[9px] text-stone-500 italic">
                  {(editingDrink?.sweetness || 3) === 1 ? (isAr ? 'منخفض جدًا (بدون سكر)' : 'Very Low (No added sugar)') :
                   (editingDrink?.sweetness || 3) === 2 ? (isAr ? 'منخفض (حلاوة خفيفة)' : 'Low (Slightly sweet)') :
                   (editingDrink?.sweetness || 3) === 3 ? (isAr ? 'متوسط (حلاوة متوازنة)' : 'Medium (Semi-sweet)') :
                   (editingDrink?.sweetness || 3) === 4 ? (isAr ? 'مرتفع (حلو المذاق)' : 'High (Sweet & rich)') :
                   (isAr ? 'مرتفع جدًا (حلو للغاية)' : 'Very High (Super sweet)')}
                </span>
                <span id="sweetness-stars" className="text-amber-500 tracking-wider">
                  {'⭐'.repeat(editingDrink?.sweetness || 3) + '☆'.repeat(5 - (editingDrink?.sweetness || 3))}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
            <label className="text-xs font-semibold text-stone-700 tracking-wide block">
              {isAr ? 'نوع التقديم' : 'Serving Type'}
            </label>
            <select
              name="isHot"
              defaultValue={editingDrink ? String(editingDrink.isHot) : 'true'}
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
            >
              <option value="true">{isAr ? 'يقدم ساخناً' : 'Serves Hot'}</option>
              <option value="false">{isAr ? 'يقدم بارداً' : 'Serves Cold'}</option>
            </select>
          </div>

          <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
            <label className="text-xs font-semibold text-stone-700 tracking-wide block">
              {t('desc')} *
            </label>
            <textarea
              required
              name="description"
              rows={2}
              defaultValue={editingDrink?.description || ''}
              placeholder="وصف المشروب"
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
            />
          </div>

          <div className="space-y-1 text-right rtl:text-right ltr:text-left">
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
              {t('image')}
            </label>
            <div className="space-y-2">
              {drinkImgUrl && (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-stone-200 group">
                  <img
                    src={drinkImgUrl}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const oldUrl = drinkImgUrl
                      setDrinkImgUrl(null)
                      await deleteFileFromStorage(oldUrl)
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full cursor-pointer transition-colors shadow-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center border border-dashed border-stone-300 hover:border-stone-400 rounded-xl p-4 cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-all">
                {uploadingDrinkImg ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-stone-500">
                      {isAr ? 'جاري الرفع...' : 'Uploading...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <PlusCircle className="h-5 w-5 text-stone-400" />
                    <span className="text-[10px] font-bold text-stone-700">
                      {isAr ? 'اختر صورة المشروب' : 'Select Drink Image'}
                    </span>
                    <span className="text-[8px] text-stone-450">
                      {isAr ? 'اختياري - صيغة JPG أو PNG' : 'Optional - JPG or PNG'}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingDrinkImg}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploadingDrinkImg(true)
                    try {
                      if (drinkImgUrl) {
                        await deleteFileFromStorage(drinkImgUrl)
                      }
                      const url = await uploadFileToStorage(
                        file,
                        `cafes/${settings.id}/drinks`,
                      )
                      setDrinkImgUrl(url)
                    } catch (err) {
                      addToast(
                        isAr ? 'فشل رفع الصورة' : 'Failed to upload image',
                        'error',
                      )
                    } finally {
                      setUploadingDrinkImg(false)
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {drinks.length >= limits.maxDrinks && !editingDrink && (
            <div className="flex gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-right rtl:text-right ltr:text-left">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {isAr ? 'وصلت للحد الأقصى للمشروبات!' : 'Reached maximum drink limit!'}
                </p>
                <p className="font-semibold text-stone-500 mt-0.5">
                  {isAr
                    ? `باقتك الحالية تسمح بـ ${limits.maxDrinks} مشروبات فقط. يرجى ترقية الباقة لزيادة الحد.`
                    : `Your current plan allows ${limits.maxDrinks} drinks. Please upgrade your plan.`}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={(e) => {
                setEditingDrink(null)
                setDrinkImgUrl(null)
                const form = e.currentTarget.closest('form')
                if (form) {
                  form.reset()
                }
                addToast(
                  isAr
                    ? 'تم مسح الحقول وجاهز لإضافة مشروب جديد ✨'
                    : 'Fields cleared, ready to add a new drink ✨',
                  'info'
                )
              }}
              className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 hover:shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{isAr ? 'مشروب جديد' : 'New Drink'}</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPending || (drinks.length >= limits.maxDrinks && !editingDrink)}
              className={`flex-[2] py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all active:scale-95 ${isSubmitting || isPending || (drinks.length >= limits.maxDrinks && !editingDrink)
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none border border-stone-200'
                  : 'bg-stone-900 hover:bg-stone-850 text-white'
                }`}
            >
              {isSubmitting || isPending
                ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                : editingDrink
                  ? (isAr ? 'حفظ التغييرات' : 'Save Changes')
                  : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col space-y-4 max-h-[900px]">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200/80 pb-3 text-right rtl:text-right ltr:text-left">
          {isAr ? 'قائمة مشروبات مقهاك' : 'Your Cafe Menu'}
        </h3>

        {drinks.length > 0 && (
          <div className="relative">
            <Search className="absolute right-3.5 top-3 h-4 w-4 text-stone-450" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن مشروب بالاسم أو الوصف...' : 'Search drink by name or description...'}
              className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-transparent text-stone-900"
            />
          </div>
        )}

        {drinks.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400 font-bold">
            {isAr
              ? 'لا توجد مشروبات في قائمة مقهاك حالياً.'
              : 'No drinks in your menu yet.'}
          </div>
        ) : filteredDrinks.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400 font-bold">
            {isAr
              ? 'لا توجد مشروبات تطابق بحثك الحالي.'
              : 'No drinks match your current search.'}
          </div>
        ) : (
          <div className="divide-y divide-stone-100 flex-1 overflow-y-auto pr-1 scrollbar-none">
            {filteredDrinks.map(drink => (
              <div
                key={drink.id}
                className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-stone-50/50 transition-colors px-1 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {drink.image ? (
                    <div className="relative w-12 h-12 overflow-hidden rounded-xl border border-stone-100 flex-shrink-0">
                      <NextImage
                        src={drink.image}
                        alt={drink.nameEn}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200/80 flex-shrink-0">
                      <Coffee className="h-5 w-5" />
                    </div>
                  )}
                  <div className="text-right rtl:text-right ltr:text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-stone-900">
                        {isAr ? drink.nameAr : drink.nameEn}
                      </h4>
                      <span
                        className={`text-[8.5px] px-2 py-0.5 rounded font-bold uppercase border ${drink.category === 'Hot'
                          ? 'bg-orange-50 text-orange-700 border-orange-200/40'
                          : 'bg-blue-50 text-blue-700 border-blue-200/40'
                          }`}
                      >
                        {drink.category === 'Hot'
                          ? (isAr ? 'حار' : 'Hot')
                          : (isAr ? 'بارد' : 'Cold')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-medium mt-1 max-w-lg leading-relaxed">
                      {drink.description}
                    </p>
                    <div className="flex gap-2 text-[9px] text-stone-500 font-semibold mt-2">
                      <span>
                        {isAr
                          ? `كافيين: ${drink.caffeine}/5`
                          : `Caffeine: ${drink.caffeine}/5`}
                      </span>
                      <span>|</span>
                      <span>
                        {isAr ? `طاقة: ${drink.energy}/5` : `Energy: ${drink.energy}/5`}
                      </span>
                      <span>|</span>
                      <span>
                        {isAr
                          ? `حلاوة: ${drink.sweetness}/5`
                          : `Sweetness: ${drink.sweetness}/5`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <button
                    onClick={() => handleToggleAvailability(drink)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${drink.isAvailable
                      ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200/40'
                      : 'bg-rose-50/50 text-rose-700 border-rose-200/40'
                      }`}
                  >
                    {drink.isAvailable ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                    <span>
                      {drink.isAvailable
                        ? (isAr ? 'متوفر' : 'Available')
                        : (isAr ? 'غير متوفر' : 'Sold Out')}
                    </span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditingDrink(drink)}
                      className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-stone-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDrink(drink.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
