const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { validator } = require('../../test/utils/fixtures')

module.exports = class ValidatorsDAO {
  constructor (knex) {
    this.knex = knex
  }

  getValidatorByProTxHash = async (proTxHash) => {
    const [row] = await this.knex('validators')
      .select('validators.pro_tx_hash as pro_tx_hash')
      .where('validators.pro_tx_hash', proTxHash)

    if (!row) {
      return null
    }

    const [proposedBlocks] = await this.knex('blocks')
      .where('validator', row.pro_tx_hash)
      .select(
        'validator as pro_tx_hash',
        this.knex.raw('MAX(timestamp) as latest_timestamp'),
        this.knex.raw('MAX(height) as latest_height'),
        this.knex.raw('CAST( COUNT(*) as INT) as blocks_count '))
      .groupBy('pro_tx_hash')

    return Validator.fromRow(proposedBlocks)
  }

  getValidators = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('validators')
      .select(this.knex('validators').count('pro_tx_hash').as('total_count'),
        'validators.pro_tx_hash as pro_tx_hash', 'id')
      .select(this.knex.raw(`rank() over (order by id ${order}) rank`))
      .as('validators')

    const rows = await this.knex(subquery)
      .select('id', 'rank', 'total_count', 'pro_tx_hash')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const pro_tx_hashes = rows.map((row) => row.pro_tx_hash)

    const proposedBlocks = await this.knex('blocks')
      .whereIn('validator', pro_tx_hashes)
      .select(
        'validator as pro_tx_hash',
        this.knex.raw('MAX(timestamp) as latest_timestamp'),
        this.knex.raw('MAX(height) as latest_height'),
        this.knex.raw('CAST( COUNT(*) as INT) as blocks_count '))
      .groupBy('pro_tx_hash')

    const resultSet = rows.map((row) =>
      Validator.fromRow(proposedBlocks.find((block) => block.pro_tx_hash === row.pro_tx_hash))
    )

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
