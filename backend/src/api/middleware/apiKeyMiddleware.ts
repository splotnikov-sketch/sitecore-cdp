import { Request, RequestHandler, Response } from 'express'
import logger from '@root/utils/logger'
import { isNullOrEmpty } from '@root/utils/common'

import apiKeyValidator from '@root/api/services/apiKeyValidator'
import {
  writeResponse401,
  writeResponse500,
} from '@root/utils/api/expressHelpers'

export const apiKeyMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next
) => {
  if (
    isNullOrEmpty(req) ||
    isNullOrEmpty(req.headers) ||
    isNullOrEmpty(req.headers.authorization)
  ) {
    writeResponse401(res)
    return
  }

  const token = req.headers.authorization ?? ''

  apiKeyValidator
    .validate(token)
    .then((authResponse) => {
      if (isNullOrEmpty((authResponse as any).error)) {
        const apiKey = (authResponse as { apiKey: string }).apiKey
        res.locals.apiKey = apiKey
        next()
      } else {
        writeResponse401(res)
      }
    })
    .catch((err) => {
      logger.error(`Error at apiKeyMiddleware: ${err}`)
      writeResponse500(res)
    })
}
