import { verifyActiveSubscription } from '../src/lib/subscription'
import db from '../src/lib/db'

async function runTests() {
  console.log('=== STARTING SUBSCRIPTION E2E TESTS ===\n')

  // Create a clean dummy cafe for testing
  const tempCafeId = 'test-e2e-cafe-sub-id'
  const tempSlug = 'test-e2e-cafe-sub-slug'

  // Clean existing test data if any
  await db.$executeRawUnsafe(`DELETE FROM "Cafe" WHERE id = '${tempCafeId}'`)

  // Helper to setup test state
  async function setupCafe(data: any) {
    await db.$executeRawUnsafe(`
      INSERT INTO "Cafe" (
        "id", "slug", "nameAr", "nameEn", "trialEndsAt", "subscriptionEndsAt", "subscriptionPlan", "subscriptionStatus"
      ) VALUES (
        '${tempCafeId}', '${tempSlug}', 'تجريبي', 'Test', 
        '${data.trialEndsAt?.toISOString() || new Date().toISOString()}', 
        ${data.subscriptionEndsAt ? `'${data.subscriptionEndsAt.toISOString()}'` : 'NULL'}, 
        '${data.subscriptionPlan || 'FREE_TRIAL'}', 
        '${data.subscriptionStatus || 'ACTIVE'}'
      )
    `)
  }

  async function cleanCafe() {
    await db.$executeRawUnsafe(`DELETE FROM "Cafe" WHERE id = '${tempCafeId}'`)
  }

  // --- TEST CASES ---

  // Scenario 1: Expired Free Trial
  try {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    await setupCafe({ trialEndsAt: pastDate, subscriptionPlan: 'FREE_TRIAL', subscriptionStatus: 'ACTIVE' })
    const status = await verifyActiveSubscription(tempCafeId)
    if (status === 'EXPIRED') {
      console.log('Scenario 1 (Trial Expiry): PASS')
    } else {
      console.log(`Scenario 1 (Trial Expiry): FAIL (Got: ${status})`)
    }
  } catch (e: any) {
    console.log('Scenario 1 (Trial Expiry): FAIL with error:', e.message)
  } finally {
    await cleanCafe()
  }

  // Scenario 2: Expired Paid Subscription
  try {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    await setupCafe({ subscriptionEndsAt: pastDate, subscriptionPlan: 'LITE', subscriptionStatus: 'ACTIVE' })
    const status = await verifyActiveSubscription(tempCafeId)
    if (status === 'EXPIRED') {
      console.log('Scenario 2 (Paid Expiry): PASS')
    } else {
      console.log(`Scenario 2 (Paid Expiry): FAIL (Got: ${status})`)
    }
  } catch (e: any) {
    console.log('Scenario 2 (Paid Expiry): FAIL with error:', e.message)
  } finally {
    await cleanCafe()
  }

  // Scenario 3: Manually Suspended
  try {
    await setupCafe({ subscriptionPlan: 'PRO', subscriptionStatus: 'SUSPENDED', subscriptionEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) })
    const status = await verifyActiveSubscription(tempCafeId)
    if (status === 'SUSPENDED') {
      console.log('Scenario 3 (Manual Suspended): PASS')
    } else {
      console.log(`Scenario 3 (Manual Suspended): FAIL (Got: ${status})`)
    }
  } catch (e: any) {
    console.log('Scenario 3 (Manual Suspended): FAIL with error:', e.message)
  } finally {
    await cleanCafe()
  }

  // Scenario 4: Config Error (Missing subscriptionEndsAt for Paid Plan)
  try {
    await setupCafe({ subscriptionPlan: 'STANDARD', subscriptionStatus: 'ACTIVE', subscriptionEndsAt: null })
    const status = await verifyActiveSubscription(tempCafeId)
    if (status === 'CONFIG_ERROR') {
      console.log('Scenario 4 (Config Error - Missing ends date): PASS')
    } else {
      console.log(`Scenario 4 (Config Error - Missing ends date): FAIL (Got: ${status})`)
    }
  } catch (e: any) {
    console.log('Scenario 4 (Config Error): FAIL with error:', e.message)
  } finally {
    await cleanCafe()
  }

  // Scenario 5: Success Renewal / Reset
  try {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days future
    await setupCafe({ subscriptionPlan: 'PRO', subscriptionStatus: 'ACTIVE', subscriptionEndsAt: futureDate })
    const status = await verifyActiveSubscription(tempCafeId)
    if (status === 'ACTIVE') {
      console.log('Scenario 5 (Renewal / Active state): PASS')
    } else {
      console.log(`Scenario 5 (Renewal / Active state): FAIL (Got: ${status})`)
    }
  } catch (e: any) {
    console.log('Scenario 5 (Renewal): FAIL with error:', e.message)
  } finally {
    await cleanCafe()
  }

  console.log('\n=== TESTS COMPLETED ===')
}

runTests().catch(e => {
  console.error('Test script crashed:', e)
})
