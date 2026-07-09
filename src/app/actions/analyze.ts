'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import db from '@/lib/db'
import { Drink } from '@prisma/client'
import { headers } from 'next/headers'
import { isRateLimited } from '@/lib/rateLimit'
import { assertActiveSubscription, assertCanAnalyzeMood } from '@/lib/subscription'
import { getMenuDrinks } from '@/lib/drinkCache'
import { validateKioskSession } from './orders'

interface AIResult {
  moodNameAr: string
  moodNameEn: string
  suitableDrinkAr: string
  suitableDrinkEn: string
  drinkDescriptionAr: string
  drinkDescriptionEn: string
  energyLevel: number | null
  sweetnessLevel: number | null
  whyMatchesAr: string
  whyMatchesEn: string
  foodPairingAr: string
  foodPairingEn: string
  drinkId?: string
  price?: number
  image?: string | null
  suggestions?: {
    id: string
    nameAr: string
    nameEn: string
    price: number
    image: string | null
    description: string
  }[]
}

function getFallbackResult(moodInputText: string, menuDrinks: Partial<Drink>[]): AIResult {
  const drink = menuDrinks[Math.floor(Math.random() * menuDrinks.length)]
  
  // Generate suggestions for fallback
  const otherDrinks = menuDrinks.filter(d => d.id !== drink.id)
  const shuffled = [...otherDrinks].sort(() => 0.5 - Math.random())
  const suggestions = shuffled.slice(0, 3).map(d => ({
    id: d.id || '',
    nameAr: d.nameAr || '',
    nameEn: d.nameEn || '',
    price: d.price || 0,
    image: d.image || null,
    description: d.description || '',
  }))

  return {
    moodNameAr: 'مزاج عام',
    moodNameEn: 'General Mood',
    suitableDrinkAr: drink.nameAr || '',
    suitableDrinkEn: drink.nameEn || '',
    drinkDescriptionAr: drink.description || 'مشروب رائع ليومك.',
    drinkDescriptionEn: drink.description || 'A great drink for your day.',
    energyLevel: drink.energy || 50,
    sweetnessLevel: drink.sweetness || 50,
    whyMatchesAr: 'تم اختيار هذا المشروب بناءً على القائمة المتاحة.',
    whyMatchesEn: 'Selected based on available menu.',
    foodPairingAr: 'كرواسون',
    foodPairingEn: 'Croissant',
    drinkId: drink.id,
    price: drink.price,
    image: drink.image,
    suggestions,
  }
}

