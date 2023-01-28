import { faker } from '@faker-js/faker'
import { createAuthToken, verifyAuthToken } from '@root/utils/auth'

describe('createAuthToken', () => {
  test('should create JWT token with expected object structure', async () => {
    const id = faker.datatype.uuid()

    const token = await createAuthToken(id)
    expect(token).not.toBeNull()

    expect(token).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        expireAt: expect.any(Date),
      })
    )
  })

  test('should resolve with true and valid id', async () => {
    const id = faker.datatype.uuid()

    const token = await createAuthToken(id)
    expect(token).not.toBeNull()

    const verified = await verifyAuthToken(token.token)
    expect((verified as { id: string }).id).toEqual(id)
  })

  test('should resolve with false for invalid token', async () => {
    const response = await verifyAuthToken('invalidToken')
    expect(response).toEqual({
      error: { type: 'unauthorized', message: 'Authentication Failed' },
    })
  })
})
