const {BLOCK_TIME} = require("../constants");
const cache = require("../cache");
const {hash} = require("../utils");
const TenderdashRPC = require("../tenderdashRpc");

class MainController {
    constructor() {
    }

    async getStatus(request, response) {
        const cached = cache.get('status')

        if (cached) {
            return response.send(cached)
        }

        const status = await TenderdashRPC.getStatus()

        cache.set('status', status, BLOCK_TIME)

        response.send(status);
    }
    async search(request, response) {
        const {query} = request.query;

        // todo validate
        if (!query) {
            return response.status(400).send({error: '`?query=` missing'})
        }

        const cached = cache.get('search_' + hash(query))

        if (cached) {
            return response.send(cached)
        }

        if (/^[0-9]/.test(query)) {
            const block = await TenderdashRPC.getBlockByHeight(query)

            if (!block.code) {
                cache.set('search_' + hash(query), {block})

                return response.send({block})
            }
        }

        // search blocks
        const block = await TenderdashRPC.getBlockByHash(query)

        if (!block.code && block.block_id.hash) {
            cache.set('search_' + hash(query), {block})

            return response.send({block})
        }

        // search transactions
        const transaction = await TenderdashRPC.getTransactionByHash(query)

        if (!transaction.code) {
            cache.set('search_' + hash(query), {transaction})

            return response.send({transaction})
        }

        response.status(404).send({message: 'not found'})
    }


}

module.exports = MainController
