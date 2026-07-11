import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'GEMINI_API_KEY is not set in environment variables.'
    })
  }

  const maskedKey = apiKey.length > 8 
    ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` 
    : 'INVALID_KEY';

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    // Use the model configured in analyze.ts
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const start = Date.now()
    const result = await model.generateContent('Hi, reply with one word "OK" if you receive this.')
    const latency = ((Date.now() - start) / 1000).toFixed(2)
    const rawText = result.response.text()

    return NextResponse.json({
      success: true,
      status: 'Active',
      planType: apiKey.startsWith('AI') ? 'Free/Default API Key' : 'Paid/Tier Key',
      latencySeconds: latency,
      responseText: rawText.trim(),
      apiKeyMasked: maskedKey
    })
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    const isQuota = errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('exhausted')
    const isAuth = errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.toLowerCase().includes('key')
    
    let diagnosis = 'Unknown Error / خطأ غير معروف'
    if (isQuota) {
      diagnosis = 'Quota Exceeded / Rate Limit reached. You need to enable billing on Google AI Studio or wait.'
    } else if (isAuth) {
      diagnosis = 'Invalid API Key / Unauthorized. The API key is either invalid, revoked, or has wrong permissions.'
    }

    return NextResponse.json({
      success: false,
      status: 'Interrupted',
      apiKeyMasked: maskedKey,
      diagnosis,
      rawError: errorMsg
    }, { status: 500 })
  }
}
