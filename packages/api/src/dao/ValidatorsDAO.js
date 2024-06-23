const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')
module.exports = class ValidatorsDAO {
  constructor(knex) {
    this.knex = knex
  }

  getValidatorByProTxHash = async (proTxHash) => {
    const [row] = await this.knex('validators')
      .leftJoin('blocks', 'validators.pro_tx_hash', 'blocks.validator')
      .select(
        'validators.pro_tx_hash as pro_tx_hash',
        this.knex('blocks')
          .select('timestamp')
          .where('validator', proTxHash)
          .orderBy('height', 'desc')
          .limit(1)
          .as('latest_timestamp'),
        this.knex('blocks')
          .select('height')
          .where('validator', proTxHash)
          .orderBy('height', 'desc')
          .limit(1)
          .as('latest_height'),
        this.knex('blocks')
          .where('validator', proTxHash)
          .count('*')
          .as('blocks_count'),
        this.knex('blocks')
          .where('blocks.height', this.knex('blocks').max('height').where('validator', proTxHash))
          .select('hash')
          .orderBy('height', 'desc')
          .limit(1)
          .as('block_hash'),
        this.knex('blocks')
          .where('blocks.height', this.knex('blocks').max('height').where('validator', proTxHash))
          .select('l1_locked_height')
          .orderBy('height', 'desc')
          .limit(1)
          .as('l1_locked_height'),
        this.knex('blocks')
          .where('blocks.height', this.knex('blocks').max('height').where('validator', proTxHash))
          .select('created_at')
          .orderBy('height', 'desc')
          .limit(1)
          .as('created_at'),
        this.knex('blocks')
          .where('blocks.height', this.knex('blocks').max('height').where('validator', proTxHash))
          .select('app_version')
          .orderBy('height', 'desc')
          .limit(1)
          .as('app_version'),
        this.knex('blocks')
          .where('blocks.height', this.knex('blocks').max('height').where('validator', proTxHash))
          .select('block_version')
          .orderBy('height', 'desc')
          .limit(1)
          .as('block_version'),
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
          .count('*')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .as('blocks_count'),
        this.knex('blocks')
          .select('height')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('latest_height'),
        this.knex('blocks')
          .select('timestamp')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('latest_timestamp'),
        this.knex('blocks')
          .select('hash')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('block_hash'),
        this.knex('blocks')
          .select('l1_locked_height')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('l1_locked_height'),
        this.knex('blocks')
          .select('created_at')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('created_at'),
        this.knex('blocks')
          .select('app_version')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('app_version'),
        this.knex('blocks')
          .select('block_version')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('block_version'),
      )
      .select(this.knex.raw(`rank() over (order by id ${order}) rank`))
      .as('validators')

    const rows = await this.knex(subquery)
      .select(
        'id',
        'rank',
        'pro_tx_hash',
        'total_count',
        'latest_height',
        'latest_timestamp',
        'blocks_count',
        'block_hash',
        'l1_locked_height',
        'created_at',
        'app_version',
        'block_version'
      )
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('id', order)


    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0
    const resultSet = rows.map((row) =>
      Validator.fromRow(row)
    )
    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
