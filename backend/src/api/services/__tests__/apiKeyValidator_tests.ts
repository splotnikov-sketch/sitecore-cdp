import apiKeyValidator from '@root/api/services/apiKeyValidator'
import config from '@root/config'

describe('apiKey', () => {
  it('should resolve with true if valid api key is passed as bearer token', async () => {
    const response = await apiKeyValidator.validate(`Bearer ${config.apiKey}`)
    expect(response).toEqual({ apiKey: config.apiKey })
  })

  it('should resolve with false if invalid api key is passed as bearer token', async () => {
    const response = await apiKeyValidator.validate(`Bearer invalidToken`)
    expect(response).toEqual({
      error: { type: 'unauthorized', message: 'Authorization Failed' },
    })
  })
})
