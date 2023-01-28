import config from '@root/config'
import { ErrorModel } from '@root/models/errorModel'

export type AuthResponse = ErrorModel | { apiKey: string }

function validate(bearerToken: string): Promise<AuthResponse> {
  return new Promise(function (resolve, reject) {
    const token = bearerToken.replace('Bearer ', '')
    if (token === config.apiKey) {
      resolve({ apiKey: token })
    }

    resolve({
      error: {
        type: 'unauthorized',
        message: 'Authorization Failed',
      },
    })
  })
}

export default { validate }
