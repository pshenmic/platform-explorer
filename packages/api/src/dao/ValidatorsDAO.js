const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')

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

    return Validator.fromRow(row)
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

    const resultSet = rows.map((row) => Validator.fromRow(row))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
