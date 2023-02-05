import axios from 'axios'
import config from '@root/config'
import { getCacheProvider } from '@root/utils/cache/utils'
import logger from '@root/utils/logger'
import { ErrorModel } from '@root/models/errorModel'

const cacheProvider = getCacheProvider()

export interface IBusinessDetail {
  id: string
  alias: string
  name: string
  image_url: string
  is_closed: boolean
  url: string
  phone: string
  display_phone: string
  review_count: number
  categories: {
    alias: string
    title: string
  }[]
  rating: number
  location: {
    address1: string
    address2: string
    address3: string
    city: string
    zip_code: string
    country: string
    state: string
    display_address: string[]
    coordinates: {
      latitude: number
      longitude: number
    }
    photos: string[]
    price: string
    hours: {
      open: {
        is_overnight: boolean
        start: string
        end: string
        day: number
      }[]
      hours_type: string
      is_open_now: boolean
    }[]
    transactions: string[]
  }
}

export function isIBusinessDetail(obj: unknown): obj is IBusinessDetail {
  if (obj !== null && typeof obj === 'object') {
    return 'id' in obj && 'categories' in obj && 'location' in obj
  }
  return false
}

const yelp = axios.create({
  baseURL: config.yelp.uri,
  timeout: 1000,
  headers: { Authorization: `Bearer ${config.yelp.key}` },
})

export async function getById(
  id: string
): Promise<IBusinessDetail | ErrorModel> {
  try {
    const cacheResult = await cacheProvider.get(id)
    if (cacheResult) {
      const result = JSON.parse(cacheResult)
      return result
    }
  } catch (error) {
    logger.warn(`businessActions::getById::cacheProvider.get: ${error}`)
  }

  try {
    const response = await yelp.get(`/businesses/${id}`)

    if (response.status === 200) {
      const {
        id,
        alias,
        name,
        image_url,
        is_closed,
        url,
        phone,
        display_phone,
        review_count,
        categories,
        rating,
        location: {
          address1,
          address2,
          address3,
          city,
          zip_code,
          country,
          state,
        },
        coordinates: { latitude, longitude },
        photos,
        price,
        hours,
        transactions,
      } = response.data || {}

      const result: IBusinessDetail = {
        id: id || '',
        alias: alias || '',
        name: name || '',
        image_url: image_url || '',
        is_closed: is_closed || false,
        url: url || '',
        phone: phone || '',
        display_phone: display_phone || '',
        review_count: review_count || 0,
        categories: categories || [],
        rating: rating || 0,
        location: {
          address1: address1 || '',
          address2: address2 || '',
          address3: address3 || '',
          city: city || '',
          zip_code: zip_code || '',
          country: country || '',
          state: state || '',
          display_address: [],
          coordinates: {
            latitude: latitude || 0,
            longitude: longitude || 0,
          },
          photos: photos || [],
          price: price || '',
          hours: hours || [],
          transactions: transactions || [],
        },
      }

      const mins15inSec = 60 * 15
      await cacheProvider.set(id, JSON.stringify(result), mins15inSec)

      return result
    }

    if (response.status === 404) {
      return {
        error: {
          type: 'external_api_call_error',
          message: 'not found',
        },
      }
    }

    return {
      error: {
        type: 'external_api_call_error',
        message: 'unknown error',
      },
    }
  } catch (error: any) {
    logger.error(`businessActions::getById error: ${error}`)
    return {
      error: {
        type: 'external_api_call_error',
        message: error,
      },
    }
  }
}
