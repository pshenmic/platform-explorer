const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')
const { IDENTITY_CREDIT_WITHDRAWAL } = require('../enums/StateTransitionEnum')
const { base58 } = require('@scure/base')

module.exports = class ValidatorsDAO {
  constructor (knex, dapi) {
    this.knex = knex
    this.dapi = dapi
  }

  getValidatorByProTxHash = async (proTxHash, currentEpoch) => {
    const identifier = base58.encode(Buffer.from(proTxHash, 'hex'))

    const withdrawalsSubquery = this.knex('state_transitions')
      .select(
        'state_transitions.id as state_transition_id',
        'state_transitions.hash as tx_hash',
        'state_transitions.block_hash as block_hash'
      )
      .where('state_transitions.owner', '=', identifier)
      .andWhere('state_transitions.type', '=', IDENTITY_CREDIT_WITHDRAWAL)
      .orderBy('state_transition_id', 'desc')

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
          .andWhere('blocks.timestamp', '>=', new Date(currentEpoch.startTime).toISOString())
          .andWhere('blocks.timestamp', '<=', new Date(currentEpoch.endTime).toISOString())
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
        'blocks.app_hash as app_hash',
        'total_collected_reward',
        'total_collected_reward_by_epoch'
      )
      .leftJoin('blocks', 'blocks.hash', 'proposed_block_hash')
      .as('blocks')

    const [row] = await this.knex(subquery)
      .select(
        'id',
        'app_hash',
        'pro_tx_hash',
        'proposed_blocks_amount',
        'block_hash',
        'latest_height',
        'latest_timestamp',
        'l1_locked_height',
        'app_version',
        'block_version',
        'total_collected_reward',
        'total_collected_reward_by_epoch',
        this.knex.with('subquery_alias', withdrawalsSubquery)
          .count('tx_hash')
          .from('subquery_alias')
          .as('withdrawals_count'),
        this.knex.with('subquery_alias', withdrawalsSubquery)
          .select('tx_hash')
          .from('subquery_alias')
          .limit(1)
          .as('last_withdrawal'),
        this.knex.with('subquery_alias', withdrawalsSubquery)
          .select('blocks.timestamp')
          .from('subquery_alias')
          .limit(1)
          .leftJoin('blocks', 'blocks.hash', 'subquery_alias.block_hash')
          .as('last_withdrawal_time')
      )

    if (!row) {
      return null
    }

    const validator = Validator.fromRow(row)


    return Validator.fromObject({
      ...validator,
    })
  }

  getValidators = async (page, limit, order, isActive, validators, currentEpoch) => {
    const fromRank = ((page - 1) * limit)

    const validatorsSubquery = this.knex('validators')
      .select(
        'validators.pro_tx_hash as pro_tx_hash',
        'validators.id'
      )
      .as('validators')

    const subquery = this.knex(validatorsSubquery)
      .select(
        'pro_tx_hash',
        'id'
      )
      .modify(function (knex) {
        if (isActive !== undefined && isActive) {
          knex.whereIn('pro_tx_hash', validators.map(validator => validator.pro_tx_hash))
        } else if (isActive !== undefined && !isActive) {
          knex.whereNotIn('pro_tx_hash', validators.map(validator => validator.pro_tx_hash))
        }
      })

    const limitedSubquery = this.knex
      .with('subquery', subquery)
      .select(
        'id',
        'pro_tx_hash'
      )
      .select(this.knex('subquery').select(this.knex.raw('COUNT(id) over ()')).limit(1).as('total_count'))
      .offset(fromRank)
      .orderBy('id', order)
      .from('subquery')

    if (limit > 0) {
      limitedSubquery.limit(limit)
    }

    const blocksSubquery = this.knex('subquery')
      .select(
        'blocks.validator', 'subquery.id as validator_id', 'hash', 'app_hash',
        'height', 'l1_locked_height', 'app_version', 'block_version',
        'blocks.timestamp'
      )
      .leftJoin('blocks', 'blocks.validator_id', 'subquery.id')

    const rows = await this.knex
      .with('subquery', limitedSubquery)
      .with('blocks_subquery', blocksSubquery)
      .select(
        'total_count', 'pro_tx_hash', 'block_hash',
        'latest_height', 'latest_timestamp', 'l1_locked_height',
        'app_version', 'block_version', 'app_hash'
      )
      .select(
        this.knex('blocks_subquery')
          .select(this.knex.raw('count(hash) over ()'))
          .whereRaw('validator_id = subquery.id')
          .limit(1)
          .as('proposed_blocks_amount')
      )
      .joinRaw(
        `LEFT JOIN LATERAL 
        (
          SELECT 
            hash as block_hash,  height as latest_height,
            timestamp as latest_timestamp, l1_locked_height,
            app_version, block_version, app_hash
          FROM blocks_subquery b
          WHERE b.validator_id = subquery.id
          ORDER BY height desc
          LIMIT 1
        ) as blocks_subquery ON TRUE`
      )
      .from('subquery')

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map((row) => Validator.fromRow(row))

    return new PaginatedResultSet(resultSet, page, limit ?? resultSet.length, totalCount)
  }

  getValidatorStatsByProTxHash = async (proTxHash, start, end, interval, intervalInMs) => {
    const startSql = `'${new Date(start.getTime() + intervalInMs).toISOString()}'::timestamptz`

    const endSql = `'${new Date(end.getTime()).toISOString()}'::timestamptz`

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select('date_to', this.knex.raw(`LAG(date_to, 1, '${start.toISOString()}'::timestamptz) over (order by date_to asc) date_from`))

    const rows = await this.knex.with('ranges', ranges)
      .select('date_from')
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .whereILike('validator', proTxHash)
          .count('*')
          .as('blocks_count')
      )
      .from('ranges')

    return rows
      .map(row => ({
        timestamp: row.date_from,
        data: {
          blocksCount: parseInt(row.blocks_count)
        }
      }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
  }

  getValidatorRewardStatsByProTxHash = async (proTxHash, start, end, interval, intervalInMs) => {
    const startSql = `'${new Date(start.getTime()).toISOString()}'::timestamptz`

    const endSql = `'${end.toISOString()}'::timestamptz`

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select('date_to', this.knex.raw(`LAG(date_to, 1, '${start.toISOString()}'::timestamptz) over (order by date_to asc) date_from`))

    const rows = await this.knex.with('ranges', ranges)
      .select('date_from')
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .whereILike('validator', proTxHash)
          .sum('gas_used')
          .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
          .as('gas_used')
      )
      .from('ranges')

    return rows
      .slice(1)
      .map(row => ({
        timestamp: row.date_from,
        data: {
          reward: parseInt(row.gas_used ?? 0)
        }
      }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
  }
}
