'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Settings,
  X,
  PlusCircle,
  AlertCircle,
} from 'lucide-react'
import { uploadFileToStorage, deleteFileFromStorage } from '@/lib/supabase'

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
  kioskSessionMinutes?: number | null
  trialEndsAt: Date | string
  subscriptionPlan: string
  subscriptionStatus: string
}

interface SettingsTabProps {
  isAr: boolean
  settings: Cafe
  logoUrl: string | null
  setLogoUrl: (url: string | null) => void
  coverImageUrl: string | null
  setCoverImageUrl: (url: string | null) => void
  lockedLogoUrl: string | null
  setLockedLogoUrl: (url: string | null) => void
  lockedCoverUrl: string | null
  setLockedCoverUrl: (url: string | null) => void
  uploadingLogo: boolean
  setUploadingLogo: (val: boolean) => void
  uploadingCover: boolean
  setUploadingCover: (val: boolean) => void
  handleSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void
  settingsSubTab: 'general' | 'subscription'
  setSettingsSubTab: (tab: 'general' | 'subscription') => void
}

export default function SettingsTab({
  isAr,
  settings,
  logoUrl,
  setLogoUrl,
  coverImageUrl,
  setCoverImageUrl,
  lockedLogoUrl,
  setLockedLogoUrl,
  lockedCoverUrl,
  setLockedCoverUrl,
  uploadingLogo,
  setUploadingLogo,
  uploadingCover,
  setUploadingCover,
  handleSaveSettings,
  addToast,
  settingsSubTab,
  setSettingsSubTab,
}: SettingsTabProps) {
  const t = useTranslations('admin')

  // Avoid hydration mismatch by computing date differences on mount
  const [daysLeft, setDaysLeft] = React.useState<number>(0)
  const [mounted, setMounted] = React.useState<boolean>(false)

  React.useEffect(() => {
    setMounted(true)
    const diff = Math.max(
      0,
      Math.ceil(
        (new Date(settings.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    )
    setDaysLeft(diff)
  }, [settings.trialEndsAt])

  return (
    <div className={`bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm mx-auto space-y-5 animate-in fade-in duration-200 ${settingsSubTab === 'general' ? 'max-w-2xl' : 'max-w-5xl'}`}>
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Settings className="h-4.5 w-4.5 text-stone-900" />
          <h3 className="text-sm font-bold text-stone-900 text-right rtl:text-right ltr:text-left">
            {settingsSubTab === 'general' ? t('cafeSettings') : (isAr ? 'الباقات والاشتراكات' : 'Plans & Subscriptions')}
          </h3>
        </div>

        {/* Sub-tabs switcher */}
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200/40 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setSettingsSubTab('general')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${settingsSubTab === 'general'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200/40'
                : 'text-stone-500 hover:text-stone-900'
              }`}
          >
            {isAr ? '⚙️ الإعدادات العامة' : '⚙️ General Settings'}
          </button>
          <button
            type="button"
            id="pricing-plans-section"
            onClick={() => setSettingsSubTab('subscription')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${settingsSubTab === 'subscription'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200/40'
                : 'text-stone-500 hover:text-stone-900'
              }`}
          >
            {isAr ? '💳 الباقات والاشتراك' : '💳 Plans & Subscription'}
          </button>
        </div>
      </div>

      {settingsSubTab === 'general' && (
        <form
          onSubmit={handleSaveSettings}
          className="space-y-4 text-right rtl:text-right ltr:text-left animate-in fade-in duration-150"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                {isAr ? 'اسم المقهى (العربية)' : 'Cafe Name (Arabic)'} *
              </label>
              <input
                type="text"
                required
                name="nameAr"
                defaultValue={settings.nameAr}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                {isAr ? 'اسم المقهى (الإنجليزية)' : 'Cafe Name (English)'} *
              </label>
              <input
                type="text"
                required
                name="nameEn"
                defaultValue={settings.nameEn}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                {isAr ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={settings.phone || ''}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                {isAr ? 'حساب إنستغرام (اسم المستخدم)' : 'Instagram Username'}
              </label>
              <input
                type="text"
                name="instagram"
                placeholder="mazaj.cafe"
                defaultValue={settings.instagram || ''}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
              />
            </div>
          </div>

          {/* Social media links */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
              {isAr ? 'رابط صفحة فيسبوك' : 'Facebook Page Link'}
            </label>
            <input
              type="text"
              name="facebook"
              placeholder="https://facebook.com/mazaj"
              defaultValue={settings.facebook || ''}
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
            />
          </div>

          {/* Logo & Cover Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Logo */}
            <div className="bg-stone-50/50 p-4.5 rounded-2xl border border-stone-200/60 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-stone-900">{t('logo')}</h4>
                <p className="text-[9.5px] text-stone-450 font-semibold mt-0.5">
                  {isAr ? 'شعار دائري يظهر في شاشات الكشك والنتيجة.' : 'Cafe icon displayed in kiosk views.'}
                </p>
              </div>

              {settings.subscriptionPlan === 'LITE' ? (
                <div className="flex gap-2.5 p-3 bg-amber-50/40 border border-amber-200/40 rounded-xl text-amber-800 text-[10px] font-semibold">
                  <span>🔒 {isAr ? 'ميزة تخصيص الشعار تتطلب الباقة القياسية (Standard)' : 'Logo customizer requires Standard Plan'}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shadow-sm flex-shrink-0 group">
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={async () => {
                            if (logoUrl) {
                              await deleteFileFromStorage(logoUrl)
                              setLogoUrl(null)
                            }
                          }}
                          className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-250 flex items-center justify-center text-stone-400 flex-shrink-0">
                        <PlusCircle className="h-5 w-5" />
                      </div>
                    )}

                    <div className="flex-1">
                      <label className="inline-block px-3 py-1.5 bg-white border border-stone-250 hover:bg-stone-50 text-stone-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-sm">
                        <span>{uploadingLogo ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع شعار' : 'Upload Logo')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingLogo}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setUploadingLogo(true)
                              try {
                                const url = await uploadFileToStorage(file, `cafes/${settings.id}/logos`)
                                setLogoUrl(url)
                                addToast(isAr ? 'تم رفع الشعار بنجاح ✨' : 'Logo uploaded successfully ✨', 'success')
                              } catch (err) {
                                addToast(isAr ? 'فشل رفع الشعار' : 'Failed to upload logo', 'error')
                              } finally {
                                setUploadingLogo(false)
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div className="bg-stone-50/50 p-4.5 rounded-2xl border border-stone-200/60 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-stone-900">{t('coverImage')}</h4>
                <p className="text-[9.5px] text-stone-450 font-semibold mt-0.5">
                  {isAr ? 'صورة الغلاف لشاشة الترحيب والانتظار بالكشك.' : 'Kiosk landing page background cover.'}
                </p>
              </div>

              {settings.subscriptionPlan === 'LITE' ? (
                <div className="flex gap-2.5 p-3 bg-amber-50/40 border border-amber-200/40 rounded-xl text-amber-800 text-[10px] font-semibold">
                  <span>🔒 {isAr ? 'ميزة تخصيص الغلاف تتطلب الباقة القياسية (Standard)' : 'Cover customizer requires Standard Plan'}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {coverImageUrl ? (
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-stone-200 shadow-sm flex-shrink-0 group">
                        <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={async () => {
                            if (coverImageUrl) {
                              await deleteFileFromStorage(coverImageUrl)
                              setCoverImageUrl(null)
                            }
                          }}
                          className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-10 rounded-lg bg-stone-100 border border-stone-250 flex items-center justify-center text-stone-400 flex-shrink-0">
                        <PlusCircle className="h-4.5 w-4.5" />
                      </div>
                    )}

                    <div className="flex-1">
                      <label className="inline-block px-3 py-1.5 bg-white border border-stone-250 hover:bg-stone-50 text-stone-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-sm">
                        <span>{uploadingCover ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع غلاف' : 'Upload Cover')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingCover}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setUploadingCover(true)
                              try {
                                const url = await uploadFileToStorage(file, `cafes/${settings.id}/covers`)
                                setCoverImageUrl(url)
                                addToast(isAr ? 'تم رفع صورة الغلاف بنجاح ✨' : 'Cover image uploaded successfully ✨', 'success')
                              } catch (err) {
                                addToast(isAr ? 'فشل رفع صورة الغلاف' : 'Failed to upload cover', 'error')
                              } finally {
                                setUploadingCover(false)
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                {isAr ? 'ساعات العمل (العربية)' : 'Working Hours (Ar)'}
              </label>
              <input
                type="text"
                name="workingHoursAr"
                defaultValue={settings.workingHoursAr || ''}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                {isAr ? 'ساعات العمل (الإنجليزية)' : 'Working Hours (En)'}
              </label>
              <input
                type="text"
                name="workingHoursEn"
                defaultValue={settings.workingHoursEn || ''}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
              {t('addressAr')}
            </label>
            <input
              type="text"
              name="addressAr"
              defaultValue={settings.addressAr || ''}
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
              {t('addressEn')}
            </label>
            <input
              type="text"
              name="addressEn"
              defaultValue={settings.addressEn || ''}
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
              {t('kioskSessionMinutes')}
            </label>
            <input
              type="number"
              name="kioskSessionMinutes"
              min={1}
              max={120}
              defaultValue={settings.kioskSessionMinutes ?? 15}
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#4A2E20] hover:bg-[#3B2419] hover:shadow-md text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm mt-2 border border-transparent active:scale-95"
          >
            {t('saveSettings')}
          </button>
        </form>
      )}

      {settingsSubTab === 'subscription' && (
        <div className="space-y-6 text-right rtl:text-right ltr:text-left animate-in fade-in duration-150">
          {/* Subscription Info Card */}
          <div className="bg-stone-50 border border-stone-200/80 p-5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                {isAr ? 'الباقة الحالية' : 'Current Plan'}
              </span>
              <span className="block text-xs font-bold text-[#4A2E20] mt-1 uppercase">
                {settings.subscriptionPlan === 'FREE_TRIAL'
                  ? (isAr ? '🌱 تجربة مجانية' : '🌱 Free Trial')
                  : settings.subscriptionPlan === 'LITE'
                    ? (isAr ? '🌱 لايت' : '🌱 Lite')
                    : settings.subscriptionPlan === 'STANDARD'
                      ? (isAr ? '☕ ستاندرد' : '☕ Standard')
                      : settings.subscriptionPlan === 'PRO'
                        ? (isAr ? '🚀 برو' : '🚀 Pro')
                        : settings.subscriptionPlan}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                {isAr ? 'حالة الاشتراك' : 'Status'}
              </span>
              <span className="block text-xs font-bold text-emerald-600 mt-1">
                {isAr ? 'نشط' : 'Active'}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                {isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </span>
              <span className="block text-xs font-bold text-stone-900 mt-1">
                {mounted ? new Date(settings.trialEndsAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US') : ''}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                {isAr ? 'الأيام المتبقية' : 'Days Left'}
              </span>
              <span className="block text-xs font-bold text-amber-700 mt-1">
                {mounted ? `${daysLeft} ${isAr ? 'يوم' : 'days'}` : ''}
              </span>
            </div>
          </div>

          {/* Pricing Plans Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {/* Lite */}
            <div className={`p-5.5 rounded-2xl border flex flex-col justify-between shadow-sm transition-all bg-white hover:border-stone-300 ${settings.subscriptionPlan === 'LITE' ? 'border-[#4A2E20]/40 ring-1 ring-[#4A2E20]/20' : 'border-stone-200'
              }`}>
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                  {isAr ? '🌱 لايت' : '🌱 Lite'}
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-stone-900">
                    {isAr ? '39,000 د.ع' : '39,000 IQD'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-semibold">
                    / {isAr ? 'شهرياً' : 'month'}
                  </span>
                </div>
                <ul className="mt-5 space-y-2 text-xs font-semibold text-stone-600">
                  <li>✓ {isAr ? 'حتى 10 مشروبات' : 'Up to 10 drinks'}</li>
                  <li>✓ {isAr ? 'QR Code خاص ومستقل' : 'Unique QR Code'}</li>
                  <li>✓ {isAr ? 'موظف واحد (كاشير)' : '1 staff account'}</li>
                  <li>✓ {isAr ? 'إحصائيات أساسية للمبيعات' : 'Basic sales stats'}</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={settings.subscriptionPlan === 'LITE'}
                onClick={() => window.open('https://wa.me/9647714289802', '_blank')}
                className={`w-full mt-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${settings.subscriptionPlan === 'LITE'
                    ? 'bg-stone-50 text-stone-400 border border-stone-200 cursor-default'
                    : 'bg-[#4A2E20] hover:bg-[#3B2419] text-white'
                  }`}
              >
                {settings.subscriptionPlan === 'LITE'
                  ? (isAr ? 'باقاتك الحالية' : 'Current Plan')
                  : (isAr ? 'تواصل معنا' : 'Contact Us')}
              </button>
            </div>

            {/* Standard (Featured) */}
            <div className={`p-5.5 rounded-2xl border flex flex-col justify-between shadow-md transition-all relative ${settings.subscriptionPlan === 'STANDARD'
                ? 'bg-[#4A2E20] text-white border-[#4A2E20] ring-2 ring-[#4A2E20]/20'
                : 'bg-[#4A2E20] text-white border-[#4A2E20]'
              }`}>
              <div className="absolute -top-2.5 right-4 bg-amber-400 text-[#4A2E20] text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                {isAr ? 'الأكثر اختياراً' : 'Most Popular'}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-300">
                  {isAr ? '☕ ستاندرد' : '☕ Standard'}
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white">
                    {isAr ? '69,000 د.ع' : '69,000 IQD'}
                  </span>
                  <span className="text-[10px] text-stone-200/80 font-semibold">
                    / {isAr ? 'شهرياً' : 'month'}
                  </span>
                </div>
                <ul className="mt-5 space-y-2 text-xs font-semibold text-stone-150">
                  <li>✓ {isAr ? 'حتى 30 مشروباً' : 'Up to 30 drinks'}</li>
                  <li>✓ {isAr ? 'QR Code خاص ومستقل' : 'Unique QR Code'}</li>
                  <li>✓ {isAr ? 'حتى 3 موظفين' : 'Up to 3 staff users'}</li>
                  <li>✓ {isAr ? 'تحليلات المزاج المتقدمة' : 'Mood analytics'}</li>
                  <li>✓ {isAr ? 'تقارير المبيعات البيانية' : 'Sales reports & graphs'}</li>
                  <li>✓ {isAr ? 'تخصيص الشعار والغلاف' : 'Logo & cover upload'}</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={settings.subscriptionPlan === 'STANDARD'}
                onClick={() => window.open('https://wa.me/9647714289802', '_blank')}
                className={`w-full mt-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${settings.subscriptionPlan === 'STANDARD'
                    ? 'bg-[#4A2E20]/30 text-stone-300 border border-white/20 cursor-default'
                    : 'bg-amber-400 hover:bg-amber-350 text-[#4A2E20]'
                  }`}
              >
                {settings.subscriptionPlan === 'STANDARD'
                  ? (isAr ? 'باقاتك الحالية' : 'Current Plan')
                  : (isAr ? 'تواصل معنا' : 'Contact Us')}
              </button>
            </div>

            {/* Pro */}
            <div className={`p-5.5 rounded-2xl border flex flex-col justify-between shadow-sm transition-all bg-white hover:border-stone-300 ${settings.subscriptionPlan === 'PRO' ? 'border-[#4A2E20]/40 ring-1 ring-[#4A2E20]/20' : 'border-stone-200'
              }`}>
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                  {isAr ? '🚀 برو' : '🚀 Pro'}
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-stone-900">
                    {isAr ? '119,000 د.ع' : '119,000 IQD'}
                  </span>
                  <span className="text-[10px] text-stone-450 font-semibold">
                    / {isAr ? 'شهرياً' : 'month'}
                  </span>
                </div>
                <ul className="mt-5 space-y-2 text-xs font-semibold text-stone-600">
                  <li>✓ {isAr ? 'مشروبات غير محدودة' : 'Unlimited drinks'}</li>
                  <li>✓ {isAr ? 'موظفون غير محدودين' : 'Unlimited staff accounts'}</li>
                  <li>✓ {isAr ? 'جميع التقارير والتحليلات' : 'All reports & analytics'}</li>
                  <li>✓ {isAr ? 'دعم أولوية على مدار الساعة' : '24/7 priority support'}</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={settings.subscriptionPlan === 'PRO'}
                onClick={() => window.open('https://wa.me/9647714289802', '_blank')}
                className={`w-full mt-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${settings.subscriptionPlan === 'PRO'
                    ? 'bg-stone-50 text-stone-400 border border-stone-200 cursor-default'
                    : 'bg-[#4A2E20] hover:bg-[#3B2419] text-white'
                  }`}
              >
                {settings.subscriptionPlan === 'PRO'
                  ? (isAr ? 'باقاتك الحالية' : 'Current Plan')
                  : (isAr ? 'تواصل معنا' : 'Contact Us')}
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-5.5 rounded-2xl border border-stone-200 flex flex-col justify-between shadow-sm bg-white hover:border-stone-300">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                  {isAr ? '🏢 الشركات' : '🏢 Enterprise'}
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-stone-900">
                    {isAr ? 'تواصل معنا' : 'Contact Us'}
                  </span>
                </div>
                <ul className="mt-5 space-y-2 text-xs font-semibold text-stone-600">
                  <li>✓ {isAr ? 'خادم خاص بالكامل' : 'Dedicated server'}</li>
                  <li>✓ {isAr ? 'تكامل مع الـ POS الداخلي' : 'Custom POS integration'}</li>
                  <li>✓ {isAr ? 'تخصيص كامل للنظام' : 'Full system customization'}</li>
                  <li>✓ {isAr ? 'مدير حساب مخصص طوال اليوم' : 'Dedicated account manager'}</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => window.open('https://wa.me/9647714289802', '_blank')}
                className="w-full mt-6 py-2 bg-[#4A2E20] hover:bg-[#3B2419] text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                {isAr ? 'تواصل معنا' : 'Contact Us'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
