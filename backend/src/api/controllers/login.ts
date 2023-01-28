import { Request, Response } from 'express'
import {
  writeJsonResponse,
  writeResponse500,
  writeResponseError,
} from '@root/utils/api/expressHelpers'
import { getUser } from '@root/db/actions/userActions'
import { isNullOrEmpty } from '@root/utils/common'
import { compareWithHash } from '@root/utils/common'
import { createAuthToken } from '@root/utils/auth'
import { ErrorModel, isErrorModel } from '@root/models/errorModel'
import { isUserModel } from '@root/models/userModel'

export type LoginUserResponse =
  | ErrorModel
  | { token: string; userId: string; expireAt: Date }

//TODO: refactor to move logic to action

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body

  if (isNullOrEmpty(email) || isNullOrEmpty(password)) {
    writeResponseError(res, 400, 'bad_request', 'Missing email or password')
    return
  }

  const getUserResult = await getUser(email)
  if (isErrorModel(getUserResult)) {
    writeResponseError(
      res,
      401,
      'invalid_credentials',
      'Invalid email/password'
    )
    return
  }

  if (!isUserModel(getUserResult)) {
    writeResponse500(res)
    return
  }

  const passwordMatch = await compareWithHash(password, getUserResult.password)

  if (!passwordMatch) {
    writeResponseError(
      res,
      401,
      'invalid_credentials',
      'Invalid email/password'
    )
    return
  }

  try {
    const token = await createAuthToken(getUserResult.id, email)
    const tokenExpiresDate = token.expireAt.toISOString()
    writeJsonResponse(
      res,
      200,
      {
        userId: getUserResult.id,
        token: token.token,
        expireAt: tokenExpiresDate,
      },
      { 'X-Expires-After': tokenExpiresDate }
    )
    return
  } catch (error) {
    writeResponse500(res)
  }
}
