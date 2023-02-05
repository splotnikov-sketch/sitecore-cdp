import { Request, Response } from 'express'

import {
  ISearchTerm,
  getCategory,
  isArrayOfSearchTerms,
} from '@root/actions/categoryActions'
import {
  writeJsonResponse,
  writeResponse500,
  writeResponse401,
} from '@root/utils/api/expressHelpers'

import logger from '@root/utils/logger'

export async function getPreferredCategory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { terms } = req.body
    logger.info(`terms --> ${JSON.stringify(terms)}`)
    if (!isArrayOfSearchTerms(terms)) {
      writeJsonResponse(res, 400, {
        error: {
          type: 'bad request',
          message: `Request has to have array of search terms`,
        },
      })
      return
    } else {
      const result = await getCategory(terms)

      writeJsonResponse(res, 200, result)
    }
  } catch (error) {
    logger.error(`getPreferredCategory error: ${error}`)
    writeResponse500(res)
  }
}
