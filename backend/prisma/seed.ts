import config from '../src/config'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log(`database url: ${config.databaseUrl}`)

  const mexican = await prisma.category.upsert({
    where: { name: 'mexican' },
    update: {},
    create: {
      name: 'mexican',
      terms: {
        create: [
          {
            name: 'quesadilla',
          },
          {
            name: 'tamales',
          },
          {
            name: 'burritos',
          },
          {
            name: 'tacos',
          },
          {
            name: 'mexican',
          },
        ],
      },
    },
  })

  const italian = await prisma.category.upsert({
    where: { name: 'italian' },
    update: {},
    create: {
      name: 'italian',
      terms: {
        create: [
          {
            name: 'pizza',
          },
          {
            name: 'pasta',
          },
          {
            name: 'burritos',
          },
          {
            name: 'lasagna',
          },
          {
            name: 'italian',
          },
        ],
      },
    },
  })

  console.log({ mexican, italian })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
