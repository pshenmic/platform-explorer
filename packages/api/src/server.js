const Fastify = require('fastify')
const metricsPlugin = require('fastify-metrics')
const cors = require('@fastify/cors')
const { FastifySSEPlugin } = require('fastify-sse-v2')
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
const RateController = require('./controllers/RateController')
const MasternodeVotesController = require('./controllers/MasternodeVotesController')
const ContestedResourcesController = require('./controllers/ContestedResourcesController')
const TokensController = require('./controllers/TokensController')
const { DashPlatformSDK } = require('dash-platform-sdk')
const { createClient } = require('redis')
const RedisNotConnectedError = require('./errors/RedisNotConnectedError')
const IndexerNotSynchronized = require('./errors/IndexerNotSynchronized')

function errorHandler (err, req, reply) {
  if (err instanceof ServiceNotAvailableError) {
    return reply.status(503).send({ error: 'tenderdash/dashcore backend is not available' })
  } else if (err instanceof RedisNotConnectedError) {
    return reply.status(503).send({ error: 'redis is not connected' })
  } else if (err instanceof IndexerNotSynchronized) {
    return reply.status(503).send({ error: 'This feature will be available after indexer synchronization' })
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

let knex
let fastify

module.exports = {
  start: async () => {
    const dapiURL = process.env.DAPI_URL ?? 'http://127.0.0.1:1443'
    const network = process.env.NETWORK ?? 'testnet'
    const redisURL = process.env.REDIS_URL

    const sdk = new DashPlatformSDK({
      grpc: {
        poolLimit: 5,
        dapiUrl: dapiURL.split(',')
      },
      network
    })

    const redis = redisURL
      ? await createClient({
        url: redisURL
      })
      : undefined

    fastify = Fastify()

    await fastify.register(cors, {
      // put your options here
    })

    await fastify.register(metricsPlugin, {
      endpoint: '/metrics'
    })

    await fastify.register(FastifySSEPlugin)

    schemaTypes.forEach(schema => fastify.addSchema(schema))

    knex = getKnex()

    await knex.raw('select 1+1')

    const mainController = new MainController(knex, sdk)
    const epochController = new EpochController(knex, sdk)
    const blocksController = new BlocksController(knex, sdk, redis)
    const transactionsController = new TransactionsController(knex, sdk)
    const dataContractsController = new DataContractsController(knex, sdk)
    const documentsController = new DocumentsController(knex, sdk)
    const identitiesController = new IdentitiesController(knex, sdk)
    const validatorsController = new ValidatorsController(knex, sdk)
    const rateController = new RateController()
    const masternodeVotesController = new MasternodeVotesController(knex, sdk)
    const contestedResourcesController = new ContestedResourcesController(knex, sdk)
    const tokensController = new TokensController(knex, sdk)

    Routes({
      fastify,
      mainController,
      epochController,
      blocksController,
      transactionsController,
      dataContractsController,
      documentsController,
      identitiesController,
      validatorsController,
      rateController,
      masternodeVotesController,
      contestedResourcesController,
      tokensController
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
