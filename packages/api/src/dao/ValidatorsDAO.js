const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')

module.exports = class ValidatorsDAO {
  constructor (knex) {
    this.knex = knex
  }

  getValidatorByProTxHash = async (proTxHash, validators) => {
    const [row] = await this.knex('validators')
      .select('validators.pro_tx_hash as pro_tx_hash')
      .where('validators.pro_tx_hash', proTxHash)

    if (!row) {
      return null
    }

    return new Validator(proTxHash)
  }

  /**
   * Get all active / non
   *
   * @param page {number}
   * @param limit {number}
   * @param order {string}
   * @param isActive {undefined | boolean}
   * @param validators {[{}]} validators (from Tenderdash RPC)
   *
   * @returns {Promise<PaginatedResultSet>}
   */
  getValidators = async (page, limit, order, isActive, validators) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('validators')
      .select(this.knex('validators')
        .modify(function (knex) {
          if (isActive !== undefined && isActive) {
            knex.whereIn('validators.pro_tx_hash', validators.map(validator => validator.proTxHash))
          } else if (isActive !== undefined && !isActive) {
            knex.whereNotIn('validators.pro_tx_hash', validators.map(validator => validator.proTxHash))
          }
        })
        .count('pro_tx_hash').as('total_count'),
      'validators.pro_tx_hash as pro_tx_hash', 'id')
      .select(this.knex.raw(`rank() over (order by id ${order}) rank`))
      .modify(function (knex) {
        if (isActive !== undefined && isActive) {
          knex.whereIn('validators.pro_tx_hash', validators.map(validator => validator.proTxHash))
        } else if (isActive !== undefined && !isActive) {
          knex.whereNotIn('validators.pro_tx_hash', validators.map(validator => validator.proTxHash))
        }
      })
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
