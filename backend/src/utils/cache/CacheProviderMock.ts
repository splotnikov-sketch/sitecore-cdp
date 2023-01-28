import * as redis from 'redis-mock'
import { ICacheProvider } from './ICacheProvider'
import logger from '@root/utils/logger'

export class CacheProviderMock implements ICacheProvider {
  private static _instance: CacheProviderMock
  private _client
  private _initialConnection: boolean

  private constructor() {
    this._initialConnection = true
    this._client = redis.createClient()

    this._client.on('connect', () => {
      logger.info('Connected to Redis mock')
    })

    this._client.on('ready', () => {
      if (this._initialConnection) {
        this._initialConnection = false
      }
      logger.info('Redis mock: ready')
    })

    this._client.on('error', (error: Error) => {
      logger.error(error.message)
    })

    this._client.on('end', () => {
      logger.info('Redis mock client connection ended')
    })
  }

  public static get instance(): CacheProviderMock {
    if (!CacheProviderMock._instance) {
      CacheProviderMock._instance = new CacheProviderMock()
    }
    return CacheProviderMock._instance
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._client.on('ready', () => {
        logger.info('Redis mock: ready')
        resolve()
      })
      this._client.on('error', (error) => {
        logger.error(error.message)
        reject()
      })
    })
  }

  public async get(key: string): Promise<string | undefined | null> {
    return new Promise((resolve, reject) => {
      this._client.get(key, (error, value) => {
        if (error) {
          reject(error)
        } else {
          resolve(value)
        }
      })
    })
  }

  public async set(
    key: string,
    value: string,
    expireAfter: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this._client.set(key, value, 'EX', expireAfter, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this._client.end(true)
      resolve()
    })
  }
}
