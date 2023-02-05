import axios from 'axios'
import { Request, Response } from 'express'
import { object, SchemaOf, string, number, ValidationError } from 'yup'
import {
  writeJsonResponse,
  writeResponse500,
  writeResponseError,
  writeResponse404,
} from '@root/utils/api/expressHelpers'

import config from '@root/config'
import { getCacheProvider } from '@root/utils/cache/utils'
import logger from '@root/utils/logger'
import { getById } from '@root/actions/businessActions'
import { isErrorModel } from '@root/models/errorModel'

const cacheProvider = getCacheProvider()

interface IBusinessSearchRequest {
  longitude: number
  latitude: number
  term: string
  radius?: number | null
  offset?: number | null
  limit?: number | null
}

const businessSearchSchema: SchemaOf<IBusinessSearchRequest> = object({
  longitude: number().required('longitude is required'),
  latitude: number().required('latitude is required'),
  term: string().required('search term is required'),
  radius: number().default(40000).nullable().notRequired(),
  offset: number().default(1).nullable().notRequired(),
  limit: number().default(50).nullable().notRequired(),
})

const yelp = axios.create({
  baseURL: config.yelp.uri,
  timeout: 1000,
  headers: { Authorization: `Bearer ${config.yelp.key}` },
})

export async function businessSearch(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const businessSearchRequest = req.body

    const validated: IBusinessSearchRequest =
      await businessSearchSchema.validate(businessSearchRequest)

    const key = JSON.stringify(validated)

    try {
      const cacheResult = await cacheProvider.get(key)
      if (cacheResult) {
        const result = JSON.parse(cacheResult)
        writeJsonResponse(res, 200, result)
        return
      }
    } catch (error) {
      logger.warn(`businessSearch.cache.get: ${error}`)
    }

    const response = await yelp.get('/businesses/search', {
      params: validated,
    })

    if (response.status === 200) {
      const { data } = response

      const result = data.businesses.map((x: any, index: number) => ({
        id: x.id,
        index: index,
        name: x.name,
        distance_meters: x.distance,
        distance_km: x.distance / 1000,
        distance_miles: x.distance / 1609.344,
        location: {
          zip_code: x.location.zip_code,
          state: x.location.state,
          city: x.location.city,
          address1: x.location.address1,
          address2: x.location.address2,
        },
        url: x.url,
        image_url: x.image_url,
        review_count: x.review_count,
        price: x.price,
        rating: x.rating,
        categories: x.categories,
        transactions: x.transactions,
        phone: x.phone,
        is_closed: x.is_closed,
      }))

      const mins15inSec = 60 * 15
      await cacheProvider.set(key, JSON.stringify(result), mins15inSec)

      writeJsonResponse(res, 200, result)

      return
    }

    writeResponse500(res)
  } catch (error) {
    if (error instanceof ValidationError) {
      writeResponseError(res, 400, 'validation_error', error.errors.join(', '))
      return
    }

    logger.error(`businessSearch error: ${error}`)
    writeResponse500(res)
  }
}

export async function getBusinessById(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id
  const result = await getById(id)
  if (isErrorModel(result)) {
    logger.error(`getBusinessById error: ${result.error}`)
    writeResponse500(res)
    return
  }

  writeJsonResponse(res, 200, result)
}
