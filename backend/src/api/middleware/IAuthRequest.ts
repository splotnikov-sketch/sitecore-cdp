import { Request } from 'express'
import { isNullOrEmpty } from '@root/utils/common'

export interface IAuthRequest extends Request {
  userId: string
  email: string
}

export function isAuthRequest(req: Request): req is IAuthRequest {
  return (
    req !== null &&
    typeof req === 'object' &&
    'userId' in req &&
    'email' in req &&
    !isNullOrEmpty(req.userId)
  )
}
