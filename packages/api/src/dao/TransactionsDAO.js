const Transaction = require('../models/Transaction')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')

module.exports = class TransactionsDAO {
  constructor (knex) {
    this.knex = knex
  }

  getTransactionByHash = async (hash) => {
    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
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

    return Transaction.fromRow(row)
  }

  getTransactions = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const subquery = this.knex('state_transitions')
      .select(this.knex('state_transitions').count('hash').as('total_count'), 'state_transitions.hash as tx_hash',
        'state_transitions.data as data', 'state_transitions.type as type', 'state_transitions.index as index',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status', 'state_transitions.error as error',
        'state_transitions.block_hash as block_hash', 'state_transitions.id as id', 'state_transitions.owner as owner')
      .select(this.knex.raw(`rank() over (order by state_transitions.id ${order}) rank`))
      .select('aliases')
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'state_transitions.owner')
      .as('state_transitions')

    const rows = await this.knex(subquery)
      .select('total_count', 'data', 'type', 'index', 'rank', 'block_hash', 'state_transitions.tx_hash as tx_hash',
        'gas_used', 'status', 'error', 'blocks.height as block_height', 'blocks.timestamp as timestamp', 'owner', 'aliases')
      .leftJoin('blocks', 'blocks.hash', 'block_hash')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('state_transitions.id', order)
    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map((row) => Transaction.fromRow(row))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getHistorySeries = async (start, end, interval) => {
    const startSql = `'${start.toISOString()}'::timestamptz`

    const endSql = `'${end.toISOString()}'::timestamptz`

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(${startSql}, ${endSql}, '${interval}'::interval) date_to`))
      .select('date_to', this.knex.raw('LAG(date_to, 1) over (order by date_to asc) date_from'))

    const rows = await this.knex.with('ranges', ranges)
      .select(this.knex.raw(`COALESCE(date_from, date_to - interval '${interval}'::interval) date_from`), 'date_to')
      .select(
        this.knex('state_transitions')
          .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
          .whereRaw('blocks.timestamp > date_from and blocks.timestamp <= date_to')
          .count('*')
          .as('tx_count')
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
      .slice(1)
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
