const BlocksDAO = require('../dao/BlocksDAO')

class BlocksController {
  constructor (knex) {
    this.blocksDAO = new BlocksDAO(knex)
  }

  getBlockByHash = async (request, response) => {
    const { hash } = request.params

    const block = await this.blocksDAO.getBlockByHash(hash)

    if (!block) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(block)
  }

  getBlocksByValidator = async (request, response) => {
    const { validator } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const block = await this.blocksDAO.getBlocksByValidator(validator, Number(page ?? 1), Number(limit ?? 10), order)

    if (!block) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(block)
  }

  getBlocks = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const blocks = await this.blocksDAO.getBlocks(Number(page ?? 1), Number(limit ?? 10), order)

    response.send(blocks)
  }
}

module.exports = BlocksController
