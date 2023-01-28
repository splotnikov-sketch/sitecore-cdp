import { NextFunction, Request, RequestHandler, Response } from 'express'
import logger from '@root/utils/logger'
import { isNullOrEmpty } from '@root/utils/common'
import { writeResponse401 } from '@root/utils/api/expressHelpers'
import { verifyAuthToken, isAuthSuccess } from '@root/utils/auth'
import { IAuthRequest } from '@root/api/middleware/IAuthRequest'

export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    isNullOrEmpty(req) ||
    isNullOrEmpty(req.headers) ||
    isNullOrEmpty(req.headers.authorization)
  ) {
    writeResponse401(res)
    return
  }

  const bearerToken = req.headers.authorization ?? ''
  const token = bearerToken.replace('Bearer ', '')

  try {
    const authResult = await verifyAuthToken(token)

    if (!isAuthSuccess(authResult)) {
      writeResponse401(res)
      next(authResult)
    } else {
      ;(req as IAuthRequest).userId = authResult.userId
      ;(req as IAuthRequest).email = authResult.email
    }

    next()
    return
  } catch (error) {
    logger.error(`exception in authMiddleware: ${error}`)
    next(error)
  }
}
