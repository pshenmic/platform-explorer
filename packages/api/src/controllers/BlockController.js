const crypto = require("crypto");
const cache = require("../cache");
const TenderdashRPC = require("../tenderdashRpc");

class BlockController {
    constructor() {
    }

    async getBlockByHash(request, response) {
        const {hash} = request.params;

        const cached = cache.get('block_' + hash)

        if (cached) {
            return response.send(cached)
        }

        const block = await TenderdashRPC.getBlockByHash(hash);

        if (block?.block?.data?.txs?.length) {
            const txHashes = block.block.data.txs.map(tx => crypto.createHash('sha256').update(Buffer.from(tx, 'base64')).digest('hex').toUpperCase())

            Object.assign(block, {txHashes})
        }

        cache.set('block_' + hash, block);

        response.send(block);
    }

    async getBlocks(request, response) {
        const {page, limit, order} = request.query

        const blocks = await TenderdashRPC.getBlocks(page, limit, order)

        response.send(blocks);
    }
}

module.exports = BlockController
