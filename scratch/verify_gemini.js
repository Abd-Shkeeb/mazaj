const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

async function run() {
  const apiKey = process.env.GEMINI_API_KEY
  console.log('--- GEMINI CONNECTION AUDIT ---')
  console.log('API Key configured:', apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO')

  if (!apiKey) {
    console.log('Result: API Key is missing or empty. Live Gemini AI cannot connect.')
    return
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const testMoods = [
      'أشعر بالسعادة.',
      'أشعر بالتوتر.',
      'أشعر بالنعاس.',
      'أحتاج إلى طاقة.',
      'أريد شيئاً هادئاً.',
    ]

    for (const mood of testMoods) {
      console.log(`\nTesting mood: "${mood}"`)
      const response = await model.generateContent(
        `Recommend a drink mood response for: "${mood}". Return simple JSON format containing moodNameAr, moodNameEn, suitableDrinkAr, suitableDrinkEn.`,
      )
      console.log('Response text:', response.response.text())
    }

    console.log('\nAudit Result: SUCCESSFUL Live AI generation.')
  } catch (error) {
    console.error('Audit Result: FAILED connection to Gemini API.', error)
  }
}

run()
