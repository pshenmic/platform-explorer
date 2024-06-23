const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')
module.exports = class ValidatorsDAO {
  constructor (knex) {
    this.knex = knex
  }

  getValidatorByProTxHash = async (proTxHash) => {
    const [row] = await this.knex('validators')
      .select(
        'validators.pro_tx_hash as pro_tx_hash',
        this.knex('blocks')
          .where('validator', proTxHash)
          .count('*')
          .as('blocks_count'),
        'blocks.timestamp as latest_timestamp',
        'blocks.hash as block_hash',
        'blocks.l1_locked_height as l1_locked_height',
        'blocks.created_at as created_at',
        'blocks.app_version as app_version',
        'blocks.block_version as block_version',
        'blocks.height as latest_height'
      )
      .leftJoin('blocks', 'blocks.validator', 'pro_tx_hash')
      .orderBy('blocks.height', 'desc')
      .where('validators.pro_tx_hash', proTxHash)
      .limit(1)

    if (!row) {
      return null
    }

    return Validator.fromRow(row)
  }

  getValidators = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const validatorsSubquery = this.knex('validators')
      .select('validators.pro_tx_hash as pro_tx_hash', 'id')
      .select(
        this.knex('validators').count('pro_tx_hash').as('total_count'),
        this.knex('blocks').count('*')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .as('blocks_count')
      )
      .select(
        this.knex('blocks').select('height')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc').limit(1)
          .as('latest_height'),
        this.knex('blocks').select('timestamp')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc').limit(1)
          .as('latest_timestamp'),
        this.knex('blocks').select('hash')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc').limit(1)
          .as('block_hash'),
        this.knex('blocks').select('l1_locked_height')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc').limit(1)
          .as('l1_locked_height'),
        this.knex('blocks').select('created_at')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc').limit(1)
          .as('created_at'),
        this.knex('blocks').select('app_version')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc').limit(1)
          .as('app_version'),
        this.knex('blocks').select('block_version')
          .whereRaw('validators.pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc').limit(1)
          .as('block_version')
      )
      .select(this.knex.raw(`rank() over (order by id ${order}) rank`))
      .as('validators')

    const rows = await this.knex(validatorsSubquery)
      .select(
        'id', 'rank', 'total_count', 'pro_tx_hash',
        'latest_height', 'latest_timestamp', 'blocks_count',
        'block_hash', 'l1_locked_height', 'created_at',
        'app_version', 'block_version'
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
