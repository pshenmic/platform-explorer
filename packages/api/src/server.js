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
const DAPI = require('./DAPI')
const RateController = require('./controllers/RateController')
const DAPIClient = require('@dashevo/dapi-client')
const MasternodeVotesController = require('./controllers/MasternodeVotesController')
const ContestedResourcesController = require('./controllers/ContestedResourcesController')
const TokensController = require('./controllers/TokensController')
const { default: loadWasmDpp } = require('dash').PlatformProtocol

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
    await loadWasmDpp()

    const dapiClient = new DAPIClient({
      dapiAddresses: (process.env.DAPI_URL ?? '127.0.0.1:1443:self-signed').split(','),
      network: process.env.NETWORK ?? 'testnet'
    })

    dapi = new DAPI(dapiClient)

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

    const mainController = new MainController(knex, dapi, client)
    const epochController = new EpochController(knex, dapi)
    const blocksController = new BlocksController(knex, dapi)
    const transactionsController = new TransactionsController(client, knex, dapi)
    const dataContractsController = new DataContractsController(knex, client, dapi)
    const documentsController = new DocumentsController(client, knex, dapi)
    const identitiesController = new IdentitiesController(client, knex, dapi)
    const validatorsController = new ValidatorsController(knex, dapi)
    const rateController = new RateController()
    const masternodeVotesController = new MasternodeVotesController(knex, dapi)
    const contestedResourcesController = new ContestedResourcesController(knex, dapi)
    const tokensController = new TokensController(knex, dapi)

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
