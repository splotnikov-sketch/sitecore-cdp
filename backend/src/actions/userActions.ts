import logger from '@root/utils/logger'
import { isNullOrEmpty } from '@root/utils/common'
import dbContext from '@root/db/dbContext'
import cacheLocal from '@root/utils/cache/CacheLocal'
import { ErrorModel } from '@root/models/errorModel'
import { UserModel } from '@root/models/prismaModels'
import { object, string } from 'yup'

const userSchema = object().shape({
  email: string().required('email is required').email('must be a valid email'),
  password: string()
    .required('password is required')
    .min(6, 'password must be at least 6 characters long'),
})

export async function insertUser(
  email: string,
  password: string
): Promise<UserModel | ErrorModel> {
  const user = {
    email,
    password,
  }

  return new Promise((resolve, reject) => {
    userSchema
      .validate(user)
      .then((validUser) => {
        dbContext
          .db()
          .user.create({ data: validUser })
          .then((createdUser: UserModel) => {
            resolve(createdUser)
          })
          .catch((error: any) => {
            if (error.code === 'P2002') {
              resolve({
                error: {
                  type: 'account_already_exists',
                  message: `${email} already exists`,
                },
              })
            } else {
              logger.error(`createUser prisma error: ${error}`)
              reject(error)
            }
          })
      })
      .catch((error) => {
        logger.error(`createUser validation error: ${error}`)
        const errorMessage = `${
          !isNullOrEmpty(error.errors) ? error.errors : ''
        }`
        resolve({
          error: {
            type: 'account_invalid',
            message: errorMessage,
          },
        })
      })
  })
}

export async function getUser(email: string): Promise<UserModel | ErrorModel> {
  return new Promise((resolve, reject) => {
    let user = cacheLocal.get<UserModel>(email)

    if (user) {
      resolve(user)
      return
    }

    dbContext
      .db()
      .user.findUnique({
        where: {
          email: email,
        },
      })
      .then((user: any) => {
        if (user == null) {
          resolve({
            error: {
              type: 'user_not_found',
              message: `User with email ${email} not found`,
            },
          })
        } else {
          cacheLocal.set(email, user)
          resolve(user)
        }
      })
      .catch((error: any) => {
        logger.error(error)
        resolve({
          error: {
            type: 'internal_server_error',
            message: 'Internal Server Error',
          },
        })
      })
  })
}
