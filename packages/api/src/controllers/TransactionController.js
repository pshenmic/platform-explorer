const cache = require("../cache");
const {hash} = require("../utils")
const TenderdashRPC = require("../tenderdashRpc");

class TransactionController {
    constructor(client) {
        this.client = client
    }

    getTransactions = async (request, response) => {
        const {from, to} = request.query

        const query = `${from}_${to}`

        const cached = cache.get('tx_search_' + hash(query))

        if (cached) {
            return response.send(cached)
        }

        const transactions = await TenderdashRPC.getTransactions(from, to)

        cache.set('tx_search_' + hash(query))

        response.send(transactions);
    }

    getTransactionByHash = async (request, reply) => {
        const {txHash} = request.params;

        const cached = cache.get('transaction_' + txHash)

        if (cached) {
            return reply.send(cached)
        }

        const transaction = await TenderdashRPC.getTransactionByHash(txHash)

        cache.set('transaction_' + txHash, transaction)

        reply.send(transaction)
    }

    decode = async (request, reply) => {
        const {base64} = request.body;

        const cached = cache.get('decoded_' + base64)

        if (cached) {
            return reply.send(cached)
        }

        const stateTransition = await this.client.platform.dpp.stateTransition.createFromBuffer(Buffer.from(base64, 'base64'));

        cache.set('decoded_' + base64, stateTransition)

        reply.send(stateTransition)
    }
}

module.exports = TransactionController
