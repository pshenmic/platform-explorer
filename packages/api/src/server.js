const Dash = require('dash')
const Fastify = require('fastify')
const cors = require('@fastify/cors')
const Routes = require('.//routes')

const ServiceNotAvailableError = require("./errors/ServiceNotAvailableError");
const MainController = require("./controllers/MainController");
const TransactionsController = require("./controllers/TransactionsController");
const BlocksController = require("./controllers/BlocksController");
const DocumentsController = require("./controllers/DocumentsController");
const IdentitiesController = require("./controllers/IdentitiesController");
const DataContractsController = require("./controllers/DataContractsController");

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

let client
let knex
let fastify

module.exports = {
    start: async () => {
        client = new Dash.Client()
        await client.platform.initialize()

        fastify = Fastify()

        await fastify.register(cors, {
            // put your options here
        })

        knex = require('knex')({
            client: 'pg',
            connection: {
                host: process.env["POSTGRES_HOST"],
                port: process.env["POSTGRES_PORT"],
                user: process.env["POSTGRES_USER"],
                database: process.env["POSTGRES_DB"],
                password: process.env["POSTGRES_PASS"],
                ssl: process.env["POSTGRES_SSL"] ? { rejectUnauthorized: false } : false,
            }
        });

        await knex.raw('select 1+1');

        const mainController = new MainController(knex)
        const blocksController = new BlocksController(knex)
        const transactionsController = new TransactionsController(client, knex)
        const dataContractsController = new DataContractsController(knex)
        const documentsController = new DocumentsController(knex)
        const identitiesController = new IdentitiesController(knex)

        Routes({fastify, mainController, blocksController, transactionsController, dataContractsController, documentsController, identitiesController})

        fastify.setErrorHandler(errorHandler)

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
            host: "0.0.0.0",
            port: 3005,
            listenTextResolver: (address) => console.log(`Platform Explorer API listening on ${address}`)
        });
    }
}
