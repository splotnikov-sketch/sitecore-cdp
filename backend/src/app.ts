import config from '@root/config'
import dbContext from '@root/db/dbContext'
import { createServer } from './utils/api/server'
import logger from '@root/utils/logger'
import { getCacheProvider } from '@root/utils/cache/utils'

const cacheProvider = getCacheProvider()

;(async () => {
  try {
    await cacheProvider.connect()
    await dbContext.connect()
    const server = await createServer()
    server.listen(config.port, () => {
      logger.info(`Listening on port ${config.port}`)
    })
  } catch (error) {
    logger.error(`Error while creating server: ${error}`)
  }
})()