export async function analyzeMood(formData: {
  moodKey?: string
  customText?: string
  cafeId: string
}) {
  try {
    const { cookies } = await import('next/headers')
    // Validate kiosk session first (blocks requests if session is expired/invalid)
    await validateKioskSession(formData.cafeId)
    // Assert active subscription first (blocks Gemini API call if expired/suspended)
    await assertActiveSubscription(formData.cafeId)
    // Check Gemini vibe analysis quota limits by plan
    await assertCanAnalyzeMood(formData.cafeId)

    // IP-based Rate Limiting (Limit to 5 AI requests per minute per IP)
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'

    if (isRateLimited(ip, 5)) {
      throw new Error('Too many requests / لقد قمت بالعديد من الاستعلامات، يرجى المحاولة بعد دقيقة')
    }

    const { moodKey, customText, cafeId } = formData
    const moodInputText = customText || moodKey || 'happy'

    // Retrieve last recommended drink ID from session cookie to avoid repeats
    const cookieStore = await cookies()
    const lastDrinkId = cookieStore.get('last-recommended-drink-id')?.value

    console.log(`[AI Kiosk Session Log] User Mood Input: "${moodInputText}" | Last Recommended Drink ID in Session Cookie: "${lastDrinkId || 'None'}"`)

    // 1. Fetch available drinks and evaluate suitability/exclusions
    const allDrinks = await db.drink.findMany({
      where: { cafeId },
    })

    const suitableDrinks = allDrinks.filter(d => d.isAvailable && d.description && d.description.trim() !== '')
    const excludedDrinks = allDrinks.filter(d => !d.isAvailable || !d.description || d.description.trim() === '')

    console.log(`[AI Kiosk Session Log] --- Evaluating Drink Suitability for Cafe ID: ${cafeId} ---`)
    console.log(`[AI Kiosk Session Log] Total Drinks in Database: ${allDrinks.length}`)
    console.log(`[AI Kiosk Session Log] Suitable Drinks count: ${suitableDrinks.length}`)
    suitableDrinks.forEach(d => {
      console.log(`[AI Kiosk Session Log] Suitable Drink: "${d.nameEn} / ${d.nameAr}" (ID: ${d.id})`)
    })

    console.log(`[AI Kiosk Session Log] Excluded Drinks count: ${excludedDrinks.length}`)
    excludedDrinks.forEach(d => {
      const reasons: string[] = []
      if (!d.isAvailable) reasons.push('Not available (isAvailable = false)')
      if (!d.description || d.description.trim() === '') reasons.push('Missing description/keywords/mood tags')
      console.log(`[AI Kiosk Session Log] Excluded Drink: "${d.nameEn} / ${d.nameAr}" (ID: ${d.id}) - Reason: ${reasons.join(', ')}`)
    })

    const menuDrinks = suitableDrinks

    const menuListString = menuDrinks
      .map(
        d =>
          `- ${d.nameEn} / ${d.nameAr} (ID: ${d.id}, Description: ${d.description || ''}, Caffeine: ${d.caffeine}, Sweetness: ${d.sweetness}, Energy: ${d.energy}, Temp: ${d.isHot ? 'Hot' : 'Cold'}, Category: ${d.category})`,
      )
      .join('\n')

    let aiResult: AIResult
    let candidatesList: any[] = []

    // If there are no available drinks, return a result indicating none
    if (menuDrinks.length === 0) {
      console.log('[AI Kiosk Session Log] No available drinks found in menu for Cafe ID:', cafeId)
      const noDrinkResult: AIResult = {
        moodNameAr: 'لا يوجد مشروب متاح',
        moodNameEn: 'No Drink Available',
        suitableDrinkAr: '',
        suitableDrinkEn: '',
        drinkId: undefined,
        price: undefined,
        image: undefined,
        drinkDescriptionAr: 'لا توجد مشروبات في القائمة.',
        drinkDescriptionEn: 'No drinks in the menu.',
        energyLevel: null,
        sweetnessLevel: null,
        whyMatchesAr: 'لا يمكن اقتراح مشروب لأنه لا يوجد مشروبات متاحة.',
        whyMatchesEn: 'Cannot suggest a drink because none are available.',
        foodPairingAr: '',
        foodPairingEn: '',
      };
      // Create a mood entry for logging
      const moodEntry = await db.mood.create({
        data: { nameAr: noDrinkResult.moodNameAr, nameEn: noDrinkResult.moodNameEn },
      });
      // Save analysis log with null drink
      const analysis = await db.analysis.create({
        data: {
          userMood: moodInputText,
          moodId: moodEntry.id,
          drinkId: null,
          cafeId: cafeId,
          aiResult: JSON.stringify(noDrinkResult),
        },
      });
      return { id: analysis.id, aiResult: noDrinkResult };
    }

    const apiKey = process.env.GEMINI_API_KEY
    let geminiCalled = false
    let rawGeminiTextResponse = ''

    if (apiKey && apiKey.trim() !== '') {
      try {
        console.log('[AI Kiosk Session Log] Calling Gemini API (gemini-2.5-flash)...')
        geminiCalled = true

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
          },
        })

        const prompt = `
          You are an AI assistant installed in a cafe kiosk called "Mazaj".
          Your task is to analyze the user's mood and recommend all suitable candidate drinks (up to 10) that fit them from the cafe's actual menu list below.
          
          Cafe's Available Menu:
          ${menuListString}
          
          Analyze the user's mood or description: "${moodInputText}".
          
          If possible, try to avoid suggesting the drink with ID "${lastDrinkId || ''}" as the top candidate if there are other good choices.
          
          Select all matching candidate drinks from the menu, ordered from best match to alternative matches.
          
          Provide the result in JSON format only with the following structure:
          {
            "moodNameAr": "اسم المزاج المكتشف بالعربية",
            "moodNameEn": "Mood name in English",
            "candidates": [
              {
                "drinkId": "The exact ID of the drink selected from the menu",
                "suitableDrinkAr": "اسم المشروب بالعربية",
                "suitableDrinkEn": "Suitable Drink name in English",
                "drinkDescriptionAr": "وصف المشروب بالعربية وتأثيره على المزاج",
                "drinkDescriptionEn": "Description of the drink and its mood effect in English",
                "whyMatchesAr": "لماذا يناسب هذا المشروب المزاج المكتشف بالعربية",
                "whyMatchesEn": "Why this drink matches the mood in English",
                "foodPairingAr": "طعام مقترح مرافق للمشروب (مثل: دونات شوكولاتة، كوكيز)",
                "foodPairingEn": "Food pairing recommendation in English",
                "energyLevel": 80,
                "sweetnessLevel": 60
              }
            ]
          }
        `

        const response = await model.generateContent(prompt)
        rawGeminiTextResponse = response.response.text()
        console.log('[AI Kiosk Session Log] Raw Gemini API Response:', rawGeminiTextResponse)

        const parsed = JSON.parse(rawGeminiTextResponse)
        
        // Determine final selected candidate
        candidatesList = []
        if (parsed.candidates && Array.isArray(parsed.candidates) && parsed.candidates.length > 0) {
          candidatesList = parsed.candidates
        } else {
          // Fallback if Gemini outputs single recommendation in old format
          candidatesList = [parsed]
        }

        console.log(`[AI Kiosk Session Log] All Gemini Recommended Candidates:`, JSON.stringify(candidatesList, null, 2))

        // Filter out last recommended drink to avoid repetitions if we have alternatives
        let availableCandidates = candidatesList
        if (lastDrinkId && candidatesList.length > 1) {
          const filtered = candidatesList.filter(c => c.drinkId !== lastDrinkId)
          if (filtered.length > 0) {
            availableCandidates = filtered
            console.log(`[AI Kiosk Session Log] Filtered out last recommended drink ID "${lastDrinkId}". Remaining candidates: ${availableCandidates.length}`)
          }
        }

        // Randomly select between the available candidates to add natural variation
        const randomIndex = Math.floor(Math.random() * availableCandidates.length)
        let selectedCandidate = availableCandidates[randomIndex]
        console.log(`[AI Kiosk Session Log] Selected candidate index ${randomIndex} (ID: ${selectedCandidate.drinkId}, Name: "${selectedCandidate.suitableDrinkEn}") from ${availableCandidates.length} available options`)

        aiResult = {
          moodNameAr: parsed.moodNameAr || 'مزاج عام',
          moodNameEn: parsed.moodNameEn || 'General Mood',
          suitableDrinkAr: selectedCandidate.suitableDrinkAr,
          suitableDrinkEn: selectedCandidate.suitableDrinkEn,
          drinkId: selectedCandidate.drinkId,
          drinkDescriptionAr: selectedCandidate.drinkDescriptionAr,
          drinkDescriptionEn: selectedCandidate.drinkDescriptionEn,
          whyMatchesAr: selectedCandidate.whyMatchesAr,
          whyMatchesEn: selectedCandidate.whyMatchesEn,
          foodPairingAr: selectedCandidate.foodPairingAr || 'كرواسون',
          foodPairingEn: selectedCandidate.foodPairingEn || 'Croissant',
          energyLevel: selectedCandidate.energyLevel ?? 50,
          sweetnessLevel: selectedCandidate.sweetnessLevel ?? 50,
        }
      } catch (error) {
        console.error('[AI Kiosk Session Log] Gemini API Error, falling back to local fallback:', error)
        aiResult = getFallbackResult(moodInputText, menuDrinks)
      }
    } else {
      console.log('[AI Kiosk Session Log] GEMINI_API_KEY not configured. Falling back to local fallback.')
      aiResult = getFallbackResult(moodInputText, menuDrinks)
    }

    // Find or create matching mood in Database
    let moodDb = await db.mood.findFirst({
      where: { nameEn: aiResult.moodNameEn },
    })

    if (!moodDb) {
      moodDb = await db.mood.findFirst({
        where: { nameAr: aiResult.moodNameAr },
      })
    }

    if (!moodDb) {
      moodDb = await db.mood.create({
        data: {
          nameAr: aiResult.moodNameAr,
          nameEn: aiResult.moodNameEn,
        },
      })
    }

    // Fetch full details of the recommended drink to guarantee accurate ID, price and image
    let finalDrink = menuDrinks.find(d => d.id === aiResult.drinkId)
    
    // If AI recommended drink ID is not found, try by name match
    if (!finalDrink && aiResult.suitableDrinkEn) {
      finalDrink = menuDrinks.find(
        d =>
          (d.nameEn && d.nameEn.toLowerCase().includes(aiResult.suitableDrinkEn!.toLowerCase())) ||
          (d.nameAr && d.nameAr.includes(aiResult.suitableDrinkAr!))
      )
    }

    // If still not matched, avoid repeating last recommended drink if other options exist
    if (!finalDrink && menuDrinks.length > 0) {
      const freshOptions = menuDrinks.filter(d => d.id !== lastDrinkId)
      if (freshOptions.length > 0) {
        finalDrink = freshOptions[Math.floor(Math.random() * freshOptions.length)]
      } else {
        finalDrink = menuDrinks[0]
      }
    }

    if (finalDrink) {
      aiResult.drinkId = finalDrink.id
      aiResult.price = finalDrink.price
      aiResult.image = finalDrink.image || undefined
      aiResult.suitableDrinkAr = finalDrink.nameAr ?? ''
      aiResult.suitableDrinkEn = finalDrink.nameEn ?? ''
    }

    // ── Generate Suggestions Dynamic Logic ──
    const recommendedId = aiResult.drinkId || ''
    
    // Get candidates other than the chosen one from the Gemini candidates list
    const otherCandidates = candidatesList
      .filter((c: any) => c.drinkId !== recommendedId)
      .map((c: any) => suitableDrinks.find((d: Drink) => d.id === c.drinkId))
      .filter((d): d is Drink => !!d)

    // Get all other suitable drinks
    const otherSuitable = suitableDrinks.filter(d => d.id !== recommendedId)

    // Combine them, placing other candidates first to prioritize Gemini recommendations
    const suggestionPool = Array.from(new Set([...otherCandidates, ...otherSuitable]))

    // Read previously suggested IDs from cookies to avoid repetition
    const suggestedIdsStr = cookieStore.get('suggested-drink-ids')?.value || ''
    let previouslySuggested = suggestedIdsStr.split(',').filter(Boolean)

    // Filter pool to exclude already suggested ones
    let freshSuggestions = suggestionPool.filter(d => !previouslySuggested.includes(d.id))

    // If we don't have at least 3 fresh suggestions, we exhausted the options. Reset the history!
    if (freshSuggestions.length < 3) {
      previouslySuggested = []
      freshSuggestions = suggestionPool
    }

    // Select 3 random different drinks from the fresh suggestions
    const shuffled = [...freshSuggestions].sort(() => 0.5 - Math.random())
    const selectedSuggestions = shuffled.slice(0, 3)

    // Save the new suggestions in the session history cookie
    const newSuggestedIds = Array.from(new Set([...previouslySuggested, ...selectedSuggestions.map(d => d.id)]))
    cookieStore.set('suggested-drink-ids', newSuggestedIds.join(','), { maxAge: 1800 })

    aiResult.suggestions = selectedSuggestions.map(d => ({
      id: d.id,
      nameAr: d.nameAr,
      nameEn: d.nameEn,
      price: d.price,
      image: d.image,
      description: d.description,
    }))

    // Log final choice method
    console.log(`[AI Kiosk Session Log] Gemini Called: ${geminiCalled} | Final Drink Selected: "${aiResult.suitableDrinkEn}" (ID: ${aiResult.drinkId})`)

    // Save the recommended drink ID in session cookies to prevent consecutive repeats
    if (aiResult.drinkId) {
      cookieStore.set('last-recommended-drink-id', aiResult.drinkId, { maxAge: 1800 }) // 30 minutes Kiosk Session limit
    }

    // Save analysis log
    const analysis = await db.analysis.create({
      data: {
        userMood: moodInputText,
        moodId: moodDb.id,
        drinkId: finalDrink?.id || null,
        cafeId: cafeId,
        aiResult: JSON.stringify(aiResult),
      },
    })

    return {
      id: analysis.id,
      aiResult,
    }
  } catch (error: any) {
    const digest = `digest-${Math.random().toString(36).substr(2, 9)}`
    console.error(`[AI Kiosk Session Log] [Digest: ${digest}] CRITICAL ERROR IN analyzeMood Server Action:`, error.message || error)
    if (error.stack) {
      console.error(`[AI Kiosk Session Log] [Digest: ${digest}] STACK TRACE:`, error.stack)
    }
    const isSessionErr = ['SESSION_MISSING', 'SESSION_INVALID', 'SESSION_USED', 'SESSION_EXPIRED', 'SESSION_MISMATCH'].includes(error.message)
    // Return structured error response to avoid Next.js 500 render crash
    return {
      success: false,
      code: isSessionErr ? error.message : 'ANALYZE_FAILED',
      id: '',
      error: error.message || 'Internal Server Error',
      digest,
      aiResult: {
        moodNameAr: 'خطأ في التحليل',
        moodNameEn: 'Analysis Error',
        suitableDrinkAr: '',
        suitableDrinkEn: '',
        drinkDescriptionAr: `حدث خطأ أثناء تحليل المزاج: ${error.message || 'خطأ غير معروف'}`,
        drinkDescriptionEn: `An error occurred during analysis: ${error.message || 'Unknown error'}`,
        energyLevel: null,
        sweetnessLevel: null,
        whyMatchesAr: 'يرجى التأكد من باقة الاشتراك أو المحاولة مرة أخرى لاحقاً.',
        whyMatchesEn: 'Please check your subscription plan or try again later.',
        foodPairingAr: '',
        foodPairingEn: '',
      }
    }
  }
}

