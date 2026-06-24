'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error caught:', error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#FAF8F5',
          color: '#3E2723',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(93, 64, 55, 0.1)',
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 10px 0' }}>حدث خطأ غير متوقع</h2>
          <p style={{ fontSize: '14px', color: 'rgba(93, 64, 55, 0.8)', margin: '0 0 20px 0', lineHeight: '1.5' }}>
            نعتذر، حدثت مشكلة أثناء تحميل هذه الصفحة. يرجى محاولة إعادة التحميل أو العودة للرئيسية.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => reset()}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#3E2723',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '900',
                cursor: 'pointer',
              }}
            >
              إعادة المحاولة
            </button>
            <a
              href="/ar"
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '900',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              الرئيسية
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
