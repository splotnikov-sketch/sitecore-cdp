import { PrismaClient } from '@prisma/client'
import { getHash } from '@root/utils/common'
import logger from '@root/utils/logger'

class DbContext {
  private static _instance: DbContext
  private _prismaClient?: PrismaClient

  static getInstance(): DbContext {
    if (!DbContext._instance) {
      DbContext._instance = new DbContext()
    }

    return DbContext._instance
  }

  public async connect(): Promise<void> {
    try {
      this._prismaClient = new PrismaClient()
      this.useUserMiddleware(this._prismaClient)
      await this._prismaClient.$connect()
    } catch (error) {
      logger.error(`db.open: ${error}`)
      throw error
    }
  }

  public db(): PrismaClient {
    if (this._prismaClient == null) {
      const error = `db has to be opened first`
      logger.error(error)
      throw error
    }
    return this._prismaClient
  }

  private useUserMiddleware(prismaClient: PrismaClient): void {
    prismaClient.$use(async (params: any, next: any) => {
      if (
        params.model === 'User' &&
        (params.action === 'create' || params.action === 'update') &&
        params.args.data
      ) {
        if (params.args.data.password) {
          const hash = await getHash(params.args.data.password)
          return next({
            ...params,
            args: {
              data: {
                ...params.args.data,
                password: hash,
              },
            },
          })
        }
      }
      return next(params)
    })
  }

  public disconnect() {
    if (this._prismaClient == null) {
      const error = `db has to be opened first`
      logger.error(error)
      throw error
    }
    return this._prismaClient.$disconnect()
  }
}

export default DbContext.getInstance()
