'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Settings,
  X,
  PlusCircle,
} from 'lucide-react'
import { uploadFileToStorage, deleteFileFromStorage } from '@/lib/supabase'
import { updateCafeSettingsAction } from '@/app/actions/dashboard'

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
}: SettingsTabProps) {
  const t = useTranslations('admin')

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3">
        <Settings className="h-4.5 w-4.5 text-stone-900" />
        <h3 className="text-sm font-bold text-stone-900 text-right rtl:text-right ltr:text-left">{t('cafeSettings')}</h3>
      </div>

      <form
        onSubmit={handleSaveSettings}
        className="space-y-4 text-right rtl:text-right ltr:text-left"
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
              {t('phone')}
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
              {t('logo')}
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 flex-shrink-0">
                  {logoUrl.startsWith('http') ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-50 flex items-center justify-center text-xl text-stone-700 font-bold border border-stone-100">
                      {logoUrl}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      const oldUrl = logoUrl
                      setLogoUrl(null)
                      if (oldUrl.startsWith('http')) {
                        await deleteFileFromStorage(oldUrl)
                      }
                    }}
                    className="absolute top-1 right-1 bg-red-650 text-white p-1 rounded-full cursor-pointer shadow-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center flex-shrink-0 text-stone-400">
                  ☕
                </div>
              )}
              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-stone-300 hover:border-stone-400 rounded-xl p-3 cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-all">
                {uploadingLogo ? (
                  <span className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-stone-750 block">
                      {isAr ? 'رفع شعار' : 'Upload Logo'}
                    </span>
                    <span className="text-[8px] text-stone-450">
                      {isAr ? 'شعار دائري أو أيقونة' : 'Icon or logo'}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingLogo}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploadingLogo(true)
                    try {
                      if (logoUrl && logoUrl.startsWith('http')) {
                        await deleteFileFromStorage(logoUrl)
                      }
                      const url = await uploadFileToStorage(
                        file,
                        `cafes/${settings.id}/assets`,
                      )
                      setLockedLogoUrl(url)
                      setLogoUrl(url)
                      await updateCafeSettingsAction(settings.id, { logoUrl: url })
                      addToast(isAr ? 'تم تحديث الشعار بنجاح' : 'Logo updated successfully', 'success')
                    } catch (err) {
                      addToast(isAr ? 'فشل رفع الشعار' : 'Failed to upload logo', 'error')
                    } finally {
                      setUploadingLogo(false)
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
              {isAr ? 'صورة الغلاف' : 'Cover Image'}
            </label>
            <div className="space-y-2">
              {coverImageUrl && (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-stone-205">
                  <img
                    src={coverImageUrl}
                    alt="Cover Preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const oldUrl = coverImageUrl
                      setLockedCoverUrl(null)
                      setCoverImageUrl(null)
                      if (oldUrl.startsWith('http')) {
                        await deleteFileFromStorage(oldUrl)
                      }
                      await updateCafeSettingsAction(settings.id, { coverImageUrl: '' })
                    }}
                    className="absolute top-2 right-2 bg-red-650 text-white p-1 rounded-full cursor-pointer shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center border border-dashed border-stone-300 hover:border-stone-405 rounded-xl p-4 cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-all">
                {uploadingCover ? (
                  <span className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <PlusCircle className="h-5 w-5 text-stone-400" />
                    <span className="text-[10px] font-bold text-stone-700">
                      {isAr ? 'رفع صورة غلاف جديدة' : 'Upload Cover Image'}
                    </span>
                    <span className="text-[8px] text-stone-450">
                      {isAr ? 'توصية: حجم عريض' : 'Wide landscape aspect'}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingCover}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploadingCover(true)
                    try {
                      if (coverImageUrl && coverImageUrl.startsWith('http')) {
                        await deleteFileFromStorage(coverImageUrl)
                      }
                      const url = await uploadFileToStorage(
                        file,
                        `cafes/${settings.id}/assets`,
                      )
                      setLockedCoverUrl(url)
                      setCoverImageUrl(url)
                      await updateCafeSettingsAction(settings.id, { coverImageUrl: url })
                      addToast(isAr ? 'تم تحديث صورة الغلاف بنجاح' : 'Cover image updated successfully', 'success')
                    } catch (err) {
                      addToast(
                        isAr ? 'فشل رفع صورة الغلاف' : 'Failed to upload cover',
                        'error',
                      )
                    } finally {
                      setUploadingCover(false)
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
              {isAr ? 'رابط إنستغرام' : 'Instagram URL'}
            </label>
            <input
              type="text"
              name="instagram"
              defaultValue={settings.instagram || ''}
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent text-stone-900"
            />
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
          className="w-full py-3 bg-stone-900 hover:bg-stone-850 hover:shadow-md text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm mt-2 border border-transparent active:scale-95"
        >
          {t('saveSettings')}
        </button>
      </form>
    </div>

  )
}
