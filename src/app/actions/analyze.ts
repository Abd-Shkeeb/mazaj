'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import db from '@/lib/db'
import { Drink } from '@prisma/client'
import { headers } from 'next/headers'
import { isRateLimited } from '@/lib/rateLimit'
import { assertActiveSubscription, assertCanAnalyzeMood } from '@/lib/subscription'
import { getMenuDrinks } from '@/lib/drinkCache'

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
}

function getFallbackResult(moodInputText: string, menuDrinks: Partial<Drink>[]): AIResult {
  const drink = menuDrinks[Math.floor(Math.random() * menuDrinks.length)]
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
  }
}

export async function analyzeMood(formData: {
  moodKey?: string
  customText?: string
  cafeId: string
}) {
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

  // 1. Fetch available drinks using cached helper (select only needed fields)
  const menuDrinks = await getMenuDrinks(cafeId)

  const menuListString = menuDrinks
    .map(
      d =>
        `- ${d.nameEn} / ${d.nameAr} (ID: ${d.id}, Caffeine: ${d.caffeine}, Sweetness: ${d.sweetness}, Energy: ${d.energy}, Temp: ${d.isHot ? 'Hot' : 'Cold'}, Category: ${d.category})`,
    )
    .join('\n')

  let aiResult: AIResult

  // If there are no available drinks, return a result indicating none
  if (menuDrinks.length === 0) {
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
  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        },
      })

      const prompt = `
        You are an AI assistant installed in a cafe kiosk called "Mazaj".
        Your task is to analyze the user's mood and recommend ONE drink that fits them from the cafe's actual menu list below.
        
        Cafe's Available Menu:
        ${menuListString}
        
        Analyze the user's mood or description: "${moodInputText}".
        Select the best matching drink from the menu. You MUST output its exact database ID, nameAr, nameEn, description, and custom matching reasoning.
        
        Provide the result in JSON format only with the following structure:
        {
          "moodNameAr": "اسم المزاج المكتشف بالعربية",
          "moodNameEn": "Mood name in English",
          "suitableDrinkAr": "اسم المشروب بالعربية",
          "suitableDrinkEn": "Suitable Drink name in English",
          "drinkId": "The exact ID of the drink selected from the menu",
          "drinkDescriptionAr": "وصف المشروب بالعربية وتأثيره على المزاج",
          "drinkDescriptionEn": "Description of the drink and its mood effect in English",
          "energyLevel": 80,
          "sweetnessLevel": 60,
          "whyMatchesAr": "لماذا يناسب هذا المشروب المزاج المكتشف بالعربية",
          "whyMatchesEn": "Why this drink matches the mood in English",
          "foodPairingAr": "طعام مقترح مرافق للمشروب (مثل: دونات شوكولاتة، كوكيز)",
          "foodPairingEn": "Food pairing recommendation in English"
        }
      `

      const response = await model.generateContent(prompt)
      const text = response.response.text()
      aiResult = JSON.parse(text)
    } catch (error) {
      console.error('Gemini API Error, falling back to database matching:', error)
      aiResult = getFallbackResult(moodInputText, menuDrinks)
    }
  } else {
    aiResult = getFallbackResult(moodInputText, menuDrinks)
  }

  // Find or create matching mood in Database
  // Use indexed nameEn lookup first for speed, then fallback to nameAr
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
  // Fetch full details of the recommended drink to guarantee accurate ID, price and image
  let finalDrink = menuDrinks.find(d => d.id === aiResult.drinkId)
  if (!finalDrink && aiResult.suitableDrinkEn) {
    finalDrink = menuDrinks.find(
      d =>
        (d.nameEn && d.nameEn.toLowerCase().includes(aiResult.suitableDrinkEn.toLowerCase())) ||
        (d.nameAr && d.nameAr.includes(aiResult.suitableDrinkAr))
    )
  }
  // Fallback to first available drink if none matches
  if (!finalDrink && menuDrinks.length > 0) {
    finalDrink = menuDrinks[0]
  }

  if (finalDrink) {
    aiResult.drinkId = finalDrink.id
    aiResult.price = finalDrink.price
    aiResult.image = finalDrink.image || undefined
    // sync names safely
    aiResult.suitableDrinkAr = finalDrink.nameAr ?? ''
    aiResult.suitableDrinkEn = finalDrink.nameEn ?? ''
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
  return db.analysis.update({
    where: { id: analysisId },
    data: { feedbackVal: isAppropriate },
  })
}

export async function trackEventAction(cafeId: string, eventName: string) {
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

  return db.event.create({
    data: {
      cafeId,
      name: eventName,
    },
  })
}
