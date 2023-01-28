import config from '@root/config'
import { ICacheProvider } from '@root/utils/cache/ICacheProvider'
import { CacheProvider } from '@root/utils/cache/CacheProvider'
import { CacheProviderMock } from '@root/utils/cache/CacheProviderMock'

export function getCacheProvider(): ICacheProvider {
  let cacheProvider: ICacheProvider
  if (config.redisUrl === 'redis-mock') {
    cacheProvider = CacheProviderMock.instance
  } else {
    cacheProvider = CacheProvider.instance
  }

  return cacheProvider
}
