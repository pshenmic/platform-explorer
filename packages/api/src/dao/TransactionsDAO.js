const Transaction = require('../models/Transaction')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')
const {getAliasFromDocument} = require('../utils')
const StateTransitionEnum = require('../enums/StateTransitionEnum')
const BatchEnum = require('../enums/BatchEnum')
const {DPNS_CONTRACT} = require('../constants')

module.exports = class TransactionsDAO {
  constructor(knex, sdk) {
    this.knex = knex
    this.sdk = sdk
  }

  getTransactionByHash = async (hash) => {
    const [row] = await this.knex('state_transitions')
      .select(
        'state_transitions.hash as tx_hash', 'state_transitions.data as data',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status',
        'state_transitions.error as error', 'state_transitions.type as type', 'state_transitions.batch_type as batch_type',
        'state_transitions.index as index', 'blocks.height as block_height',
        'blocks.hash as block_hash', 'blocks.timestamp as timestamp', 'state_transitions.owner as owner'
      )
      .whereILike('state_transitions.hash', hash)
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')

    if (!row) {
      return null
    }

    const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.owner.trim()]], 1)

    const aliases = []

    if (aliasDocument) {
      aliases.push(getAliasFromDocument(aliasDocument))
    }

    return Transaction.fromRow(
      {
        ...row,
        type: StateTransitionEnum[row.type],
        aliases
      })
  }

  getTransactions = async (page, limit, order, orderBy, transactionsTypes, batchTypes, owner, status, min, max, timestampStart, timestampEnd) => {
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
      filtersQuery = filtersQuery + `${filtersQuery !== '' ? ' and' : ''}` +
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

    if (timestampStart && timestampEnd) {
      timestampsQuery = 'blocks.timestamp between ? and ?'
      timestampBindings.push(timestampStart, timestampEnd)
    }

    const subquery = this.knex('state_transitions')
      .select('state_transitions.hash as tx_hash',
        'data', 'type', 'index', 'batch_type',
        'gas_used', 'status', 'error',
        'block_hash', 'id', 'owner',
        'blocks.height as block_height',
        'blocks.timestamp as timestamp'
      )
      .whereRaw(timestampsQuery, timestampBindings)
      .whereRaw(filtersQuery, filtersBindings)
      .leftJoin('blocks', 'blocks.hash', 'block_hash')

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

    const resultSet = await Promise.all(rows.map(async (row) => {
      const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.owner.trim()]], 1)

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
      .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks_sub.hash')
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
      .map(({timestamp, data}) => new SeriesData(timestamp, data))
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
      .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks_sub.hash')
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
      .map(({timestamp, data}) => new SeriesData(timestamp, data))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  getCollectedFees = async (timespan) => {
    const interval = {
      '1h': {offset: '1 hour', step: '5 minute'},
      '24h': {offset: '24 hour', step: '2 hour'},
      '3d': {offset: '3 day', step: '6 hour'},
      '1w': {offset: '1 week', step: '14 hour'}
    }[timespan]

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(now() - interval '${interval.offset}', now(), interval  '${interval.step}') date_to`))
      .select('date_to', this.knex.raw('LAG(date_to, 1) over (order by date_to asc) date_from'))

    const subquery = this.knex.with('ranges', ranges)
      .select(
        this.knex('state_transitions')
          .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
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

  getTransactionsByIds = async (ids) => {
    const rows = await this.knex('state_transitions')
      .select(
        'state_transitions.hash as tx_hash', 'state_transitions.data as data',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status',
        'state_transitions.error as error', 'state_transitions.type as type', 'state_transitions.batch_type as batch_type',
        'state_transitions.index as index', 'blocks.height as block_height',
        'blocks.hash as block_hash', 'blocks.timestamp as timestamp', 'state_transitions.owner as owner'
      )
      .whereIn('state_transitions.id', ids)
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')

    return Promise.all(rows.map(async (row) => {
      const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.owner.trim()]], 1)

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return Transaction.fromRow(
        {
          ...row,
          type: StateTransitionEnum[row.type],
          aliases
        })
    }))
  }
}
