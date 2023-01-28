import dotenv from 'dotenv'
dotenv.config({ path: `./config/.env.${process.env.NODE_ENV}` })

// Define log levels type (silent + Winston default npm)
type LogLevel =
  | 'silent'
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly'

interface IConfig {
  port: number
  apiKey: string

  morganLogger: boolean
  morganBodyLogger: boolean
  devLogger: boolean
  loggerLevel: LogLevel

  databaseUrl: string

  privateKeyFile: string

  privateKeyPassphrase: string

  publicKeyFile: string

  localCacheTtl: number
  redisUrl: string

  yelp: {
    uri: string
    key: string
  }

  geoapify: {
    uri: string
    key: string
  }

  cdp: {
    uri: string
    browserUri: string
    key: string
    secret: string
    pointOfSale: string
    providerId: string
    offerTemplate: string
  }
}

const config: IConfig = {
  port: Number(process.env.PORT) || 3000,
  apiKey: process.env.API_KEY || 'API_KEY is not defined',

  morganLogger: process.env.MORGAN_LOGGER === 'true',
  morganBodyLogger: process.env.MORGAN_BODY_LOGGER === 'true',
  devLogger: process.env.DEV_LOGGER === 'true',
  loggerLevel: (process.env.LOGGER_LEVEL as LogLevel) || 'silent',

  databaseUrl: process.env.DATABASE_URL || 'DATABASE_URL is not defined',

  privateKeyFile:
    process.env.PRIVATE_KEY_FILE || 'PRIVATE_KEY_FILE is not defined',

  privateKeyPassphrase:
    process.env.PRIVATE_KEY_PASSPHRASE ||
    'PRIVATE_KEY_PASSPHRASE is not defined',

  publicKeyFile:
    process.env.PUBLIC_KEY_FILE || 'PUBLIC_KEY_FILE is not defined',

  localCacheTtl: Number(process.env.LOCAL_CACHE_TTL) || 60,
  redisUrl: process.env.REDIS_URL || 'REDIS_URL is not defined',

  yelp: {
    uri: process.env.YELP_URI || 'YELP_URI is not defined',
    key: process.env.YELP_KEY || 'YELP_KEY is not defined',
  },

  geoapify: {
    uri: process.env.GEOAPIFY_URI || 'GEOAPIFY_URI is not defined',
    key: process.env.GEOAPIFY_KEY || 'GEOAPIFY_KEY is not defined',
  },

  cdp: {
    uri: process.env.CDP_URI || 'CDP_URI is not defined',
    browserUri:
      process.env.CDP_BROWSER_API_URI || 'CDP_BROWSER_API_URI is not defined',
    key: process.env.CDP_API_KEY_ID || 'CDP_API_KEY_ID is not defined',
    secret: process.env.CDP_API_SECRET || 'CDP_API_SECRET is not defined',
    pointOfSale:
      process.env.CDP_POINT_OF_SALE || 'CDP_POINT_OF_SALE is not defined',
    providerId: process.env.CDP_ID_PROVIDER || 'CDP_ID_PROVIDER is not defined',
    offerTemplate:
      process.env.CDP_OFFER_TEMPLATE || 'CDP_OFFER_TEMPLATE is not defined',
  },
}

console.log('config ==> ', config)

export default config
