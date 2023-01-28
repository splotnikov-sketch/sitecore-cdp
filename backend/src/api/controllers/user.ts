import * as express from 'express'
import {
  writeJsonResponse,
  writeResponse500,
} from '@root/utils/api/expressHelpers'
import logger from '@root/utils/logger'
import { insertUser } from '@root/db/actions/userActions'
import { isNullOrEmpty } from '@root/utils/common'
import { isErrorModel } from '@root/models/errorModel'
import { isUserModel } from '@root/models/userModel'

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
