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
              'timestamp', timestamp
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
        'state_transitions.error as error', 'state_transitions.type as type',
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

  getTransactions = async (page, limit, order, transactionsTypes, owner, status, min, max) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    let filtersQuery = ''
    const filtersBindings = []

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

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const filtersSubquery = this.knex('state_transitions')
      .select(this.knex('state_transitions').count('hash').as('total_count'), 'state_transitions.hash as tx_hash',
        'state_transitions.data as data', 'state_transitions.type as type', 'state_transitions.index as index',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status', 'state_transitions.error as error',
        'state_transitions.block_hash as block_hash', 'state_transitions.id as id', 'state_transitions.owner as owner')
      .whereRaw(filtersQuery, filtersBindings)
      .as('state_transitions')

    const subquery = this.knex(filtersSubquery)
      .select('tx_hash', 'total_count',
        'data', 'type', 'index',
        'gas_used', 'status', 'error',
        'block_hash', 'id', 'owner',
        'identity_identifier', 'aliases'
      )
      .select(this.knex.raw(`rank() over (order by state_transitions.id ${order}) rank`))
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'state_transitions.owner')
      .as('state_transitions')

    const rows = await this.knex(subquery)
      .select('total_count', 'data', 'type', 'index', 'rank', 'block_hash', 'state_transitions.tx_hash as tx_hash',
        'gas_used', 'status', 'error', 'blocks.height as block_height', 'blocks.timestamp as timestamp', 'owner', 'aliases')
      .leftJoin('blocks', 'blocks.hash', 'block_hash')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('state_transitions.id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias, this.dapi)

        return getAliasStateByVote(aliasInfo, { alias }, row.owner)
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
      .select('date_to', this.knex.raw(`LAG(date_to, 1, '${start.toISOString()}'::timestamptz) over (order by date_to asc) date_from`))

    const rows = await this.knex.with('ranges', ranges)
      .select('date_from')
      .select(
        this.knex('state_transitions')
          .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .count('*')
          .as('tx_count')
      )
      .select(
        this.knex('state_transitions')
          .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .sum('gas_used')
          .as('gas_used')
      )
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .select('hash')
          .orderBy('blocks.height')
          .limit(1)
          .as('block_hash')
      )
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .select('height')
          .orderBy('height')
          .limit(1)
          .as('block_height')
      )
      .from('ranges')

    return rows
      .map(row => ({
        timestamp: row.date_from,
        data: {
          txs: parseInt(row.tx_count),
          blockHeight: row.block_height,
          blockHash: row.block_hash
        }
      }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
  }

  getGasHistorySeries = async (start, end, interval, intervalInMs) => {
    const startSql = `'${new Date(start.getTime() + intervalInMs).toISOString()}'::timestamptz`

    const endSql = `'${new Date(end.getTime()).toISOString()}'::timestamptz`

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select('date_to', this.knex.raw(`LAG(date_to, 1, '${start.toISOString()}'::timestamptz) over (order by date_to asc) date_from`))

    const rows = await this.knex.with('ranges', ranges)
      .select('date_from')
      .select(
        this.knex('state_transitions')
          .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .sum('gas_used')
          .as('gas')
      )
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .select('hash')
          .orderBy('blocks.height')
          .limit(1)
          .as('block_hash')
      )
      .select(
        this.knex('blocks')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .select('height')
          .orderBy('height')
          .limit(1)
          .as('block_height')
      )
      .from('ranges')

    return rows
      .map(row => ({
        timestamp: row.date_from,
        data: {
          gas: parseInt(row.gas),
          blockHeight: row.block_height,
          blockHash: row.block_hash
        }
      }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
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
