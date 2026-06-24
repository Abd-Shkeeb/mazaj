// Clear Database Except Super Admin

/**
 * This script deletes all records from the database except the Super Admin user.
 * It uses Prisma Client to perform deletions. Adjust the `SUPER_ADMIN_EMAIL`
 * constant if your Super Admin is identified by another unique field (e.g., name or id).
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Update this to match the unique identifier of your Super Admin account.
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com'

async function main() {
  // Find the Super Admin user
  const superAdmin = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  })

  if (!superAdmin) {
    console.error('⚠️ Super Admin user not found. Ensure the email is correct and the user exists.')
    process.exit(1)
  }

  console.log(`✅ Super Admin (${SUPER_ADMIN_EMAIL}) retained with id ${superAdmin.id}`)

  // List of tables to clear. Exclude the `User` table because we keep one record.
  const tables = [
    'session',
    'event',
    'analysis',
    // add other tables here as needed
  ]

  // Delete records from each table
  for (const table of tables) {
    // Dynamically access the Prisma delegate
    // @ts-ignore – Prisma client types are generated at runtime
    const delegate: any = (prisma as any)[table]
    if (delegate && typeof delegate.deleteMany === 'function') {
      const result = await delegate.deleteMany()
      console.log(`🗑️ Deleted ${result.count} rows from ${table}`)
    } else {
      console.warn(`⚠️ No deleteMany method for ${table}, skipping.`)
    }
  }

  // Delete all users except the Super Admin
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { not: superAdmin.id } },
  })
  console.log(`🗑️ Deleted ${deletedUsers.count} non‑admin users`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
