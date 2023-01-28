import { faker } from '@faker-js/faker'
import { insertUser, getUser } from '@root/db/actions/userActions'
import { compareWithHash } from '@root/utils/common'
import dbContext from '@root/db/dbContext'
import { UserModel } from '@root/models/userModel'

beforeAll(async () => {
  await dbContext.connect()
})

afterAll(async () => {
  await dbContext.disconnect()
})

describe('create user', () => {
  it('should create user if email and password are valid', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()
    const before = Date.now()

    const user = (await insertUser(email, password)) as UserModel
    expect(user).not.toBeNull()
    expect(user.id).not.toBeNull()

    const fetched = (await getUser(email)) as UserModel
    expect(fetched).not.toBeNull()

    const after = Date.now()

    expect(fetched).not.toBeNull()
    expect(fetched!.email).toBe(email)
    expect(fetched!.password).not.toBe(password)
    expect(before).toBeLessThanOrEqual(fetched!.createdAt.getTime())
    expect(fetched!.createdAt.getTime()).toBeLessThanOrEqual(after)

    const isValidPassword = await compareWithHash(password, fetched!.password)

    expect(isValidPassword).toBe(true)
  })

  it('should resolves with false & valid error if email is empty ', async () => {
    const password = faker.internet.password()
    await expect(insertUser('', password)).resolves.toEqual({
      error: {
        type: 'account_invalid',
        message: 'email is required',
      },
    })
  })

  it('should resolves with false & valid error if email is not valid ', async () => {
    const password = faker.internet.password()
    await expect(insertUser('abc', password)).resolves.toEqual({
      error: {
        type: 'account_invalid',
        message: 'must be a valid email',
      },
    })
  })

  it('should resolves with false & valid error if password is empty ', async () => {
    const email = faker.internet.email()
    await expect(insertUser(email, '')).resolves.toEqual({
      error: {
        type: 'account_invalid',
        message: 'password is required',
      },
    })
  })

  it('should resolves with false & valid error if password length is less then 6 characters', async () => {
    const email = faker.internet.email()
    const password = '12345'
    await expect(insertUser(email, password)).resolves.toEqual({
      error: {
        type: 'account_invalid',
        message: 'password must be at least 6 characters long',
      },
    })
  })

  it('should resolves with false & valid error if duplicate email', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()
    const user = await insertUser(email, password)

    await expect(insertUser(email, password)).resolves.toEqual({
      error: {
        type: 'account_already_exists',
        message: `${email} already exists`,
      },
    })
  })
})
