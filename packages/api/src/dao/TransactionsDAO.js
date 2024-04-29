const Transaction = require('../models/Transaction')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const SeriesData = require('../models/SeriesData')

module.exports = class TransactionsDAO {
  constructor (knex) {
    this.knex = knex
  }

  getTransactionByHash = async (hash) => {
    const [row] = await this.knex('state_transitions')
      .select('state_transitions.hash as tx_hash', 'state_transitions.data as data',
        'state_transitions.type as type', 'state_transitions.index as index', 'blocks.height as block_height',
        'blocks.hash as block_hash', 'blocks.timestamp as timestamp')
      .where('state_transitions.hash', hash)
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')

    if (!row) {
      return null
    }

    return Transaction.fromRow(row)
  }

  getTransactions = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('state_transitions')
      .select(this.knex('state_transitions').count('hash').as('total_count'), 'state_transitions.hash as tx_hash',
        'state_transitions.data as data', 'state_transitions.type as type', 'state_transitions.index as index',
        'state_transitions.block_hash as block_hash', 'state_transitions.id as id')
      .select(this.knex.raw(`rank() over (order by state_transitions.id ${order}) rank`))
      .as('state_transitions')

    const rows = await this.knex(subquery)
      .select('total_count', 'data', 'type', 'index', 'rank', 'block_hash', 'state_transitions.tx_hash as tx_hash',
        'blocks.height as block_height', 'blocks.timestamp as timestamp')
      .leftJoin('blocks', 'blocks.hash', 'block_hash')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('state_transitions.id', order)
    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map((row) => Transaction.fromRow(row))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getHistorySeries = async (timespan) => {
    const interval = {
      '1h': {offset: '1 hour', step: '5 minute'},
      '24h': {offset: '24 hour', step: '2 hour'},
      '3d': {offset: '3 day', step: '6 hour'},
      '1w': {offset: '1 week', step: '14 hour'},
    }[timespan]

    const ranges = this.knex
      .from(this.knex.raw(`generate_series(now() - interval \'${interval.offset}\', now(), interval  '${interval.step}') date_to`))
      .select('date_to', this.knex.raw('LAG(date_to, 1) over (order by date_to asc) date_from'))

    const rows = await this.knex.with('ranges', ranges)
      .select(this.knex.raw(`COALESCE(date_from, now() - interval \'${interval.offset}\') date_from`), 'date_to')
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
      .from('ranges')

    return rows
      .slice(1)
      .map(row => ({ timestamp: row.date_from, data: { txs: parseInt(row.tx_count) } }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
  }
}
