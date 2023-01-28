import * as path from 'path'
import bodyParser from 'body-parser'
import express from 'express'
import * as OpenApiValidator from 'express-openapi-validator'
import { Express } from 'express-serve-static-core'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import cors from 'cors'
import { connector, summarise } from 'swagger-routes-express'
import YAML from 'yamljs'

import * as api from '@root/api/controllers'
import {
  apiKeyMiddleware,
  devLoggerMiddleware,
  authMiddleware,
} from '@root/api/middleware'

import config from '@root/config'
import logger from '@root/utils/logger'

import genericErrors from '@root/utils/errors/genericErrors'

export async function createServer(): Promise<Express> {
  const yamlSpecFile = path.resolve(__dirname, 'openapi.yml')

  //const yamlSpecFile = 'openapi.yml'
  const apiDefinition = YAML.load(yamlSpecFile)
  const apiSummary = summarise(apiDefinition)
  logger.info(apiSummary)

  const server = express()

  server.use(cors())

  // here we can initialize body/cookies parsers, connect logger, for example morgan
  server.use(bodyParser.json())

  /* istanbul ignore next */
  if (config.morganLogger) {
    server.use(
      morgan(':method :url :status :response-time ms - :res[content-length]')
    )
  }

  /* istanbul ignore next */
  if (config.morganBodyLogger) {
    morganBody(server)
  }

  /* istanbul ignore next */
  if (config.devLogger) {
    server.use(devLoggerMiddleware)
  }

  // setup API validator
  const validatorOptions = {
    apiSpec: yamlSpecFile,
    validateRequests: true,
    validateResponses: true,
  }

  server.use(OpenApiValidator.middleware(validatorOptions))

  // error customization, if request is invalid
  server.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.status(err.status).json({
        error: {
          type: 'request_validation',
          message: err.message,
          errors: err.errors,
        },
      })
    }
  )

  const connect = connector(api, apiDefinition, {
    onCreateRoute: (method: string, descriptor: any[]) => {
      logger.verbose(
        `${method}: ${descriptor[0]} : ${(descriptor[1] as any).name}`
      )
    },
    security: {
      apiKey: apiKeyMiddleware,
      auth: authMiddleware,
    },
  })

  connect(server)

  server.use(genericErrors)

  return server
}
