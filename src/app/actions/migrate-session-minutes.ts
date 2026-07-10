import db from '../../lib/db'

async function main() {
  console.log('Starting migration to update kioskSessionMinutes...')
  const result = await db.cafe.updateMany({
    where: {
      kioskSessionMinutes: 45
    },
    data: {
      kioskSessionMinutes: 15
    }
  })
  console.log(`Migration completed. Updated ${result.count} cafes from 45 to 15 minutes.`)
}

main()
  .catch((e) => {
    console.error('Error running migration script:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
