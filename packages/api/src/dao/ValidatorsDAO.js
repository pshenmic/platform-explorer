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
          .as('proposed_blocks_amount'),
        'blocks.timestamp as latest_timestamp',
        'blocks.hash as block_hash',
        'blocks.l1_locked_height as l1_locked_height',
        'blocks.created_at as created_at',
        'blocks.app_version as app_version',
        'blocks.block_version as block_version',
        'blocks.height as latest_height'
      )
      .rightJoin('blocks', 'blocks.validator', 'pro_tx_hash')
      .orderBy('blocks.height', 'desc')
      .where('validators.pro_tx_hash', proTxHash)

    if (!row) {
      return null
    }

    const lastProposedBlockHeader = row.block_hash
      ? {
          hash: row.block_hash,
          height: row.latest_height,
          timestamp: row.latest_timestamp,
          l1_locked_height: row.l1_locked_height,
          app_version: row.app_version,
          block_version: row.block_version,
          validator: row.pro_tx_hash
        }
      : null

    return Validator.fromRow({
      pro_tx_hash: row.pro_tx_hash,
      proposed_blocks_amount: row.proposed_blocks_amount,
      last_proposed_block_header: lastProposedBlockHeader
    })
  }

  getValidators = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const validatorsSubquery = this.knex('validators')
      .select(
        'validators.pro_tx_hash as pro_tx_hash',
        'validators.id',
        this.knex('validators').count('pro_tx_hash').as('total_count'),
        this.knex('blocks')
          .count('*')
          .whereRaw('blocks.validator = validators.pro_tx_hash')
          .as('proposed_blocks_amount'),
        this.knex('blocks')
          .select('hash')
          .whereRaw('pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('proposed_block_hash')
      )
      .as('validators')

    const subquery = this.knex(validatorsSubquery)
      .select(
        'pro_tx_hash',
        'id',
        'total_count',
        'proposed_blocks_amount',
        this.knex.raw(`rank() over (order by validators.id ${order}) as rank`),
        'blocks.hash as block_hash',
        'blocks.height as latest_height',
        'blocks.timestamp as latest_timestamp',
        'blocks.l1_locked_height as l1_locked_height',
        'blocks.app_version as app_version',
        'blocks.block_version as block_version'
      )
      .leftJoin('blocks', 'blocks.hash', 'proposed_block_hash')
      .as('blocks')

    const rows = await this.knex(subquery)
      .select(
        'id',
        'rank',
        'total_count',
        'pro_tx_hash',
        'proposed_blocks_amount',
        'block_hash',
        'latest_height',
        'latest_timestamp',
        'l1_locked_height',
        'app_version',
        'block_version'
      )
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0
    const resultSet = rows.map((row) => {
      const lastProposedBlockHeader = row.block_hash
        ? {
            hash: row.block_hash,
            height: row.latest_height,
            timestamp: row.latest_timestamp,
            l1_locked_height: row.l1_locked_height,
            app_version: row.app_version,
            block_version: row.block_version,
            validator: row.pro_tx_hash
          }
        : null
      return Validator.fromRow({
        pro_tx_hash: row.pro_tx_hash,
        proposed_blocks_amount: row.proposed_blocks_amount,
        last_proposed_block_header: lastProposedBlockHeader
      })
    })
    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
