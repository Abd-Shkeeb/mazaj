import db from '../src/lib/db'

async function run() {
  try {
    const drinks = await db.drink.findMany({
      orderBy: { createdAt: 'asc' },
    })
    console.log(`Total drinks: ${drinks.length}`)
    drinks.forEach((d, idx) => {
      console.log(`${idx + 1}. [${d.id}] ${d.nameEn} / ${d.nameAr}
   - Category: ${d.category} | Price: ${d.price} | Available: ${d.isAvailable}
   - Caffeine: ${d.caffeine} | Energy: ${d.energy} | Sweetness: ${d.sweetness} | Temp: ${d.isHot ? 'Hot' : 'Cold'}
   - Description: ${d.description}`)
    })
  } catch (error) {
    console.error('Error fetching drinks:', error)
  } finally {
    await db.$disconnect()
  }
}

run()
