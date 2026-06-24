import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import '@/app/globals.css'

export const metadata = {
  title: 'مزاج - Mazaj | مزاجك يختار مشروبك ☕',
  description:
    'منصة ذكية تعتمد على الذكاء الاصطناعي لتحليل حالتك المزاجية وترشيح المشروب المثالي والمقاهي المتوفر بها.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mazaj',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'ar' | 'en')) {
    notFound()
  }

  const messages = await getMessages()
  const isRtl = locale === 'ar'
  const direction = isRtl ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={direction}
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${isRtl ? 'lang-ar' : 'lang-en'} antialiased bg-[#FAF8F5] text-[#2D2D2D] selection:bg-[#5D4037]/20 selection:text-[#5D4037]`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
