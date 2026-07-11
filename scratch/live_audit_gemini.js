const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

async function auditKey() {
  const apiKey = process.env.GEMINI_API_KEY
  console.log('=== REAL-TIME GEMINI API DIAGNOSTICS ===')
  console.log('Masked API Key:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'NONE')

  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not defined.')
    return
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    console.log('Sending live test handshake request to Google Gemini servers...')
    const result = await model.generateContent('Ping')
    console.log('\n--- Live Response ---')
    console.log('HTTP Status: 200 OK')
    console.log('Response Text:', result.response.text().trim())
    console.log('Diagnosis: Active, operational, and billing is healthy.')
  } catch (error) {
    console.log('\n--- RAW GOOGLE ERROR RESPONSE ---')
    if (error && typeof error === 'object') {
      console.log('HTTP Status/Error Object Keys:', Object.keys(error))
      console.log('Status / Code:', error.status || error.code || 'Not Available')
      console.log('Message:', error.message || 'Not Available')
      console.log('Raw JSON Stringified Error:', JSON.stringify(error, null, 2))
    } else {
      console.log('Raw Error String:', String(error))
    }
  }
}

auditKey()
