const Transaction = require('../models/Transaction')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')
const { getAliasFromDocument, getAliasDocumentForIdentifier, getAliasDocumentForIdentifiers } = require('../utils')
const StateTransitionEnum = require('../enums/StateTransitionEnum')
const BatchEnum = require('../enums/BatchEnum')
const { SHIELD_IN_TYPES, SHIELD_OUT_TYPES, getShieldedDirection } = require('../enums/ShieldedTransitionEnum')

module.exports = class TransactionsDAO {
  constructor (knex, sdk) {
    this.knex = knex
    this.sdk = sdk
  }

  getTransactionByHash = async (hash) => {
    const duplicatesSubquery = this.knex('state_transition_duplicates')
      .leftJoin({ dup_blocks: 'blocks' }, this.knex.raw('UPPER(state_transition_duplicates.block_hash) = dup_blocks.hash'))
      .whereRaw('LOWER(state_transition_duplicates.hash) = LOWER(state_transitions.hash)')
      .select(this.knex.raw("json_agg(json_build_object('block_hash', dup_blocks.hash, 'block_height', dup_blocks.height, 'timestamp', dup_blocks.timestamp))"))

    const [row] = await this.knex('state_transitions')
      .select(
        'state_transitions.hash as tx_hash', 'state_transitions.data as data',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status',
        'state_transitions.error as error', 'state_transitions.type as type', 'state_transitions.batch_type as batch_type',
        'state_transitions.index as index', 'blocks.height as block_height',
        'blocks.hash as block_hash', 'blocks.timestamp as timestamp', 'state_transitions.owner as owner',
        'shielded_transitions.amount as shielded_amount'
      )
      .select(duplicatesSubquery.as('duplicates'))
      .whereILike('state_transitions.hash', hash)
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin('shielded_transitions', 'shielded_transitions.state_transition_id', 'state_transitions.id')

    if (!row) {
      return null
    }

    const aliasDocument = row.owner ? await getAliasDocumentForIdentifier(row.owner.trim(), this.sdk) : undefined

    const aliases = []

    if (aliasDocument) {
      aliases.push(getAliasFromDocument(aliasDocument))
    }

    const duplicates = row.duplicates
      ? row.duplicates.map(dup => Transaction.fromRow({
        ...row,
        block_hash: dup.block_hash,
        block_height: dup.block_height,
        timestamp: dup.timestamp ? new Date(dup.timestamp) : null,
        type: StateTransitionEnum[row.type],
        batch_type: BatchEnum[row.batch_type],
        status: 'FAIL',
        aliases,
        duplicates: null
      }))
      : undefined

    const transaction = Transaction.fromRow(
      {
        ...row,
        type: StateTransitionEnum[row.type],
        aliases,
        duplicates
      })

    transaction.shielded = row.shielded_amount != null
      ? {
          amount: String(row.shielded_amount),
          direction: getShieldedDirection(row.type)
        }
      : null

    return transaction
  }

  getTransactions = async (page, limit, order, orderBy, transactionsTypes, batchTypes, owner, status, min, max, timestampStart, timestampEnd, tokenName) => {
    const fromRank = ((page - 1) * limit)

    let filtersQuery = ''
    const filtersBindings = []

    let timestampsQuery = ''
    const timestampBindings = []

    if (transactionsTypes) {
      // Currently knex cannot digest an array of numbers correctly
      // https://github.com/knex/knex/issues/2060
      filtersQuery = transactionsTypes.length > 1 ? `type in (${transactionsTypes.join(',')})` : `type = ${transactionsTypes[0]}`
    }

    if (batchTypes) {
      // Currently knex cannot digest an array of numbers correctly
      // https://github.com/knex/knex/issues/2060
      filtersQuery = filtersQuery + `${filtersQuery !== '' ? ' and ' : ''}` +
        (batchTypes.length > 1
          ? `batch_type in (${batchTypes.join(',')})`
          : `batch_type = ${batchTypes[0]}`)
    }

    if (owner) {
      filtersBindings.push(owner)
      filtersQuery = filtersQuery !== '' ? filtersQuery + ' and owner = ?' : 'owner = ?'
    }

    if (status !== 'ALL') {
      filtersBindings.push(status)
      filtersQuery = filtersQuery !== '' ? filtersQuery + ' and status = ?' : 'status = ?'
    }

    if (min) {
      filtersBindings.push(min)
      filtersQuery = filtersQuery !== '' ? filtersQuery + ' and gas_used >= ?' : 'gas_used >= ?'
    }

    if (max) {
      filtersBindings.push(max)
      filtersQuery = filtersQuery !== '' ? filtersQuery + ' and gas_used <= ?' : 'gas_used <= ?'
    }

    if (timestampStart) {
      timestampsQuery = 'blocks.timestamp >= ?'
      timestampBindings.push(timestampStart)
    }
    if (timestampEnd) {
      timestampsQuery = timestampsQuery === '' ? 'blocks.timestamp >= ?' : 'blocks.timestamp between ? and ?'
      timestampBindings.push(timestampEnd)
    }

    const transactionSubquery = tokenName
      ? this.knex('tokens')
        .select(
          'state_transitions.hash', 'data', 'type', 'index', 'batch_type', 'state_transitions.owner',
          'gas_used', 'status', 'error', 'block_hash', 'block_height', 'state_transitions.id')
        .whereILike('name', tokenName)
        .leftJoin('token_transitions', 'token_identifier', 'identifier')
        .leftJoin('state_transitions', 'token_transitions.state_transition_hash', 'state_transitions.hash')
        .whereRaw('state_transitions.id is not null')
      : this.knex('state_transitions')

    const subquery = this.knex(transactionSubquery.as('state_transitions_subquery'))
      .select('state_transitions_subquery.hash as tx_hash',
        'block_hash', 'id', 'owner', 'block_height',
        'data', 'type', 'index', 'batch_type',
        'gas_used', 'status', 'error',
        'blocks.timestamp as timestamp'
      )
      .whereRaw(timestampsQuery, timestampBindings)
      .whereRaw(filtersQuery, filtersBindings)
      .leftJoin('blocks', 'blocks.height', 'block_height')

    const sortedSubquery = this.knex
      .with('subquery', subquery)
      .select('tx_hash',
        'data', 'type', 'index', 'batch_type',
        'gas_used', 'status', 'error',
        'block_hash', 'id', 'owner',
        'block_height', 'timestamp'
      )
      .offset(fromRank)
      .limit(limit)
      .orderBy(orderBy, order)
      .from('subquery')
      .as('sorted_subquery')

    const rows = await this.knex(sortedSubquery)
      .select('tx_hash',
        'data', 'type', 'index', 'batch_type',
        'gas_used', 'status', 'error',
        'block_hash', 'id', 'owner',
        'block_height', 'timestamp',
        'total_count.total_count')
      .join(this.knex.with('subquery', subquery).select(this.knex.raw('count(*) over () as total_count')).limit(1).from('subquery').as('total_count'), this.knex.raw(true), '=', this.knex.raw(true))

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const owners = rows.filter(row => row.owner).map(row => row.owner.trim())

    const aliasDocuments = await getAliasDocumentForIdentifiers(owners, this.sdk)

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliasDocument = row.owner ? aliasDocuments[row.owner.trim()] : undefined

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return Transaction.fromRow({
        ...row,
        type: StateTransitionEnum[row.type],
        batch_type: BatchEnum[row.batch_type],
        aliases
      })
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getHistorySeries = async (start, end, interval, intervalInMs) => {
    const startSql = `'${new Date(start.getTime() + intervalInMs).toISOString()}'::timestamptz`

    const endSql = `'${new Date(end.getTime()).toISOString()}'::timestamptz`

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select('date_to')
      .select(
        this.knex.raw(
          'LAG(date_to, 1, ?::timestamptz) OVER (ORDER BY date_to ASC) AS date_from',
          [start.toISOString()]
        )
      )

    const subRanges = this.knex('ranges')
      .select(this.knex.raw('min(date_from) as min_date'))
      .select(this.knex.raw('max(date_to) as max_date'))
      .limit(1)

    const blocksSubquery = this.knex('blocks')
      .with('sub_ranges', subRanges)
      .whereRaw('blocks.timestamp > (SELECT min_date FROM sub_ranges) AND blocks.timestamp <= (SELECT max_date FROM sub_ranges)')
      .as('blocks_sub')

    const dataSubquery = this.knex(blocksSubquery)
      .leftJoin('state_transitions', 'state_transitions.block_height', 'blocks_sub.height')
      .select('blocks_sub.timestamp', 'state_transitions.gas_used', 'blocks_sub.hash', 'blocks_sub.height')

    const heightSubquery = this.knex
      .with('ranges', ranges)
      .with(
        'filtered_data',
        dataSubquery
      )
      .select('date_from')
      .select(this.knex.raw('count(gas_used) as tx_count'))
      .select(this.knex.raw('min(height) as block_height'))
      .leftJoin('filtered_data', function () {
        this.on('timestamp', '>', 'date_from').andOn('timestamp', '<=', 'date_to')
      })
      .from('ranges')
      .groupBy('date_from')
      .as('sub')

    const rows = await this.knex(heightSubquery)
      .select('tx_count', 'block_height', 'hash as block_hash', 'date_from')
      .leftJoin('blocks', function () {
        this.on('blocks.height', '=', 'block_height').andOnNotNull('block_height')
      })

    return rows
      .map(row => ({
        timestamp: new Date(row.date_from).toISOString(),
        data: {
          txs: parseInt(row.tx_count ?? 0),
          blockHeight: row.block_height,
          blockHash: row.block_hash
        }
      }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  getGasHistorySeries = async (start, end, interval, intervalInMs) => {
    const startSql = `'${new Date(start.getTime() + intervalInMs).toISOString()}'::timestamptz`

    const endSql = `'${new Date(end.getTime()).toISOString()}'::timestamptz`

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select('date_to')
      .select(
        this.knex.raw(
          'LAG(date_to, 1, ?::timestamptz) OVER (ORDER BY date_to ASC) AS date_from',
          [start.toISOString()]
        )
      )

    const subRanges = this.knex('ranges')
      .select(this.knex.raw('min(date_from) as min_date'))
      .select(this.knex.raw('max(date_to) as max_date'))
      .limit(1)

    const blocksSubquery = this.knex('blocks')
      .with('sub_ranges', subRanges)
      .whereRaw('blocks.timestamp > (SELECT min_date FROM sub_ranges) AND blocks.timestamp <= (SELECT max_date FROM sub_ranges)')
      .as('blocks_sub')

    const dataSubquery = this.knex(blocksSubquery)
      .leftJoin('state_transitions', 'state_transitions.block_height', 'blocks_sub.height')
      .select('blocks_sub.timestamp', 'state_transitions.gas_used', 'blocks_sub.hash', 'blocks_sub.height')

    const heightSubquery = this.knex.with('ranges', ranges)
      .with(
        'filtered_data',
        dataSubquery
      )
      .select('date_from')
      .select(this.knex.raw('sum(gas_used) as gas'))
      .select(this.knex.raw('min(height) as block_height'))
      .leftJoin('filtered_data', function () {
        this.on('timestamp', '>', 'date_from').andOn('timestamp', '<=', 'date_to')
      })
      .from('ranges')
      .groupBy('date_from')
      .as('sub')

    const rows = await this.knex(heightSubquery)
      .select('gas', 'block_height', 'hash as block_hash', 'date_from')
      .leftJoin('blocks', function () {
        this.on('blocks.height', '=', 'block_height').andOnNotNull('block_height')
      })

    return rows
      .map(row => ({
        timestamp: new Date(row.date_from).toISOString(),
        data: {
          gas: parseInt(row.gas ?? 0),
          blockHeight: row.block_height,
          blockHash: row.block_hash
        }
      }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  getCollectedFees = async (timespan) => {
    const interval = {
      '1h': { offset: '1 hour', step: '5 minute' },
      '24h': { offset: '24 hour', step: '2 hour' },
      '3d': { offset: '3 day', step: '6 hour' },
      '1w': { offset: '1 week', step: '14 hour' }
    }[timespan]

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(now() - interval '${interval.offset}', now(), interval  '${interval.step}') date_to`))
      .select('date_to', this.knex.raw('LAG(date_to, 1) over (order by date_to asc) date_from'))

    const subquery = this.knex.with('ranges', ranges)
      .select(
        this.knex('state_transitions')
          .leftJoin('blocks', 'state_transitions.block_height', 'blocks.height')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .sum('gas_used as collected_fees')
          .as('collected_fees')
      )
      .from('ranges')
      .as('subquery')

    const [row] = await this.knex(subquery)
      .select(
        this.knex.raw('SUM(collected_fees) OVER () as total_collected_fees')
      )

    return Number(row.total_collected_fees ?? 0)
  }

  getDuplicatedTransactions = async (page, limit, order) => {
    const fromRank = (page - 1) * limit

    const groupedSubquery = this.knex('state_transition_duplicates')
      .select('hash as tx_hash')
      .select(this.knex.raw('count(block_hash) as duplicates_count'))
      .select(this.knex.raw('count(*) over () as total_count'))
      .min('id as min_id')
      .groupBy('hash')
      .orderBy('min_id', order)
      .limit(limit)
      .offset(fromRank)
      .as('grouped_subquery')

    const rows = await this.knex(groupedSubquery)
      .select(
        'tx_hash', 'state_transitions.data as data', 'state_transitions.gas_used as gas_used',
        'state_transitions.error as error', 'state_transitions.type as type', 'state_transitions.batch_type as batch_type',
        'state_transitions.index as index', 'blocks.height as block_height',
        'blocks.hash as block_hash', 'blocks.timestamp as timestamp', 'state_transitions.owner as owner',
        'grouped_subquery.total_count as total_count'
      )
      .select(this.knex.raw('\'FAIL\' as status'))
      .leftJoin(
        'state_transitions',
        this.knex.raw('LOWER(state_transitions.hash) = LOWER(tx_hash)')
      )
      .leftJoin(
        'state_transition_duplicates',
        this.knex.raw('state_transition_duplicates.hash = tx_hash')
      )
      .leftJoin(
        'blocks',
        this.knex.raw('UPPER(state_transition_duplicates.block_hash) = blocks.hash')
      )
      .orderBy('grouped_subquery.min_id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const owners = rows.filter(row => row.owner).map(row => row.owner.trim())

    const aliasDocuments = await getAliasDocumentForIdentifiers(owners, this.sdk)

    const resultSet = rows.reduce((acc, row) => {
      const aliasDocument = row.owner ? aliasDocuments[row.owner.trim()] : undefined

      const aliases = aliasDocument ? [getAliasFromDocument(aliasDocument)] : []

      const duplicate = Transaction.fromRow({
        ...row,
        type: StateTransitionEnum[row.type],
        batch_type: BatchEnum[row.batch_type],
        aliases
      })

      const entry = acc.find(item => item.hash === row.tx_hash)

      if (entry) {
        entry.duplicates.push(duplicate)
      } else {
        acc.push(Transaction.fromRow({
          ...row,
          block_hash: null,
          block_height: null,
          timestamp: null,
          type: StateTransitionEnum[row.type],
          batch_type: BatchEnum[row.batch_type],
          aliases,
          duplicates: [duplicate]
        }))
      }

      return acc
    }, [])

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getShieldHistorySeries = async (start, end, interval, intervalInMs, direction) => {
    const startSql = `'${new Date(start.getTime() + intervalInMs).toISOString()}'::timestamptz`

    const endSql = `'${new Date(end.getTime()).toISOString()}'::timestamptz`

    const transitionTypes = direction === true ? SHIELD_IN_TYPES : SHIELD_OUT_TYPES

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select('date_to')
      .select(
        this.knex.raw(
          'LAG(date_to, 1, ?::timestamptz) OVER (ORDER BY date_to ASC) AS date_from',
          [start.toISOString()]
        )
      )

    const subRanges = this.knex('ranges')
      .select(this.knex.raw('min(date_from) as min_date'))
      .select(this.knex.raw('max(date_to) as max_date'))
      .limit(1)

    const blocksSubquery = this.knex('blocks')
      .with('sub_ranges', subRanges)
      .whereRaw('blocks.timestamp > (SELECT min_date FROM sub_ranges) AND blocks.timestamp <= (SELECT max_date FROM sub_ranges)')
      .as('blocks_sub')

    const shieldedTransitionsSubquery = this.knex('shielded_transitions')
      .whereIn('state_transition_type', transitionTypes)
      .leftJoin('state_transitions', 'shielded_transitions.state_transition_id', 'state_transitions.id')
      .as('shielded_transitions_subquery')

    const dataSubquery = this.knex(blocksSubquery)
      .leftJoin(shieldedTransitionsSubquery, 'shielded_transitions_subquery.block_height', 'blocks_sub.height')
      .select('blocks_sub.timestamp', 'shielded_transitions_subquery.amount', 'blocks_sub.hash', 'blocks_sub.height')

    const heightSubquery = this.knex.with('ranges', ranges)
      .with(
        'filtered_data',
        dataSubquery
      )
      .select('date_from')
      .select(this.knex.raw('sum(amount) as total_amount'))
      .select(this.knex.raw('min(height) as block_height'))
      .leftJoin('filtered_data', function () {
        this.on('timestamp', '>', 'date_from').andOn('timestamp', '<=', 'date_to')
      })
      .from('ranges')
      .groupBy('date_from')
      .as('sub')

    const rows = await this.knex(heightSubquery)
      .select('total_amount', 'block_height', 'hash as block_hash', 'date_from')
      .leftJoin('blocks', function () {
        this.on('blocks.height', '=', 'block_height').andOnNotNull('block_height')
      })

    return rows
      .map(row => ({
        timestamp: new Date(row.date_from).toISOString(),
        data: {
          amount: parseInt(row.total_amount ?? 0),
          blockHeight: row.block_height,
          blockHash: row.block_hash
        }
      }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  getFundsFlowHistorySeries = async (start, end, interval, intervalInMs, direction) => {
    const startSql = `'${new Date(start.getTime() + intervalInMs).toISOString()}'::timestamptz`

    const endSql = `'${new Date(end.getTime()).toISOString()}'::timestamptz`

    // amounts of core-chain <-> platform value transitions live in three
    // tables, each covering its own set of state transition types
    const transferTypes = direction === true
      ? [StateTransitionEnum.IDENTITY_CREATE, StateTransitionEnum.IDENTITY_TOP_UP]
      : [StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL]

    const addressTransitionTypes = direction === true
      ? [StateTransitionEnum.ADDRESS_FUNDING_FROM_ASSET_LOCK]
      : [StateTransitionEnum.ADDRESS_CREDIT_WITHDRAWAL]

    const shieldedTransitionTypes = direction === true
      ? [StateTransitionEnum.SHIELD_FROM_ASSET_LOCK]
      : [StateTransitionEnum.SHIELDED_WITHDRAWAL]

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select('date_to')
      .select(
        this.knex.raw(
          'LAG(date_to, 1, ?::timestamptz) OVER (ORDER BY date_to ASC) AS date_from',
          [start.toISOString()]
        )
      )

    const subRanges = this.knex('ranges')
      .select(this.knex.raw('min(date_from) as min_date'))
      .select(this.knex.raw('max(date_to) as max_date'))
      .limit(1)

    const blocksSubquery = this.knex('blocks')
      .with('sub_ranges', subRanges)
      .whereRaw('blocks.timestamp > (SELECT min_date FROM sub_ranges) AND blocks.timestamp <= (SELECT max_date FROM sub_ranges)')
      .as('blocks_sub')

    const transfersFlows = this.knex('transfers')
      .select('state_transitions.block_height', 'transfers.amount')
      .leftJoin('state_transitions', 'transfers.state_transition_hash', 'state_transitions.hash')
      .whereIn('state_transitions.type', transferTypes)

    const addressFlows = this.knex('platform_address_transitions')
      .select('state_transitions.block_height', 'platform_address_transitions.amount')
      .leftJoin('state_transitions', 'platform_address_transitions.state_transition_id', 'state_transitions.id')
      .whereIn('platform_address_transitions.state_transition_type', addressTransitionTypes)

    const shieldedFlows = this.knex('shielded_transitions')
      .select('state_transitions.block_height', 'shielded_transitions.amount')
      .leftJoin('state_transitions', 'shielded_transitions.state_transition_id', 'state_transitions.id')
      .whereIn('shielded_transitions.state_transition_type', shieldedTransitionTypes)

    const flowsSubquery = transfersFlows
      .unionAll([addressFlows, shieldedFlows], true)
      .as('flows_subquery')

    const dataSubquery = this.knex(blocksSubquery)
      .leftJoin(flowsSubquery, 'flows_subquery.block_height', 'blocks_sub.height')
      .select('blocks_sub.timestamp', 'flows_subquery.amount', 'blocks_sub.hash', 'blocks_sub.height')

    const heightSubquery = this.knex.with('ranges', ranges)
      .with(
        'filtered_data',
        dataSubquery
      )
      .select('date_from')
      .select(this.knex.raw('sum(amount) as total_amount'))
      .select(this.knex.raw('min(height) as block_height'))
      .leftJoin('filtered_data', function () {
        this.on('timestamp', '>', 'date_from').andOn('timestamp', '<=', 'date_to')
      })
      .from('ranges')
      .groupBy('date_from')
      .as('sub')

    const rows = await this.knex(heightSubquery)
      .select('total_amount', 'block_height', 'hash as block_hash', 'date_from')
      .leftJoin('blocks', function () {
        this.on('blocks.height', '=', 'block_height').andOnNotNull('block_height')
      })

    return rows
      .map(row => ({
        timestamp: new Date(row.date_from).toISOString(),
        data: {
          amount: parseInt(row.total_amount ?? 0),
          blockHeight: row.block_height,
          blockHash: row.block_hash
        }
      }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  getTransactionStatistic = async (timestampStart, timestampEnd) => {
    let query = this.knex('state_transitions')
      .select('type', 'batch_type')
      .groupBy('type', 'batch_type')
      .count()

    if (timestampStart && timestampEnd) {
      query = query
        .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
        .where('blocks.timestamp', '>=', new Date(timestampStart).toISOString())
        .andWhere('blocks.timestamp', '<=', new Date(timestampEnd).toISOString())
    }

    const rows = await query

    const statistic = rows.reduce((accumulator, row) => {
      const count = Number(row.count)

      const entry = accumulator[row.type] ?? {
        transactionType: StateTransitionEnum[row.type],
        count: 0,
        batchTypes: null
      }

      entry.count += count

      if (row.batch_type !== null) {
        entry.batchTypes = [
          ...entry.batchTypes ?? [],
          { batchType: BatchEnum[row.batch_type], count }
        ]
      }

      accumulator[row.type] = entry

      return accumulator
    }, {})

    return Object.values(statistic).map(entry => ({
      ...entry,
      // hide for non batch transitions
      batchTypes: entry.batchTypes?.sort((a, b) => b.count - a.count) ?? undefined
    }))
  }

  getShieldedStatistic = async (timestampStart, timestampEnd) => {
    let query = this.knex('shielded_transitions')
      .select('state_transition_type as type')
      .sum('amount as total_amount')
      .count('* as count')
      .groupBy('state_transition_type')

    if (timestampStart && timestampEnd) {
      query = query
        .leftJoin('state_transitions', 'state_transitions.id', 'shielded_transitions.state_transition_id')
        .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
        .where('blocks.timestamp', '>=', new Date(timestampStart).toISOString())
        .andWhere('blocks.timestamp', '<=', new Date(timestampEnd).toISOString())
    }

    const rows = await query

    let totalShieldedIn = 0n
    let totalShieldedOut = 0n
    let transitionsCount = 0

    const types = rows.map(row => {
      const amount = BigInt(row.total_amount ?? 0)
      const count = Number(row.count)

      transitionsCount += count

      if (SHIELD_IN_TYPES.includes(row.type)) {
        totalShieldedIn += amount
      } else if (SHIELD_OUT_TYPES.includes(row.type)) {
        totalShieldedOut += amount
      }

      return {
        transactionType: StateTransitionEnum[row.type],
        count,
        amount: amount.toString()
      }
    })

    return {
      totalShieldedIn: totalShieldedIn.toString(),
      totalShieldedOut: totalShieldedOut.toString(),
      transitionsCount,
      types
    }
  }
}