function getKeywordFallbackResult(inputText: string, menuDrinks: Partial<Drink>[]): AIResult {
  const lowerText = inputText.toLowerCase()

  // Try to find a match by keyword
  let matchedDrink = menuDrinks[0] // default fallback
  let moodAr = 'مزاج فريد'
  let moodEn = 'Unique Mood'
  let whyAr = ''
  let whyEn = ''
  const pairingAr = 'دونات الشوكولاتة 🍩'
  const pairingEn = 'Chocolate Donut 🍩'

  if (
    lowerText.includes('happy') ||
    lowerText.includes('سعيد') ||
    lowerText.includes('😊') ||
    lowerText.includes('excited') ||
    lowerText.includes('متحمس')
  ) {
    moodAr = 'سعيد ومتحمس'
    moodEn = 'Happy & Excited'
    matchedDrink =
      menuDrinks.find(
        d =>
          (d.nameEn?.toLowerCase() ?? '').includes('frappuccino') ||
          (d.nameEn?.toLowerCase() ?? '').includes('latte'),
      ) || menuDrinks[0]
    whyAr = 'الحلاوة والبرودة تعززان هرمونات السعادة وتدعم نشاطك وحيويتك.'
    whyEn = 'The sweetness and cool icy blend boost happiness hormones and keep your energy high.'
  } else if (
    lowerText.includes('tired') ||
    lowerText.includes('متعب') ||
    lowerText.includes('😴') ||
    lowerText.includes('طاقة') ||
    lowerText.includes('energy')
  ) {
    moodAr = 'متعب ويحتاج طاقة'
    moodEn = 'Tired & Needs Energy'
    matchedDrink =
      menuDrinks.find(
        d =>
          (d.nameEn?.toLowerCase() ?? '').includes('espresso') ||
          (d.nameEn?.toLowerCase() ?? '').includes('cappuccino'),
      ) || menuDrinks[0]
    whyAr = 'جرعة عالية من الكافيين كفيلة بإعادة النشاط وتنبيه الحواس المتعبة.'
    whyEn =
      'A concentrated dose of caffeine is perfect to restart your system and wake up tired senses.'
  } else if (
    lowerText.includes('calm') ||
    lowerText.includes('هادئ') ||
    lowerText.includes('😌') ||
    lowerText.includes('روقان')
  ) {
    moodAr = 'هادئ ومسترخي'
    moodEn = 'Calm & Relaxed'
    matchedDrink =
      menuDrinks.find(
        d => (d.nameEn?.toLowerCase() ?? '').includes('tea') || (d.nameEn?.toLowerCase() ?? '').includes('matcha'),
      ) || menuDrinks[0]
    whyAr = 'تساعد المكونات الهادئة في تقليل التوتر وزيادة الاسترخاء.'
    whyEn = 'Sip slowly to lower stress and enhance peaceful relaxation.'
  }

  return {
    moodNameAr: moodAr,
    moodNameEn: moodEn,
    suitableDrinkAr: matchedDrink?.nameAr || 'لاتيه',
    suitableDrinkEn: matchedDrink?.nameEn || 'Latte',
    drinkId: matchedDrink?.id,
    drinkDescriptionAr: matchedDrink?.description || 'مشروب دافئ ومتوازن.',
    drinkDescriptionEn: matchedDrink?.description || 'A warm and balanced beverage.',
    energyLevel: lowerText.includes('tired') ? 95 : 65,
    sweetnessLevel: lowerText.includes('happy') ? 85 : 40,
    whyMatchesAr: whyAr || 'مشروب متوازن يناسب حالتك الحالية تماماً.',
    whyMatchesEn: whyEn || 'A balanced drink that perfectly fits your current state.',
    foodPairingAr: pairingAr,
    foodPairingEn: pairingEn,
  }
}

