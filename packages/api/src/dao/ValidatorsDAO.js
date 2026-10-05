const Validator = require('../models/Validator')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')
const { IDENTITY_CREDIT_WITHDRAWAL } = require('../enums/StateTransitionEnum')
const { base58 } = require('@scure/base')
const { EPOCH_STATS_MAX_POINTS } = require('../constants')

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

  // Epochs come from the blocks: an epoch starts with its first block and ends
  // with the first block of the next one. The reward is null until the epoch is paid,
  // and for the epochs Platform paid before it started to keep their finalized info
  getValidatorEpochStatsByProTxHash = async (proTxHash, start, end) => {
    const validator = await this.knex('validators')
      .select('id', 'pro_tx_hash')
      .whereILike('pro_tx_hash', proTxHash)
      .first()

    if (!validator) {
      return null
    }

    const rows = await this.knex('blocks')
      .select(
        'blocks.epoch',
        this.knex.raw('MIN(blocks.timestamp) as start_time'),
        this.knex.raw('(SELECT next_blocks.timestamp FROM blocks AS next_blocks WHERE next_blocks.height = MAX(blocks.height) + 1) as end_time'),
        this.knex.raw('COUNT(DISTINCT blocks.hash) as total_blocks'),
        this.knex.raw('COUNT(DISTINCT blocks.hash) FILTER (WHERE blocks.validator_id = ?) as blocks_proposed', [validator.id]),
        this.knex.raw('COALESCE(SUM(state_transitions.gas_used) FILTER (WHERE blocks.validator_id = ?), 0) as fees', [validator.id]),
        this.knex.raw('(SELECT CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(amount) FILTER (WHERE pro_tx_hash = ?), 0) END FROM platform_rewards WHERE platform_rewards.epoch = blocks.epoch) as reward', [validator.pro_tx_hash])
      )
      .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
      .whereRaw('blocks.epoch >= COALESCE((?), 0)', [this.getEpochAt(start)])
      .andWhereRaw('blocks.epoch <= (?)', [this.getEpochAt(end)])
      .groupBy('blocks.epoch')
      .orderBy('blocks.epoch', 'asc')

    // long intervals group consecutive epochs to keep the series within the chart points
    const groupSize = Math.max(1, Math.ceil(rows.length / EPOCH_STATS_MAX_POINTS))

    return Array.from({ length: Math.ceil(rows.length / groupSize) }, (_, i) => rows.slice(i * groupSize, (i + 1) * groupSize))
      .map(group => {
        const first = group[0]
        const last = group.at(-1)
        const rewards = group.filter(row => row.reward !== null)

        return new SeriesData(first.start_time.toISOString(), {
          epoch: first.epoch,
          endEpoch: last.epoch,
          endTime: last.end_time?.toISOString() ?? null,
          blocksProposed: group.reduce((sum, row) => sum + Number(row.blocks_proposed), 0),
          totalBlocks: group.reduce((sum, row) => sum + Number(row.total_blocks), 0),
          fees: group.reduce((sum, row) => sum + Number(row.fees), 0),
          reward: rewards.length ? rewards.reduce((sum, row) => sum + Number(row.reward), 0) : null
        })
      })
  }

  // Earnings are counted by the blocks of the period: Core payments by the Core blocks
  // they chain locked, Platform rewards by the epochs they paid
  getValidatorEarningsByProTxHash = async (proTxHash, start, end) => {
    const validator = await this.knex('validators')
      .select('id', 'pro_tx_hash')
      .whereILike('pro_tx_hash', proTxHash)
      .first()

    if (!validator) {
      return null
    }

    const lastBlockAt = (timestamp) => this.knex('blocks')
      .where('timestamp', '<=', timestamp.toISOString())
      .orderBy('timestamp', 'desc')
      .limit(1)

    const [corePayments] = await this.knex('core_payments')
      .count('* as payments')
      .sum('amount as amount')
      .where('pro_tx_hash', validator.pro_tx_hash)
      .andWhere('core_block_height', '>', this.knex.raw('COALESCE((?), 0)', [lastBlockAt(start).select('l1_locked_height')]))
      .andWhere('core_block_height', '<=', this.knex.raw('COALESCE((?), 0)', [lastBlockAt(end).select('l1_locked_height')]))

    const platformRewards = this.knex('platform_rewards')
      .select('epoch', 'amount')
      .where('pro_tx_hash', validator.pro_tx_hash)
      .andWhere('block_height', '>', this.knex.raw('COALESCE((?), 0)', [lastBlockAt(start).select('height')]))
      .andWhere('block_height', '<=', this.knex.raw('COALESCE((?), 0)', [lastBlockAt(end).select('height')]))

    const [platform] = await this.knex
      .with('rewards', platformRewards)
      .select(
        this.knex.raw('COUNT(*) as epochs'),
        this.knex.raw('MIN(epoch) as first_epoch'),
        this.knex.raw('MAX(epoch) as last_epoch'),
        this.knex.raw('SUM(amount) as reward'),
        this.knex('blocks')
          .count('*')
          .where('validator_id', validator.id)
          .whereIn('epoch', this.knex('rewards').select('epoch'))
          .as('blocks_proposed')
      )
      .from('rewards')

    return {
      core: {
        payments: Number(corePayments.payments),
        amount: Number(corePayments.amount ?? 0)
      },
      platform: {
        epochs: Number(platform.epochs),
        firstEpoch: platform.first_epoch,
        lastEpoch: platform.last_epoch,
        blocksProposed: Number(platform.blocks_proposed),
        reward: Number(platform.reward ?? 0)
      }
    }
  }

  // Whether Platform paid any epoch during the interval, tells missing rewards from no rewards
  hasPlatformRewards = async (start, end) => {
    const lastBlockAt = (timestamp) => this.knex('blocks')
      .select('height')
      .where('timestamp', '<=', timestamp.toISOString())
      .orderBy('timestamp', 'desc')
      .limit(1)

    const reward = await this.knex('platform_rewards')
      .select('id')
      .where('block_height', '>', this.knex.raw('COALESCE((?), 0)', [lastBlockAt(start)]))
      .andWhere('block_height', '<=', this.knex.raw('COALESCE((?), 0)', [lastBlockAt(end)]))
      .first()

    return reward !== undefined
  }

  // What every masternode was paid in the last indexed Core blocks
  getCorePaymentsByMasternode = async (coreBlocks) => {
    const [range] = await this.knex('core_payments')
      .min('core_block_height as first')
      .max('core_block_height as last')

    if (range.last === null) {
      return null
    }

    const firstHeight = Math.max(range.last - coreBlocks + 1, range.first)

    const rows = await this.knex('core_payments')
      .select('pro_tx_hash')
      .sum('amount as amount')
      .where('core_block_height', '>=', firstHeight)
      .groupBy('pro_tx_hash')

    return {
      firstHeight,
      lastHeight: range.last,
      amounts: new Map(rows.map(row => [row.pro_tx_hash, Number(row.amount)]))
    }
  }

  getEpochAt = (timestamp) => this.knex('blocks')
    .select('epoch')
    .where('timestamp', '<=', timestamp.toISOString())
    .orderBy('timestamp', 'desc')
    .limit(1)
}
