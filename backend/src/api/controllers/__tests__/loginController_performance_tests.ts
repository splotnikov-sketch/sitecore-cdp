import { faker } from '@faker-js/faker'
import request from 'supertest'
import { Express } from 'express-serve-static-core'
import config from '@root/config'
import { createServer } from '@root/utils/api/server'
import dbContext from '@root/db/dbContext'
import { insertUser } from '@root/db/actions/userActions'
import { UserModel, isUserModel } from '@root/models/userModel'
import { ErrorModel, isErrorModel } from '@root/models/errorModel'

let server: Express

beforeAll(async () => {
  await dbContext.connect()
  server = await createServer()
})

afterAll(async () => {
  await dbContext.disconnect()
})

jest.setTimeout(30000)

describe('POST /api/v1/login - performance', () => {
  it(`should measure performance`, async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()
    const insertUserResult = (await insertUser(email, password)) as UserModel

    const now = new Date().getTime()

    let i = 0
    do {
      i += 1

      const data = {
        email,
        password,
      }

      const response = await request(server)
        .post(`/api/v1/login`)
        .set('Authorization', `Bearer ${config.apiKey}`)
        .send(data)
    } while (new Date().getTime() - now < 1000)

    console.log(`login performance test: ${i}`)
  })
})
