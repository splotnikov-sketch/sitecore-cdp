import * as express from 'express'
import {
  writeJsonResponse,
  writeResponse401,
  writeResponse500,
} from '@root/utils/api/expressHelpers'
import logger from '@root/utils/logger'
import { insertUser } from '@root/actions/userActions'
import { getAllReviewsByUser, insertReview } from '@root/actions/reviewActions'
import { isNullOrEmpty } from '@root/utils/common'
import { isErrorModel } from '@root/models/errorModel'
import { isReviewModel, isUserModel } from '@root/models/prismaModels'
import { isAuthRequest } from '../middleware/IAuthRequest'

export function createUser(req: express.Request, res: express.Response): void {
  const { email, password } = req.body
  if (isNullOrEmpty(email) || isNullOrEmpty(password)) {
    writeJsonResponse(res, 400, {
      error: {
        type: 'bad_request',
        message: 'Missing email or password',
      },
    })
  }

  insertUser(email, password)
    .then((result) => {
      if (isErrorModel(result)) {
        if (result.error.type === 'account_already_exists') {
          writeJsonResponse(res, 409, result)
          return
        } else {
          throw new Error(`unsupported ${result}`)
        }
      }

      if (!isUserModel(result)) {
        writeResponse500(res)
        return
      }

      writeJsonResponse(res, 201, { userId: result.id })

      return
    })
    .catch((error: any) => {
      logger.error(`createUser: ${error}`)
      writeResponse500(res)
      return
    })
}

export async function addReview(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    if (!isAuthRequest(req)) {
      writeResponse401(res)
      return
    }

    const { externalId, content } = req.body

    const review = await insertReview(req.userId, externalId, content)

    if (!isReviewModel(review)) {
      writeResponse500(res)
      return
    }

    writeJsonResponse(res, 201, { reviewId: review.id })

    return
  } catch (error) {
    logger.error(`addReview error: ${error}`)
    writeResponse500(res)
  }
}

export async function getReviews(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    if (!isAuthRequest(req)) {
      writeResponse401(res)
      return
    }

    const reviews = await getAllReviewsByUser(req.userId)

    writeJsonResponse(res, 200, { reviews: reviews })
  } catch (error) {
    logger.error(`getReviews error: ${error}`)
    writeResponse500(res)
  }
}
