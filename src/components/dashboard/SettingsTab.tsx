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
    <div className="bg-white p-6 rounded-2xl border border-[#3E2723]/10 shadow-sm max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <Settings className="h-4.5 w-4.5 text-[#3E2723]" />
        <h3 className="text-base font-black text-[#2D2D2D]">{t('cafeSettings')}</h3>
      </div>

      <form
        onSubmit={handleSaveSettings}
        className="space-y-4 text-right rtl:text-right ltr:text-left"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
              {isAr ? 'اسم المقهى (العربية)' : 'Cafe Name (Arabic)'} *
            </label>
            <input
              type="text"
              required
              name="nameAr"
              defaultValue={settings.nameAr}
              className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
              {isAr ? 'اسم المقهى (الإنجليزية)' : 'Cafe Name (English)'} *
            </label>
            <input
              type="text"
              required
              name="nameEn"
              defaultValue={settings.nameEn}
              className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
              {t('phone')}
            </label>
            <input
              type="text"
              name="phone"
              defaultValue={settings.phone || ''}
              className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
              {t('logo')}
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-150 flex-shrink-0">
                  {logoUrl.startsWith('http') ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#3E2723]/5 flex items-center justify-center text-xl">
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
                    className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full cursor-pointer shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400">
                  ☕
                </div>
              )}
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#3E2723] rounded-xl p-3 cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-all">
                {uploadingLogo ? (
                  <span className="w-5 h-5 border-2 border-[#3E2723] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="text-center">
                    <span className="text-[10px] font-black text-[#3E2723] block">
                      {isAr ? 'رفع شعار' : 'Upload Logo'}
                    </span>
                    <span className="text-[8px] text-gray-400">
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
            <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
              {isAr ? 'صورة الغلاف' : 'Cover Image'}
            </label>
            <div className="space-y-2">
              {coverImageUrl && (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-150">
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
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full cursor-pointer shadow"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#3E2723] rounded-xl p-4 cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-all">
                {uploadingCover ? (
                  <span className="w-5 h-5 border-2 border-[#3E2723] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <PlusCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-600">
                      {isAr ? 'رفع صورة غلاف جديدة' : 'Upload Cover Image'}
                    </span>
                    <span className="text-[8px] text-gray-400">
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
            <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
              {isAr ? 'رابط إنستغرام' : 'Instagram URL'}
            </label>
            <input
              type="text"
              name="instagram"
              defaultValue={settings.instagram || ''}
              className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
              {isAr ? 'ساعات العمل (العربية)' : 'Working Hours (Ar)'}
            </label>
            <input
              type="text"
              name="workingHoursAr"
              defaultValue={settings.workingHoursAr || ''}
              className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
              {isAr ? 'ساعات العمل (الإنجليزية)' : 'Working Hours (En)'}
            </label>
            <input
              type="text"
              name="workingHoursEn"
              defaultValue={settings.workingHoursEn || ''}
              className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
            {t('addressAr')}
          </label>
          <input
            type="text"
            name="addressAr"
            defaultValue={settings.addressAr || ''}
            className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
            {t('addressEn')}
          </label>
          <input
            type="text"
            name="addressEn"
            defaultValue={settings.addressEn || ''}
            className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider">
            {t('kioskSessionMinutes')}
          </label>
          <input
            type="number"
            name="kioskSessionMinutes"
            min={1}
            max={120}
            defaultValue={settings.kioskSessionMinutes ?? 45}
            className="w-full p-2.5 rounded-xl border border-[#3E2723]/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3.5 bg-[#3E2723] hover:bg-[#2D1B18] text-[#FAF8F5] rounded-xl text-xs font-black transition-colors cursor-pointer shadow-sm mt-2"
        >
          {t('saveSettings')}
        </button>
      </form>
    </div>
  )
}
