const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')

module.exports = class ValidatorsDAO {
  constructor(knex) {
    this.knex = knex
  }

  getValidatorByProTxHash = async (proTxHash, start, end) => {

    const validatorsSubquery = this.knex('validators')
      .select(
        'validators.pro_tx_hash as pro_tx_hash',
        'validators.id',
        this.knex('blocks')
          .count('*')
          .whereRaw('blocks.validator = validators.pro_tx_hash')
          .as('proposed_blocks_amount'),
        this.knex('blocks')
          .select('hash')
          .whereRaw('pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('proposed_block_hash'),
        this.knex('blocks')
          .select(this.knex.raw('SUM(state_transitions.gas_used) OVER () as total_collected_fees'))
          .leftJoin('state_transitions', 'blocks.hash', 'state_transitions.block_hash')
          .whereRaw('pro_tx_hash = blocks.validator')
          .limit(1)
          .as('total_collected_reward'),
        this.knex('blocks')
          .select(this.knex.raw('SUM(state_transitions.gas_used) OVER () as total_collected_reward_by_epoch'))
          .leftJoin('state_transitions', 'blocks.hash', 'state_transitions.block_hash')
          .whereRaw('pro_tx_hash = blocks.validator')
          .andWhere('blocks.timestamp', '>=', new Date(start).toISOString())
          .andWhere('blocks.timestamp', '<=', new Date(end).toISOString())
          .limit(1)
          .as('total_collected_reward_by_epoch')
      )
      .whereILike('validators.pro_tx_hash', proTxHash)
      .as('validators')

    const subquery = this.knex(validatorsSubquery)
      .select(
        'pro_tx_hash',
        'id',
        'proposed_blocks_amount',
        'blocks.hash as block_hash',
        'blocks.height as latest_height',
        'blocks.timestamp as latest_timestamp',
        'blocks.l1_locked_height as l1_locked_height',
        'blocks.app_version as app_version',
        'blocks.block_version as block_version',
        'total_collected_reward',
        'total_collected_reward_by_epoch'
      )
      .leftJoin('blocks', 'blocks.hash', 'proposed_block_hash')
      .as('blocks')

    const [row] = await this.knex(subquery)
      .select(
        'id',
        'pro_tx_hash',
        'proposed_blocks_amount',
        'block_hash',
        'latest_height',
        'latest_timestamp',
        'l1_locked_height',
        'app_version',
        'block_version',
        'total_collected_reward',
        'total_collected_reward_by_epoch'
      )

    if (!row) {
      return null
    }

    return Validator.fromRow(row)
  }

  getValidators = async (page, limit, order, isActive, validators, start, end) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const validatorsSubquery = this.knex('validators')
      .select(
        'validators.pro_tx_hash as pro_tx_hash',
        'validators.id',
        this.knex('validators')
          .modify(function (knex) {
            if (isActive !== undefined && isActive) {
              knex.whereIn('pro_tx_hash', validators.map(validator => validator.pro_tx_hash))
            } else if (isActive !== undefined && !isActive) {
              knex.whereNotIn('pro_tx_hash', validators.map(validator => validator.pro_tx_hash))
            }
          })
          .count('pro_tx_hash').as('total_count'),
        this.knex('blocks')
          .count('*')
          .whereRaw('blocks.validator = validators.pro_tx_hash')
          .as('proposed_blocks_amount'),
        this.knex('blocks')
          .select('hash')
          .whereRaw('pro_tx_hash = blocks.validator')
          .orderBy('height', 'desc')
          .limit(1)
          .as('proposed_block_hash'),
        this.knex('blocks')
          .select(this.knex.raw('SUM(state_transitions.gas_used) OVER () as total_collected_fees'))
          .leftJoin('state_transitions', 'blocks.hash', 'state_transitions.block_hash')
          .whereRaw('pro_tx_hash = blocks.validator')
          .limit(1)
          .as('total_collected_reward'),
        this.knex('blocks')
          .select(this.knex.raw('SUM(state_transitions.gas_used) OVER () as total_collected_reward_by_epoch'))
          .leftJoin('state_transitions', 'blocks.hash', 'state_transitions.block_hash')
          .whereRaw('pro_tx_hash = blocks.validator')
          .andWhere('blocks.timestamp', '>=', new Date(start).toISOString())
          .andWhere('blocks.timestamp', '<=', new Date(end).toISOString())
          .limit(1)
          .as('total_collected_reward_by_epoch')
      )
      .as('validators')

    const subquery = this.knex(validatorsSubquery)
      .select(
        'pro_tx_hash',
        'id',
        'total_count',
        'total_collected_reward',
        'proposed_blocks_amount',
        'total_collected_reward_by_epoch',
        this.knex.raw(`rank() over (order by validators.id ${order}) as rank`),
        'blocks.hash as block_hash',
        'blocks.height as latest_height',
        'blocks.timestamp as latest_timestamp',
        'blocks.l1_locked_height as l1_locked_height',
        'blocks.app_version as app_version',
        'blocks.block_version as block_version'
      )
      .modify(function (knex) {
        if (isActive !== undefined && isActive) {
          knex.whereIn('pro_tx_hash', validators.map(validator => validator.pro_tx_hash))
        } else if (isActive !== undefined && !isActive) {
          knex.whereNotIn('pro_tx_hash', validators.map(validator => validator.pro_tx_hash))
        }
      })
      .leftJoin('blocks', 'blocks.hash', 'proposed_block_hash')
      .as('blocks')

    const rows = await this.knex(subquery)
      .select(
        'id',
        'rank',
        'total_count',
        'pro_tx_hash',
        'total_collected_reward',
        'proposed_blocks_amount',
        'total_collected_reward_by_epoch',
        'block_hash',
        'latest_height',
        'latest_timestamp',
        'l1_locked_height',
        'app_version',
        'block_version',
      )
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map((row) => Validator.fromRow(row))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getValidatorStatsByProTxHash = async (proTxHash, timespan) => {
    const interval = {
      '1h': {offset: '1 hour', step: '5 minute'},
      '24h': {offset: '24 hour', step: '2 hour'},
      '3d': {offset: '3 day', step: '6 hour'},
      '1w': {offset: '1 week', step: '14 hour'}
    }[timespan]

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(now() - interval '${interval.offset}', now(), interval  '${interval.step}') date_to`))
      .select('date_to', this.knex.raw('LAG(date_to, 1) over (order by date_to asc) date_from'))

    const rows = await this.knex.with('ranges', ranges)
      .select(this.knex.raw(`COALESCE(date_from, now() - interval '${interval.offset}') date_from`), 'date_to')
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .whereILike('validator', proTxHash)
          .count('*')
          .as('blocks_count')
      )
      .from('ranges')

    return rows
      .slice(1)
      .map(row => ({
        timestamp: row.date_from,
        data: {
          blocksCount: parseInt(row.blocks_count)
        }
      }))
      .map(({timestamp, data}) => new SeriesData(timestamp, data))
  }
}
