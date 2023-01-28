import { NextFunction, Request, Response } from 'express'
import { apiKeyMiddleware } from '@root/api/middleware'
import config from '@root/config'

describe('ApiKey middleware', () => {
  const mockReq = (): Partial<Request> => {
    const req = {}
    // ...from here assign what properties you need on a req to test with
    return req
  }

  // const mockRes = (): Partial<Response> => {
  //     const res = {};
  //     res.status = jest.fn().mockReturnValue(res);
  //     res.json = jest.fn().mockReturnValue(res);
  //     return res;
  // };

  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  //let nextFunction: NextFunction = jest.fn()

  let writeHeadCallback = jest.fn()
  let endCallback = jest.fn()
  let jsonCallback = jest.fn()

  beforeEach(() => {
    writeHeadCallback = jest.fn()
    endCallback = jest.fn()
    jsonCallback = jest.fn()

    mockRequest = {}
    mockResponse = {
      writeHead: writeHeadCallback,
      end: endCallback,
      json: jsonCallback,
      locals: {},
    }
  })

  const noAuthorizationError = {
    error: {
      type: 'unauthorized',
      message: "Missing 'Authorization' header",
    },
  }

  test('without headers', () => {
    const nextFunction = jest.fn()

    apiKeyMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    )

    expect(endCallback).toBeCalledTimes(1)
    expect(endCallback).toBeCalledWith(
      JSON.stringify(noAuthorizationError, null, 2)
    )
  })

  //TODO: fix test

  // test('without "authorization" header', () => {
  //   mockRequest = {
  //     headers: {},
  //   }

  //   const nextFunction = jest.fn()

  //   apiKeyMiddleware(
  //     mockRequest as Request,
  //     mockResponse as Response,
  //     nextFunction
  //   )

  //   expect(endCallback).toBeCalledTimes(1)
  //   expect(endCallback).toBeCalledWith(
  //     JSON.stringify(noAuthorizationError, null, 2)
  //   )
  // })

  // test('with valid "authorization" header', () => {
  //   mockRequest = {
  //     headers: {
  //       authorization: `Bearer ${config.apiKey}`,
  //     },
  //   }

  //   const nextFunction = jest.fn()

  //   //nextFunction = jest.fn()

  //   apiKeyMiddleware(
  //     mockRequest as Request,
  //     mockResponse as Response,
  //     nextFunction
  //   )

  //   console.log('nextFunction')
  //   console.log(nextFunction.mock)

  //   // console.log('mockResponse')
  //   // console.log(mockResponse)

  //   expect(nextFunction).toBeCalledTimes(1)
  // })
})
