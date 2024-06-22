const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')
module.exports = class ValidatorsDAO {
  constructor(knex) {
    this.knex = knex
  }

  getValidatorByProTxHash = async (proTxHash) => {
    const [row] = await this.knex('validators')
      .select(
        'validators.pro_tx_hash as pro_tx_hash',
        this.knex('blocks')
          .where('validator', proTxHash)
          .select(this.knex.raw('MAX(timestamp) as latest_timestamp'),).as('latest_timestamp'),
        this.knex('blocks')
          .where('validator', proTxHash)
          .select(this.knex.raw('MAX(height) as latest_height'),).as('latest_height'),
        this.knex('blocks')
          .where('validator', proTxHash)
          .select(this.knex.raw('CAST( COUNT(*) as INT) as blocks_count'),).as('blocks_count')
      )
      .where('validators.pro_tx_hash', proTxHash)

    if (!row) {
      return null
    }

    return Validator.fromRow(row)
  }

  getValidators = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('validators')
      .select(
        this.knex('validators').count('pro_tx_hash').as('total_count'),
        'validators.pro_tx_hash as pro_tx_hash',
        'id',
        this.knex('blocks')
          .whereRaw('pro_tx_hash = validator')
          .select(this.knex.raw('MAX(timestamp) as latest_timestamp'),).as('latest_timestamp'),
        this.knex('blocks')
          .whereRaw('pro_tx_hash = validator')
          .select(this.knex.raw('MAX(height) as latest_height'),).as('latest_height'),
        this.knex('blocks')
          .whereRaw('pro_tx_hash = validator')
          .select(this.knex.raw('CAST( COUNT(*) as INT) as blocks_count'),).as('blocks_count'))
      .select(this.knex.raw(`rank() over (order by id ${order}) rank`))
      .as('validators')

    const rows = await this.knex(subquery)
      .select('id', 'rank', 'total_count', 'pro_tx_hash', 'blocks_count', 'latest_height', 'latest_timestamp')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map((row) =>
      Validator.fromRow(row)
    )

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
