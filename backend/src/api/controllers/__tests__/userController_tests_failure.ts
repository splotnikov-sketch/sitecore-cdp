import { faker } from '@faker-js/faker'
import request from 'supertest'
import { Express } from 'express-serve-static-core'
import config from '@root/config'
import { createServer } from '@root/utils/api/server'
import dbContext from '@root/db/dbContext'

import * as mockUserActions from '@root/db/actions/userActions'

jest.mock('@root/db/actions/userActions')

let server: Express

beforeAll(async () => {
  await dbContext.connect()
  server = await createServer()
})

afterAll(async () => {
  await dbContext.disconnect()
})

describe('createUser failure', () => {
  it('should return 500 & valid response if insertUser resolved with an error', (done) => {
    const mock = jest.spyOn(mockUserActions, 'insertUser')
    mock.mockImplementation(() =>
      Promise.resolve({ error: { type: 'unknown', message: 'unknown' } })
    )

    request(server)
      .post(`/api/v1/user`)
      .set('Authorization', `Bearer ${config.apiKey}`)
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
      .expect(500)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({
          error: {
            type: 'internal_server_error',
            message: 'Internal Server Error',
          },
        })
        done()
      })
  })

  it('should return internal_server_error if jwt.sign fails with the error', (done) => {
    const mock = jest.spyOn(mockUserActions, 'insertUser')
    mock.mockImplementation(() =>
      Promise.resolve({ error: { type: 'unknown', message: 'unknown' } })
    )

    request(server)
      .post(`/api/v1/user`)
      .set('Authorization', `Bearer ${config.apiKey}`)
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
      .expect(500)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({
          error: {
            type: 'internal_server_error',
            message: 'Internal Server Error',
          },
        })
        done()
      })
  })
})
