import { QrCode, ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ScanQrPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isAr = locale === 'ar'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-4 py-12 relative overflow-hidden">
      {/* Background decorative blurry circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#3E2723]/5 rounded-full blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none select-none" />

      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-md border border-[#3E2723]/10 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-350">
        {/* Warning Icon Container */}
        <div className="w-20 h-20 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <QrCode className="h-10 w-10 text-amber-700 animate-pulse" />
        </div>

        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight">
            {isAr ? 'انتهت صلاحية الجلسة' : 'Session Expired'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-505 leading-relaxed">
            {isAr
              ? 'لا يمكنك استخدام الجلسة القديمة. يرجى مسح رمز الـ QR الموجود على طاولتك لبدء جلسة جديدة وطلب المشروبات.'
              : 'You cannot use the old session. Please scan the physical QR code on your table to start a new session and order drinks.'}
          </p>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3 text-right rtl:text-right ltr:text-left">
          <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-amber-900">
              {isAr ? 'إشعار أمان الكشك' : 'Kiosk Security Notice'}
            </h4>
            <p className="text-[10px] text-amber-800 font-bold leading-normal">
              {isAr
                ? 'تنتهي صلاحية الجلسات لحماية أمان طلباتك ومنع الاستخدام غير المصرح به خارج المقهى.'
                : 'Sessions expire automatically to protect order security and prevent remote ordering outside the cafe.'}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-150 pt-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Mazaj • مزاج
        </div>
      </div>
    </div>
  )
}
