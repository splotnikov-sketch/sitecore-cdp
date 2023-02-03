/* istanbul ignore file */

import express from 'express'
import logger from '@root/utils/logger'

export const devLoggerMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const startHrTime = process.hrtime()

  logger.http(
    `Request: ${req.method} ${
      req.url
    } at ${new Date().toUTCString()}, User-Agent: ${req.get('User-Agent')}`
  )
  // TODO: mask sensitive info
  logger.http(`Request Body: ${JSON.stringify(req.body)}`)

  const [oldWrite, oldEnd] = [res.write, res.end]
  const chunks: Buffer[] = []
  ;(res.write as unknown) = function (chunk: any): void {
    chunks.push(Buffer.from(chunk))
    ;(oldWrite as Function).apply(res, arguments)
  }

  res.end = function (chunk: any): any {
    if (chunk) {
      chunks.push(Buffer.from(chunk))
    }

    const elapsedHrTime = process.hrtime(startHrTime)
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6

    logger.http(`Response ${res.statusCode} ${elapsedTimeInMs.toFixed(3)} ms`)

    const body = Buffer.concat(chunks).toString('utf8')
    logger.http(`Response Body: ${body}`)
    ;(oldEnd as Function).apply(res, arguments)
  }

  next()
}
