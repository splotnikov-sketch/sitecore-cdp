import bcrypt from 'bcrypt'
import logger from '@root/utils/logger'

export function isNullOrEmpty(objectToCheck: any): boolean {
  return (
    objectToCheck === null ||
    objectToCheck === undefined ||
    objectToCheck === '' ||
    (Array.isArray(objectToCheck) && objectToCheck.length < 1) ||
    (typeof objectToCheck === 'object' &&
      Object.keys(objectToCheck).length === 0)
  )
}

export async function getHash(token: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(token, salt)

    return hash
  } catch (error: any) {
    logger.error(
      `Error while generating password hash by bcrypt. Error: ${error}`
    )
    throw error
  }
}

export async function compareWithHash(
  token: string,
  hash: string
): Promise<boolean> {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(token, hash, function (err: any, res: any) {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}
