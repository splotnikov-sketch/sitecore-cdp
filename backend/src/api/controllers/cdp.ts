import { Request, Response } from 'express'
import config from '@root/config'
import axios from 'axios'
import {
  writeJsonResponse,
  writeResponse500,
  writeResponse401,
} from '@root/utils/api/expressHelpers'

import logger from '@root/utils/logger'
import { isNullOrEmpty } from '@root/utils/common'
import { IAuthRequest, isAuthRequest } from '@root/api/middleware/IAuthRequest'

const CREATE_EVENT_URL = `/event/create.json?client_key=${config.cdp.key}`
const DEFAULT_CURRENCY = 'USD'
const DEFAULT_LANGUAGE = 'EN'

const cdp_browser = axios.create({
  baseURL: config.cdp.browserUri,
  timeout: 1000,
})

const cdp_rest = axios.create({
  baseURL: config.cdp.uri,
  timeout: 1000,
})

export async function getBrowserId(req: Request, res: Response): Promise<void> {
  try {
    const url = `/browser/create.json?client_key=${config.cdp.key}&message={}`
    const response = await cdp_browser.get(url)
    const { data } = response

    const result = {
      browser_id: data.ref,
    }

    writeJsonResponse(res, 200, result)
  } catch (error) {
    logger.error(`getBrowserId: ${error}`)
    writeResponse500(res)
  }
}

async function createEvent(res: Response, event: any) {
  const url = CREATE_EVENT_URL + `&message=${JSON.stringify(event)}`

  const response = await cdp_browser.get(url)
  const result = { ref: response.data.ref }

  writeJsonResponse(res, 201, result)
}

export async function createViewEvent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      channel,
      browser_id,
      page,
      platform,
      device,
      currency,
      language,
      ext,
    } = req.body

    const event: any = {
      browser_id,
      channel,
      pos: config.cdp.pointOfSale,
      type: 'VIEW',
      page,
      currency: !isNullOrEmpty(currency) ? currency : DEFAULT_CURRENCY,
      language: !isNullOrEmpty(language) ? language : DEFAULT_LANGUAGE,
      ext: {
        platform,
        device,
        ...ext,
      },
    }

    logger.info('view event', event)

    createEvent(res, event)

    return
  } catch (error) {
    logger.error(`createViewEvent error: ${error}`)
    writeResponse500(res)
  }
}

export async function createSearchEvent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      channel,
      browser_id,
      page,
      platform,
      device,
      lat,
      lon,
      cityState,
      term,
      currency,
      language,
      ext,
    } = req.body

    const event = {
      browser_id,
      page,
      channel,
      pos: config.cdp.pointOfSale,
      type: 'SEARCH',
      currency: !isNullOrEmpty(currency) ? currency : DEFAULT_CURRENCY,
      language: !isNullOrEmpty(language) ? language : DEFAULT_LANGUAGE,
      product_type: 'BUSINESS',
      ext: {
        platform,
        device,
        latitude: lat,
        longitude: lon,
        place: cityState,
        ...ext,
      },
      product_name: term,
    }

    createEvent(res, event)

    return
  } catch (error) {
    logger.error(`createSearchEvent error: ${error}`)
    writeResponse500(res)
  }
}

export async function createIdentityEvent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!isAuthRequest(req)) {
      writeResponse401(res)
      return
    }

    const {
      channel,
      browser_id,
      page,
      platform,
      device,
      currency,
      language,
      ext,
    } = req.body

    const event = {
      channel,
      type: 'IDENTITY',
      browser_id,
      currency: !isNullOrEmpty(currency) ? currency : DEFAULT_CURRENCY,
      language: !isNullOrEmpty(language) ? language : DEFAULT_LANGUAGE,
      pos: config.cdp.pointOfSale,
      email: req.email,
      page,
      identifiers: [
        {
          provider: config.cdp.providerId,
          id: req.email,
        },
      ],
      ext: {
        platform,
        device,
        ...ext,
      },
    }

    createEvent(res, event)

    return
  } catch (error) {
    logger.error(`createIdentityEvent error: ${error}`)
    writeResponse500(res)
  }
}

export async function getOffers(req: Request, res: Response): Promise<void> {
  try {
    if (!isAuthRequest(req)) {
      writeResponse401(res)
      return
    }

    const { channel } = req.body
    const url = `/callFlows`

    const request = {
      channel,
      pointOfSale: config.cdp.pointOfSale,
      identifiers: {
        provider: config.cdp.providerId,
        id: req.email,
      },
      clientKey: config.cdp.key,
      friendlyId: config.cdp.offerTemplate,
    }

    const response = await cdp_rest.post(url, request)

    if (isNullOrEmpty(response) || response.status !== 200) {
      writeJsonResponse(res, 200, [])
      return
    }

    if (
      isNullOrEmpty(response.data) ||
      isNullOrEmpty(response.data.decisionOffers)
    ) {
      writeJsonResponse(res, 200, [])
      return
    }

    const result = response.data.decisionOffers
      .filter((x: any) => x.status === 'ACTIVE')
      .map((x: any) => ({
        title: x.attributes.Title,
        text: x.attributes.Text,
      }))

    writeJsonResponse(res, 200, result)
  } catch (error) {
    logger.error(`killSession error: ${error}`)
    writeResponse500(res)
  }
}

export async function killSession(req: Request, res: Response): Promise<void> {
  try {
    const { channel, browser_id, currency, language } = req.body

    const event = {
      browser_id,
      channel,
      pos: config.cdp.pointOfSale,
      type: 'FORCE_CLOSE',
      currency: !isNullOrEmpty(currency) ? currency : DEFAULT_CURRENCY,
      language: !isNullOrEmpty(language) ? language : DEFAULT_LANGUAGE,
    }

    createEvent(res, event)

    return
  } catch (error) {
    logger.error(`killSession error: ${error}`)
    writeResponse500(res)
  }
}
