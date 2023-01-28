import * as express from 'express'
import HTTP from 'http-status-codes'
import logger from '@root/utils/logger'
import ERRORS from '@root/utils/errors/errors'

const genericErrors = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (res.headersSent) {
    return next(err)
  }
  const { path } = req

  logger.error(ERRORS.GENERIC_ERROR(path), err.message)
  res
    .status(HTTP.INTERNAL_SERVER_ERROR)
    .json({ error: err.message, errors: err.errors })
}

export default genericErrors
