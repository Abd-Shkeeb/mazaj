const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
console.log('prisma.event is:', prisma.event)
process.exit(0)
