import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const isDev = process.env.NODE_ENV !== 'production'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
  pool?: pg.Pool
}

// Connection pool: tuned for Supabase PgBouncer (transaction mode)
const pool =
  globalForPrisma.pool ||
  new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // max concurrent connections
    min: 2, // keep 2 warm connections
    idleTimeoutMillis: 30_000, // close idle connections after 30s
    connectionTimeoutMillis: 5_000, // fail fast if DB unreachable
  })

if (isDev) globalForPrisma.pool = pool

const adapter = new PrismaPg(pool)

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: isDev ? ['warn', 'error'] : ['error'],
  })

if (isDev) globalForPrisma.prisma = db

export default db
