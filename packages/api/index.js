require('dotenv').config()

const Dash = require('dash')
const Fastify = require('fastify')
const cors = require('@fastify/cors')
const Routes = require('./src/routes')

const ServiceNotAvailableError = require("./src/errors/ServiceNotAvailableError");
const MainController = require("./src/controllers/MainController");
const TransactionController = require("./src/controllers/TransactionController");
const BlockController = require("./src/controllers/BlockController");
const packageVersion = require('./package.json').version
const Worker = require('./src/worker/index')
const {BLOCK_TIME} = require("./src/constants");
const DataContractsController = require("./src/controllers/DataContractsController");

function errorHandler(err, req, reply) {
    if (err instanceof ServiceNotAvailableError) {
        return reply.status(403).send({error: 'tenderdash backend is not available'})
    }

    if (err?.constructor?.name === 'InvalidStateTransitionError') {
        const [error] = err.getErrors()
        const {code, message} = error

        return reply.status(500).send({error: message, code})
    }

    console.error(err)
    reply.status(500)

    reply.send({error: err.message})
}

let status;

const init = async () => {
    const client = new Dash.Client()
    await client.platform.initialize()

    const worker = new Worker()

    worker.setHandler(async () => {
        try {
            status = true
        } catch (e) {
        }
    })
    worker.start(BLOCK_TIME)

    const fastify = Fastify()

    await fastify.register(cors, {
        // put your options here
    })

    const knex = require('knex')({
        client: 'pg',
        connection: {
            host: process.env["POSTGRES_HOST"],
            port: process.env["POSTGRES_PORT"],
            user: process.env["POSTGRES_USER"],
            database: process.env["POSTGRES_NAME"],
            password: process.env["POSTGRES_PASS"],
            ssl: process.env["POSTGRES_SSL"] ? { rejectUnauthorized: false } : false,
        }
    });

    await knex.raw('select 1+1');

    const mainController = new MainController(knex)
    const blockController = new BlockController(knex)
    const transactionController = new TransactionController(client, knex)
    const dataContractsController = new DataContractsController(knex)

    Routes({fastify, mainController, blockController, transactionController, dataContractsController})

    fastify.setErrorHandler(errorHandler)
    fastify.listen({ host: "0.0.0.0", port: 3005, listenTextResolver: (address) => console.log(`Platform indexer API has started on the ${address}`)});
}


init().then((`Platform Explorer backend v${packageVersion}`))
