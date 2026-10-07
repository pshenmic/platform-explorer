const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')
const ValidatorEarnings = require('../models/ValidatorEarnings')
const { IDENTITY_CREDIT_WITHDRAWAL } = require('../enums/StateTransitionEnum')
const { base58 } = require('@scure/base')

module.exports = class ValidatorsDAO {
  constructor (knex) {
    this.knex = knex
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
          .whereRaw('blocks.validator_id = validators.id')
          .as('proposed_blocks_amount'),
        this.knex('blocks')
          .select('hash')
          .whereRaw('blocks.validator_id = validators.id')
          .orderBy('height', 'desc')
          .limit(1)
          .as('proposed_block_hash'),
        this.knex('platform_rewards')
          .sum('amount')
          .whereRaw('platform_rewards.pro_tx_hash = validators.pro_tx_hash')
          .as('total_collected_reward'),
        // the first block of the current epoch pays the previous one
        Number.isInteger(Number(currentEpoch.firstBlockHeight))
          ? this.knex('platform_rewards')
            .sum('amount')
            .whereRaw('platform_rewards.pro_tx_hash = validators.pro_tx_hash')
            .andWhere('platform_rewards.block_height', '>=', Number(currentEpoch.firstBlockHeight))
            .as('total_collected_reward_by_epoch')
          : this.knex.raw('NULL as total_collected_reward_by_epoch')
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
        'blocks.quorum_hash as quorum_hash',
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
        'quorum_hash',
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
      ...validator
    })
  }

  getValidatorsHashes = async () => {
    const rows = await this.knex('validators')
      .select('pro_tx_hash')

    return rows.map(r => r.pro_tx_hash)
  }

  getValidators = async (page, limit, order, isActive, activeValidators, isBanned, validatorsWithoutBan, owner, blocksProposedMin, blocksProposedMax, lastProposedBlockHeightMin, lastProposedBlockHeightMax, lastProposedBlockTimestampStart, lastProposedBlockTimestampEnd, lastProposedBlockHash) => {
    const fromRank = ((page - 1) * limit)

    const proTxHash = owner ? Buffer.from(base58.decode(owner)).toString('hex') : null

    let blocksProposedQueryString = ''
    let lastProposedBlockHeightQueryString = ''
    let lastProposedBlockTimestampStartQueryString = ''

    const blocksProposedQueryBindings = []
    const lastProposedBlockHeightQueryBindings = []
    const lastProposedBlockTimestampStartQueryBinding = []

    let filtersQuery = ''
    const filtersBindings = []

    if (blocksProposedMin) {
      blocksProposedQueryString = 'COALESCE(proposed_blocks_amount,0) >= ?'
      blocksProposedQueryBindings.push(blocksProposedMin)
    }
    if (blocksProposedMax) {
      blocksProposedQueryString = blocksProposedQueryString === '' ? 'COALESCE(proposed_blocks_amount,0) <= ?' : 'COALESCE(proposed_blocks_amount,0) between ? and ?'
      blocksProposedQueryBindings.push(blocksProposedMax)
    }

    if (lastProposedBlockHeightMin) {
      lastProposedBlockHeightQueryString = 'COALESCE(latest_height,0) >= ?'
      lastProposedBlockHeightQueryBindings.push(lastProposedBlockHeightMin)
    }
    if (lastProposedBlockHeightMax) {
      lastProposedBlockHeightQueryString = lastProposedBlockHeightQueryString === '' ? 'COALESCE(latest_height,0) <= ?' : 'COALESCE(latest_height,0) between ? and ?'
      lastProposedBlockHeightQueryBindings.push(lastProposedBlockHeightMax)
    }

    if (lastProposedBlockTimestampStart) {
      lastProposedBlockTimestampStartQueryString = 'latest_timestamp >= ?'
      lastProposedBlockTimestampStartQueryBinding.push(new Date(lastProposedBlockTimestampStart).toISOString())
    }
    if (lastProposedBlockTimestampEnd) {
      lastProposedBlockTimestampStartQueryString = lastProposedBlockTimestampStartQueryString === '' ? 'latest_timestamp <= ?' : 'latest_timestamp between ? and ?'
      lastProposedBlockTimestampStartQueryBinding.push(new Date(lastProposedBlockTimestampEnd).toISOString())
    }

    if (lastProposedBlockHash) {
      filtersQuery = filtersQuery !== '' ? filtersQuery + ' and LOWER(block_hash) = ?' : 'LOWER(block_hash) = ?'
      filtersBindings.push(lastProposedBlockHash.toLowerCase())
    }

    const validatorsSubquery = this.knex('validators')
      .select(
        'validators.pro_tx_hash as pro_tx_hash',
        'validators.id'
      )
      .as('validators')

    if (proTxHash) {
      validatorsSubquery.whereILike('pro_tx_hash', proTxHash)
    }

    const subquery = this.knex(validatorsSubquery)
      .select(
        'pro_tx_hash',
        'id'
      )
      .modify(function (knex) {
        if (isActive !== undefined && isActive) {
          knex.whereIn('pro_tx_hash', activeValidators.map(validator => validator.pro_tx_hash))
        } else if (isActive !== undefined && !isActive) {
          knex.whereNotIn('pro_tx_hash', activeValidators.map(validator => validator.pro_tx_hash))
        }
      })
      .modify(function (knex) {
        if (isBanned !== undefined && isBanned) {
          knex
            .whereNotIn('pro_tx_hash', validatorsWithoutBan.map(validator => validator.proTxHash.toUpperCase()))
          // banned validator cannot be active
          knex
            .whereNotIn('pro_tx_hash', activeValidators.map(validator => validator.pro_tx_hash))
        } else if (isBanned !== undefined && !isBanned) {
          knex.whereIn('pro_tx_hash', validatorsWithoutBan.map(validator => validator.proTxHash.toUpperCase()))
        }
      })

    const blocksSubquery = this.knex('blocks')
      .select(
        'blocks.validator_id as validator_id'
      )
      .select(this.knex.raw('MAX(height) AS max_height'))
      .select(this.knex.raw('count(height) as proposed_blocks_amount'))
      .groupBy('blocks.validator_id')
      .as('blocks_subquery')

    const joinedBlocksSubqeury = this.knex(blocksSubquery)
      .select(
        'hash as block_hash', 'height as latest_height', 'timestamp as latest_timestamp',
        'l1_locked_height', 'max_height', 'app_version', 'block_version', 'app_hash',
        'quorum_hash', 'proposed_blocks_amount', 'blocks_subquery.validator_id'
      )
      .leftJoin('blocks', 'height', 'max_height')

    const joinedSubquery = this.knex
      .with('subquery', subquery)
      .with('blocks_subquery', joinedBlocksSubqeury)
      .select(
        'block_hash', 'latest_height', 'latest_timestamp', 'l1_locked_height',
        'app_version', 'block_version', 'app_hash', 'quorum_hash', 'id', 'pro_tx_hash',
        this.knex.raw('COALESCE(proposed_blocks_amount, 0) as proposed_blocks_amount')
      )
      .leftJoin('blocks_subquery', 'subquery.id', 'blocks_subquery.validator_id')
      .whereRaw(filtersQuery, filtersBindings)
      .whereRaw(blocksProposedQueryString, blocksProposedQueryBindings)
      .whereRaw(lastProposedBlockHeightQueryString, lastProposedBlockHeightQueryBindings)
      .whereRaw(lastProposedBlockTimestampStartQueryString, lastProposedBlockTimestampStartQueryBinding)
      .from('subquery')

    const filteredSubquery = this.knex
      .with('subquery', joinedSubquery)
      .select(
        'pro_tx_hash', 'block_hash',
        'latest_height', 'latest_timestamp', 'l1_locked_height',
        'app_version', 'block_version', 'app_hash', 'quorum_hash', 'proposed_blocks_amount'
      )
      .select(this.knex('subquery').select(this.knex.raw('COUNT(id)')).limit(1).as('total_count'))
      .offset(fromRank)
      .orderBy('id', order)
      .from('subquery')

    if (limit > 0) {
      filteredSubquery.limit(limit)
    }

    const rows = await filteredSubquery

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

  getValidatorIncomeStatsByProTxHash = async (proTxHash, start, end, interval, intervalInMs) => {
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
          .count('*')
          .as('proposed_blocks_count')
      )
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .count('*')
          .as('total_blocks_count')
      )
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .sum('gas_used')
          .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
          .as('collected_fees')
      )
      .from('ranges')

    return rows
      .slice(1)
      .map(row => {
        const proposedBlocksCount = parseInt(row.proposed_blocks_count ?? 0)
        const totalBlocksCount = parseInt(row.total_blocks_count ?? 0)
        const collectedFees = parseInt(row.collected_fees ?? 0)

        // fees collected in an epoch are distributed between validators
        // proportionally to the number of blocks they proposed
        const income = totalBlocksCount > 0
          ? Math.floor(collectedFees * proposedBlocksCount / totalBlocksCount)
          : 0

        return {
          timestamp: row.date_from,
          data: {
            income
          }
        }
      })
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

  // An epoch lasts from its first block to the first block of the next one, the reward is null
  // until the epoch is paid. Consecutive epochs are grouped into the intervals count points
  getValidatorEpochStatsByProTxHash = async (proTxHash, start, end, intervalsCount) => {
    const validator = this.knex('validators')
      .select('id', 'pro_tx_hash')
      .whereILike('pro_tx_hash', proTxHash)

    const bounds = this.knex.select(
      this.knex.raw('COALESCE((?), 0) as first_epoch', [this.getBlockAt(start).select('epoch')]),
      this.knex.raw('(?) as last_epoch', [this.getBlockAt(end).select('epoch')])
    )

    const epochs = this.knex('blocks')
      .select(
        'epoch',
        this.knex.raw('MIN(timestamp) as start_time'),
        this.knex.raw('MAX(height) as last_height'),
        this.knex.raw('COUNT(*) as total_blocks'),
        this.knex.raw('COUNT(*) FILTER (WHERE validator_id = (SELECT id FROM validator)) as blocks_proposed')
      )
      .whereRaw('epoch BETWEEN (SELECT first_epoch FROM bounds) AND (SELECT last_epoch FROM bounds)')
      .groupBy('epoch')

    const fees = this.knex('blocks')
      .select('blocks.epoch', this.knex.raw('SUM(state_transitions.gas_used) as fees'))
      .join('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
      .whereRaw('blocks.validator_id = (SELECT id FROM validator)')
      .whereRaw('blocks.epoch BETWEEN (SELECT first_epoch FROM bounds) AND (SELECT last_epoch FROM bounds)')
      .groupBy('blocks.epoch')

    const rewards = this.knex('platform_rewards')
      .select('epoch', this.knex.raw('COALESCE(SUM(amount) FILTER (WHERE pro_tx_hash = (SELECT pro_tx_hash FROM validator)), 0) as reward'))
      .whereRaw('epoch BETWEEN (SELECT first_epoch FROM bounds) AND (SELECT last_epoch FROM bounds)')
      .groupBy('epoch')

    const points = this.knex('epochs')
      .select(
        'epochs.*',
        'next_blocks.timestamp as end_time',
        this.knex.raw('COALESCE(fees.fees, 0) as fees'),
        'rewards.reward',
        this.knex.raw('NTILE(?) OVER (ORDER BY epochs.epoch) as point', [intervalsCount])
      )
      .leftJoin('fees', 'fees.epoch', 'epochs.epoch')
      .leftJoin('rewards', 'rewards.epoch', 'epochs.epoch')
      .leftJoin('blocks as next_blocks', 'next_blocks.height', this.knex.raw('epochs.last_height + 1'))

    const rows = await this.knex
      .with('validator', validator)
      .with('bounds', bounds)
      .with('epochs', epochs)
      .with('fees', fees)
      .with('rewards', rewards)
      .with('points', points)
      .select(
        this.knex.raw('MIN(epoch) as epoch'),
        this.knex.raw('MAX(epoch) as end_epoch'),
        this.knex.raw('MIN(start_time) as start_time'),
        this.knex.raw('(ARRAY_AGG(end_time ORDER BY epoch DESC))[1] as end_time'),
        this.knex.raw('SUM(blocks_proposed) as blocks_proposed'),
        this.knex.raw('SUM(total_blocks) as total_blocks'),
        this.knex.raw('SUM(fees) as fees'),
        this.knex.raw('SUM(reward) as reward')
      )
      .from('points')
      .groupBy('point')
      .orderBy('point', 'asc')

    return rows.map(row => new SeriesData(row.start_time.toISOString(), {
      epoch: row.epoch,
      endEpoch: row.end_epoch,
      endTime: row.end_time?.toISOString() ?? null,
      blocksProposed: Number(row.blocks_proposed),
      totalBlocks: Number(row.total_blocks),
      fees: Number(row.fees),
      reward: row.reward !== null ? Number(row.reward) : null
    }))
  }

  // Earnings are counted by the blocks of the period: Core payments by the Core blocks
  // they chain locked, Platform rewards by the epochs they paid
  getValidatorEarningsByProTxHash = async (proTxHash, start, end) => {
    const validator = this.knex('validators')
      .select('id', 'pro_tx_hash')
      .whereILike('pro_tx_hash', proTxHash)

    const bounds = this.knex.select(
      this.knex.raw('COALESCE((?), 0) as start_height', [this.getBlockAt(start).select('height')]),
      this.knex.raw('COALESCE((?), 0) as start_l1_locked_height', [this.getBlockAt(start).select('l1_locked_height')]),
      this.knex.raw('COALESCE((?), 0) as end_height', [this.getBlockAt(end).select('height')]),
      this.knex.raw('COALESCE((?), 0) as end_l1_locked_height', [this.getBlockAt(end).select('l1_locked_height')])
    )

    const corePayments = this.knex('core_payments')
      .select(this.knex.raw('COUNT(*) as core_payments'), this.knex.raw('SUM(amount) as core_amount'))
      .whereRaw('pro_tx_hash = (SELECT pro_tx_hash FROM validator)')
      .whereRaw('core_block_height > (SELECT start_l1_locked_height FROM bounds)')
      .whereRaw('core_block_height <= (SELECT end_l1_locked_height FROM bounds)')

    const rewards = this.knex('platform_rewards')
      .select('epoch', 'amount')
      .whereRaw('pro_tx_hash = (SELECT pro_tx_hash FROM validator)')
      .whereRaw('block_height > (SELECT start_height FROM bounds)')
      .whereRaw('block_height <= (SELECT end_height FROM bounds)')

    const platformRewards = this.knex('rewards')
      .select(
        this.knex.raw('COUNT(*) as epochs'),
        this.knex.raw('MIN(epoch) as first_epoch'),
        this.knex.raw('MAX(epoch) as last_epoch'),
        this.knex.raw('SUM(amount) as reward'),
        this.knex('blocks')
          .count('*')
          .whereRaw('blocks.validator_id = (SELECT id FROM validator)')
          .whereIn('epoch', this.knex('rewards').select('epoch'))
          .as('blocks_proposed')
      )

    const [row] = await this.knex
      .with('validator', validator)
      .with('bounds', bounds)
      .with('core', corePayments)
      .with('rewards', rewards)
      .with('platform', platformRewards)
      .select('core.*', 'platform.*')
      .from('validator')
      .crossJoin('core')
      .crossJoin('platform')

    if (!row) {
      return null
    }

    return ValidatorEarnings.fromRow(row)
  }

  // What every masternode was paid in the last indexed Core blocks
  getCorePaymentsByMasternode = async (coreBlocks) => {
    const rows = await this.knex('core_payments')
      .select(
        'pro_tx_hash',
        this.knex.raw('SUM(amount) as amount'),
        this.knex.raw('MIN(MIN(core_block_height)) OVER () as first_height'),
        this.knex.raw('MAX(MAX(core_block_height)) OVER () as last_height')
      )
      .whereRaw('core_block_height > (SELECT MAX(core_block_height) FROM core_payments) - ?', [coreBlocks])
      .groupBy('pro_tx_hash')

    if (!rows.length) {
      return null
    }

    return {
      firstHeight: rows[0].first_height,
      lastHeight: rows[0].last_height,
      amounts: new Map(rows.map(row => [row.pro_tx_hash, Number(row.amount)]))
    }
  }

  // The last block at the time
  getBlockAt = (timestamp) => this.knex('blocks')
    .where('timestamp', '<=', timestamp.toISOString())
    .orderBy('timestamp', 'desc')
    .limit(1)
}
