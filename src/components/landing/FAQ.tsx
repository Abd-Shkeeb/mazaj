'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'

export default function FAQ() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const faqs = [
    {
      qAr: 'هل يعمل مزاج مع أي نوع مقهى؟',
      qEn: 'Does Mazaj work with any type of cafe?',
      aAr: 'نعم، يمكن استخدام مزاج في المقاهي الصغيرة والمتوسطة وسلاسل المقاهي وحتى الأكشاك والمعارض المؤقتة.',
      aEn: 'Yes, Mazaj can be used in small and medium cafes, cafe chains, kiosks, and temporary exhibitions.',
    },
    {
      qAr: 'كم يستغرق الإعداد لأول مرة؟',
      qEn: 'How long does the initial setup take?',
      aAr: 'يمكن إنشاء المقهى وإضافة المشروبات وتوليد QR Code خلال دقائق قليلة فقط.',
      aEn: 'You can create your cafe, add drinks, and generate the QR Code in just a few minutes.',
    },
    {
      qAr: 'هل يحتاج الزبون إلى تحميل تطبيق؟',
      qEn: 'Does the customer need to download an app?',
      aAr: 'لا، يعمل مباشرة من المتصفح.',
      aEn: 'No, it works directly in the browser.',
    },
    {
      qAr: 'هل يحتاج المقهى إلى أجهزة خاصة؟',
      qEn: 'Does the cafe need special hardware?',
      aAr: 'لا، يكفي هاتف أو جهاز لإدارة لوحة التحكم.',
      aEn: 'No, any smartphone or device to manage the dashboard is sufficient.',
    },
    {
      qAr: 'هل يمكن إضافة مشروباتي الخاصة؟',
      qEn: 'Can I add my own custom drinks?',
      aAr: 'نعم، يمكنك إضافة وإدارة جميع المشروبات بسهولة.',
      aEn: 'Yes, you can add and manage all your drinks easily.',
    },
    {
      qAr: 'هل يمكن استخدام المنصة في أكثر من فرع؟',
      qEn: 'Can the platform be used in more than one branch?',
      aAr: 'نعم من خلال الباقات المناسبة.',
      aEn: 'Yes, through the appropriate packages.',
    },
    {
      qAr: 'ماذا يحدث عند انتهاء التجربة المجانية؟',
      qEn: 'What happens when the free trial ends?',
      aAr: 'يتم تحويل الحساب إلى صفحة الاشتراكات لاختيار الباقة المناسبة.',
      aEn: 'You will be redirected to the subscriptions page to choose the appropriate plan.',
    },
    {
      qAr: 'هل يمكن إلغاء الاشتراك؟',
      qEn: 'Can I cancel my subscription?',
      aAr: 'نعم في أي وقت.',
      aEn: 'Yes, at any time.',
    },
    {
      qAr: 'هل يعمل QR Code على جميع الهواتف؟',
      qEn: 'Does the QR Code work on all phones?',
      aAr: 'نعم، يعمل على جميع الهواتف الحديثة.',
      aEn: 'Yes, it works on all modern phones.',
    },
  ]

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-3xl font-black text-[#3E2723]">
          {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
      </motion.div>

      <motion.div
        className="space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {faqs.map((faq, idx) => {
          const isOpen = activeFaq === idx
          return (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="bg-white rounded-2xl border border-[#5D4037]/10 shadow-sm overflow-hidden transition-all duration-300"
            >
              <button
                type="button"
                id={`faq-btn-${idx}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${idx}`}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full p-6 text-right rtl:text-right ltr:text-left flex justify-between items-center font-black text-[#3E2723] hover:bg-[#FAF9F6]/50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-[#3E2723]/60" />
                  <span>{isAr ? faq.qAr : faq.qEn}</span>
                </span>
                <span
                  className={`text-[10px] text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#3E2723]' : ''}`}
                >
                  ▼
                </span>
              </button>
              <motion.div
                id={`faq-panel-${idx}`}
                role="region"
                aria-labelledby={`faq-btn-${idx}`}
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 text-xs text-gray-600 font-semibold leading-relaxed border-t border-gray-50 pt-4 rtl:pr-8 ltr:pl-8">
                  {isAr ? faq.aAr : faq.aEn}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
