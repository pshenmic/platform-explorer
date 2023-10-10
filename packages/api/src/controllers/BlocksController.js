const Block = require('../models/Block');
const BlocksDAO = require('../dao/BlocksDAO');

class BlocksController {
    constructor(knex) {
        this.blocksDAO = new BlocksDAO(knex)
    }

    getBlockByHash = async (request, response) => {
        const {hash} = request.params

        const block = await this.blocksDAO.getBlockByHash(hash)

        if (!block) {
            return response.status(404).send({message: 'not found'})
        }

        response.send(block);
    }

    getBlocks = async (request, response) => {
        const {from, to, order = 'desc'} = request.query

        const blocks = await this.blocksDAO.getBlocksPaginated(from, to, order)

        response.send(blocks);
    }
}

module.exports = BlocksController
