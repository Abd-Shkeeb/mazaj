'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { Menu, X, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import { logoutAction } from '@/app/actions/auth'

interface NavigationProps {
  setActiveForm?: (form: 'register' | 'login' | null) => void
  isDashboard?: boolean
  hideLogin?: boolean
}

export default function Navigation({
  setActiveForm,
  isDashboard = false,
  hideLogin = false,
}: NavigationProps = {}) {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let currentlyScrolled = false
    let frameId: number

    const handleScroll = () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
      frameId = requestAnimationFrame(() => {
        const isPastThreshold = window.scrollY > 50
        if (isPastThreshold !== currentlyScrolled) {
          currentlyScrolled = isPastThreshold
          setIsScrolled(isPastThreshold)
        }
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [])

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar'
    router.replace(pathname, { locale: nextLocale })
  }

  const handleLogout = async () => {
    await logoutAction()
    window.location.href = `/${locale}`
  }

  const navLinks: { href: string; label: string }[] = []

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-stone-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.01)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group animate-logo-hover">
              <div className="p-2 rounded-xl bg-stone-100 text-stone-900 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-stone-200/60 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-stone-900 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3C7 3 4 7 4 12C4 17 7 21 12 21" strokeWidth="2" />
                  <path d="M12 3C17 3 20 7 20 12C20 17 17 21 12 21" strokeWidth="2" />
                  <path
                    d="M12 3C10 7.5 14 11.5 12 16.5C11.2 18.3 10.8 19.8 12 21"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-stone-900 to-stone-700 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                {t('title')}
              </span>
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!hideLogin &&
              (isDashboard ? (
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 shadow-sm transition-all cursor-pointer hover:shadow-md"
                >
                  {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </button>
              ) : setActiveForm ? (
                <button
                  onClick={() => setActiveForm('login')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-850 text-white shadow-sm hover-lift active:scale-95 cursor-pointer"
                >
                  {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-850 text-white shadow-sm hover-lift active:scale-95"
                >
                  {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              ))}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-stone-800 border border-stone-200/80 rounded-xl hover:bg-stone-50 backdrop-blur-sm hover-lift active:scale-95 cursor-pointer"
            >
              <Globe className="h-4 w-4 text-stone-500" />
              <span>{locale === 'ar' ? t('english') : t('arabic')}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 text-stone-800 border border-stone-250/60 rounded-lg hover:bg-stone-50 backdrop-blur-sm transition-colors active:scale-90"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5 text-stone-500" />
            </button>
            {!hideLogin && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-stone-800 hover:bg-stone-50 backdrop-blur-sm transition-all duration-200 active:scale-90"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-200/80 bg-white/95 backdrop-blur-lg animate-in fade-in slide-in-from-top-4 duration-300 ease-out">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-center">
            {isDashboard ? (
              <button
                onClick={handleLogout}
                className="block w-[90%] mx-auto my-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-center font-bold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            ) : setActiveForm ? (
              <button
                onClick={() => {
                  setActiveForm('login')
                  setIsOpen(false)
                }}
                className="block w-[90%] mx-auto my-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white text-center font-bold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block mx-4 my-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white text-center font-bold text-xs shadow-sm transition-transform active:scale-95"
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