export async function saveFeedbackAction(analysisId: string, isAppropriate: boolean) {
  try {
    const analysis = await db.analysis.findUnique({
      where: { id: analysisId },
      select: { cafeId: true },
    })
    if (!analysis) {
      throw new Error('Analysis not found')
    }
    await validateKioskSession(analysis.cafeId)

    const updated = await db.analysis.update({
      where: { id: analysisId },
      data: { feedbackVal: isAppropriate },
    })
    return { success: true, updated }
  } catch (error: any) {
    const digest = `digest-${Math.random().toString(36).substr(2, 9)}`
    console.error(`[AI Kiosk Session Log] [Digest: ${digest}] ERROR in saveFeedbackAction Server Action:`, error.message || error)
    if (error.stack) {
      console.error(`[AI Kiosk Session Log] [Digest: ${digest}] STACK TRACE:`, error.stack)
    }
    const isSessionErr = ['SESSION_MISSING', 'SESSION_INVALID', 'SESSION_USED', 'SESSION_EXPIRED', 'SESSION_MISMATCH'].includes(error.message)
    return {
      success: false,
      code: isSessionErr ? error.message : 'FEEDBACK_FAILED',
      error: error.message || 'Feedback saving failed',
      digest,
    }
  }
}

export async function trackEventAction(cafeId: string, eventName: string) {
  try {
    await validateKioskSession(cafeId)

    const validEvents = [
      'SCAN_QR',
      'START_ANALYSIS',
      'COMPLETE_ANALYSIS',
      'CREATE_ORDER',
      'COMPLETE_ORDER',
    ] as const
    if (!validEvents.includes(eventName as (typeof validEvents)[number])) {
      throw new Error('Invalid event name / اسم فعالية غير صحيح')
    }

    const event = await db.event.create({
      data: {
        cafeId,
        name: eventName,
      },
    })
    return { success: true, event }
  } catch (error: any) {
    const digest = `digest-${Math.random().toString(36).substr(2, 9)}`
    console.error(`[AI Kiosk Session Log] [Digest: ${digest}] ERROR in trackEventAction Server Action:`, error.message || error)
    if (error.stack) {
      console.error(`[AI Kiosk Session Log] [Digest: ${digest}] STACK TRACE:`, error.stack)
    }
    const isSessionErr = ['SESSION_MISSING', 'SESSION_INVALID', 'SESSION_USED', 'SESSION_EXPIRED', 'SESSION_MISMATCH'].includes(error.message)
    return {
      success: false,
      code: isSessionErr ? error.message : 'TRACK_EVENT_FAILED',
      error: error.message || 'Event tracking failed',
      digest,
    }
  }
}
