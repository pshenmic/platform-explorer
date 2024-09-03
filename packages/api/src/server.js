const Dash = require('dash')
const Fastify = require('fastify')
const metricsPlugin = require('fastify-metrics')
const cors = require('@fastify/cors')
const schemaTypes = require('./schemas')
const Routes = require('./routes')
const ServiceNotAvailableError = require('./errors/ServiceNotAvailableError')
const MainController = require('./controllers/MainController')
const EpochController = require('./controllers/EpochController')
const TransactionsController = require('./controllers/TransactionsController')
const BlocksController = require('./controllers/BlocksController')
const DocumentsController = require('./controllers/DocumentsController')
const IdentitiesController = require('./controllers/IdentitiesController')
const DataContractsController = require('./controllers/DataContractsController')
const ValidatorsController = require('./controllers/ValidatorsController')
const { getKnex } = require('./utils')
const BlocksDAO = require('./dao/BlocksDAO')
const DAPI = require('./dapi')
const DAPIClient = require('@dashevo/dapi-client')

function errorHandler (err, req, reply) {
  if (err instanceof ServiceNotAvailableError) {
    return reply.status(503).send({ error: 'tenderdash/dashcore backend is not available' })
  }

  if (err?.constructor?.name === 'InvalidStateTransitionError') {
    const [error] = err.getErrors()
    const { code, message } = error

    return reply.status(500).send({ error: message, code })
  }

  console.error(err)
  reply.status(500)

  reply.send({ error: err.message })
}

let client
let knex
let fastify
let dapi

module.exports = {
  start: async () => {
    client = new Dash.Client()

    await client.platform.initialize()

    const dapiClient = new DAPIClient({
      dapiAddresses: [
        {
          host: process.env.DAPI_HOST ?? 'localhost',
          port: process.env.DAPI_PORT ?? '1443',
          protocol: process.env.DAPI_PROTOCOL ?? 'http'
        }
      ]
    })

    const { dpp } = client.platform

    dapi = new DAPI(dapiClient, dpp)

    fastify = Fastify()

    await fastify.register(cors, {
      // put your options here
    })

    await fastify.register(metricsPlugin, {
      endpoint: '/metrics'
    })

    schemaTypes.forEach(schema => fastify.addSchema(schema))

    knex = getKnex()

    await knex.raw('select 1+1')

    const mainController = new MainController(knex, dapi)
    const epochController = new EpochController(knex)
    const blocksController = new BlocksController(knex)
    const transactionsController = new TransactionsController(client, knex)
    const dataContractsController = new DataContractsController(knex)
    const documentsController = new DocumentsController(knex)
    const identitiesController = new IdentitiesController(knex, dapi)
    const validatorsController = new ValidatorsController(knex)

    Routes({
      fastify,
      mainController,
      epochController,
      blocksController,
      transactionsController,
      dataContractsController,
      documentsController,
      identitiesController,
      validatorsController
    })

    fastify.setErrorHandler(errorHandler)

    // eslint-disable-next-line no-new
    new fastify.metrics.client.Gauge({
      name: 'platform_explorer_api_block_height',
      help: 'The latest block height in the API',
      async collect () {
        const blockDAO = new BlocksDAO(knex)
        const { resultSet: [block] } = await blockDAO.getBlocks(1, 1, 'desc')

        this.set(block.header.height)
      }
    })

    await fastify.ready()

    return fastify
  },
  stop: async () => {
    console.log('Server stopped')

    await fastify.close()
    await knex.destroy()
  },
  listen: async (server) => {
    server.listen({
      host: '0.0.0.0',
      port: 3005,
      listenTextResolver: (address) => console.log(`Platform Explorer API listening on ${address}`)
    })
  }
}
