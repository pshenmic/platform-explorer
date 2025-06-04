const Transaction = require('../models/Transaction')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')
const { getAliasInfo, getAliasStateByVote } = require('../utils')

module.exports = class TransactionsDAO {
  constructor (knex, dapi) {
    this.knex = knex
    this.dapi = dapi
  }

  getTransactionByHash = async (hash) => {
    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier',
        this.knex.raw(`
          array_agg(
            json_build_object(
              'alias', alias,
              'timestamp', timestamp::timestamptz,
              'tx', state_transition_hash
            )
          ) as aliases
        `)
      )
      .groupBy('identity_identifier')
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transition_hash')
      .leftJoin('blocks', 'block_hash', 'blocks.hash')
      .as('aliases')

    const [row] = await this.knex('state_transitions')
      .select(
        'state_transitions.hash as tx_hash', 'state_transitions.data as data',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status',
        'state_transitions.error as error', 'state_transitions.type as type', 'state_transitions.batch_type as batch_type',
        'state_transitions.index as index', 'blocks.height as block_height',
        'blocks.hash as block_hash', 'blocks.timestamp as timestamp', 'state_transitions.owner as owner',
        'aliases.aliases as aliases'
      )
      .whereILike('state_transitions.hash', hash)
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'owner')

    if (!row) {
      return null
    }

    const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
      const aliasInfo = await getAliasInfo(alias.alias, this.dapi)

      return getAliasStateByVote(aliasInfo, alias, row.owner)
    }))

    return Transaction.fromRow({ ...row, aliases })
  }

  getTransactions = async (page, limit, order, orderBy, transactionsTypes, owner, status, min, max, timestampStart, timestampEnd) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    let filtersQuery = ''
    const filtersBindings = []

    let timestampsQuery = ''
    const timestampBindings = []

    if (transactionsTypes) {
      // Currently knex cannot digest an array of numbers correctly
      // https://github.com/knex/knex/issues/2060
      filtersQuery = transactionsTypes.length > 1 ? `type in (${transactionsTypes.join(',')})` : `type = ${transactionsTypes[0]}`
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

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier')
      .select(this.knex.raw(`
          array_agg(
            json_build_object(
              'alias', alias,
              'tx', state_transition_hash
            )
          ) as aliases
        `))
      .groupBy('identity_identifier')
      .as('aliases')

    const filtersSubquery = this.knex('state_transitions')
      .select('state_transitions.hash as tx_hash', 'state_transitions.data as data',
        'state_transitions.type as type', 'state_transitions.index as index', 'state_transitions.batch_type as batch_type',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status', 'state_transitions.error as error',
        'state_transitions.block_hash as block_hash', 'state_transitions.id as id', 'state_transitions.owner as owner')
      .whereRaw(filtersQuery, filtersBindings)
      .as('filters_subquery')

    const subquery = this.knex(filtersSubquery)
      .select('tx_hash', 'aliases',
        'data', 'type', 'index', 'batch_type',
        'gas_used', 'status', 'error',
        'block_hash', 'id', 'owner',
        'identity_identifier',
        'blocks.height as block_height',
        'blocks.timestamp as timestamp'
      )
      .whereRaw(timestampsQuery, timestampBindings)
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'filters_subquery.owner')
      .leftJoin('blocks', 'blocks.hash', 'block_hash')
      .orderBy(orderBy, order)

    const calculatingSubquery = this.knex
      .with('subquery', subquery)
      .select('tx_hash', 'aliases',
        'data', 'type', 'index', 'batch_type',
        'gas_used', 'status', 'error',
        'block_hash', 'id', 'owner',
        'identity_identifier',
        'block_height', 'timestamp'
      )
      .select(this.knex.raw(`row_number() over (order by ${orderBy} ${order}) rank`))
      .select(this.knex('subquery').count('*').as('total_count'))
      .from('subquery')
      .as('calculated_subquery')

    const rows = await this.knex(calculatingSubquery)
      .select(
        'data', 'type', 'index', 'owner', 'aliases', 'batch_type',
        'rank', 'block_hash', 'tx_hash', 'total_count',
        'gas_used', 'status', 'error', 'timestamp', 'block_height')
      .whereBetween('rank', [fromRank, toRank])

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias.alias, this.dapi)

        return getAliasStateByVote(aliasInfo, alias, row.owner)
      }))

      return Transaction.fromRow({ ...row, aliases })
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getHistorySeries = async (start, end, interval, intervalInMs) => {
    const startSql = `'${new Date(start.getTime() + intervalInMs).toISOString()}'::timestamptz`

    const endSql = `'${new Date(end.getTime()).toISOString()}'::timestamptz`

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select(
        'date_to',
        this.knex.raw(`LAG(date_to, 1, '${start.toISOString()}'::timestamptz) OVER (ORDER BY date_to) AS date_from`)
      )

    const blocksSubquery = this.knex('blocks')
      .whereRaw('blocks.timestamp > (SELECT MIN(date_from) FROM ranges) AND blocks.timestamp <= (SELECT MAX(date_to) FROM ranges)')
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
      .orderBy('date_from', 'asc')
      .leftJoin('blocks', 'blocks.height', 'block_height')

    return rows
      .map(row => ({
        timestamp: row.date_from,
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
      .select('date_to', this.knex.raw(`LAG(date_to, 1, '${start.toISOString()}'::timestamptz) over (order by date_to asc) date_from`))

    const blocksSubquery = this.knex('blocks')
      .whereRaw('blocks.timestamp > (SELECT MIN(date_from) FROM ranges) AND blocks.timestamp <= (SELECT MAX(date_to) FROM ranges)')
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
      .orderBy('date_from', 'asc')
      .leftJoin('blocks', 'blocks.height', 'block_height')

    return rows
      .map(row => ({
        timestamp: row.date_from,
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
}
