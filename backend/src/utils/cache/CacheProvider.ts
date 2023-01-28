import * as redis from 'redis'
import { ICacheProvider } from '@root/utils/cache/ICacheProvider'

import config from '@root/config'
import logger from '@root/utils/logger'

export class CacheProvider implements ICacheProvider {
  private static _instance: CacheProvider
  private _client
  private _initialConnection: boolean

  private constructor(options: redis.RedisClientOptions) {
    this._initialConnection = true

    this._client = redis.createClient(options)

    this._client.on('error', (err) => {
      logger.error(`Error: ${err}`)
    })

    this._client.on('connect', () => {
      logger.info('Connected to Redis')
    })

    this._client.on('ready', () => {
      if (this._initialConnection) {
        this._initialConnection = false
      }
      logger.info('Redis: ready')
    })

    this._client.on('reconnecting', () => {
      logger.info('Redis: reconnecting')
    })

    this._client.on('end', () => {
      logger.info('Redis: end')
    })

    this._client.on('disconnected', () => {
      logger.error('Redis: disconnected')
    })
  }

  public static get instance(): CacheProvider {
    if (!CacheProvider._instance) {
      CacheProvider._instance = new CacheProvider({ url: config.redisUrl })
    }
    return CacheProvider._instance
  }

  public async connect(): Promise<void> {
    return this._client.connect()
  }

  public async get(key: string): Promise<string | undefined | null> {
    return new Promise((resolve, reject) => {
      this._client
        .get(key)
        .then((value) => {
          logger.info(`value with key ${key} is in cache`)
          resolve(value)
        })
        .catch((error) => {
          logger.info(`cache.get error: ${error}`)
          resolve(null)
        })
    })
  }

  public async set(
    key: string,
    value: string,
    expireAfter: number
  ): Promise<void> {
    if (expireAfter === -1) {
      return new Promise((resolve, reject) => {
        this._client
          .set(key, value)
          .then(() => resolve())
          .catch((error) => {
            logger.error(`cache.set error: ${error}`)
            reject(error)
          })
      })
    }

    return new Promise((resolve, reject) => {
      this._client
        .setEx(key, expireAfter, value)
        .then(() => resolve())
        .catch((error) => {
          logger.error(`cache.set error: ${error}`)
          reject(error)
        })
    })
  }

  public async close(): Promise<void> {
    return this._client.quit()
  }
}
