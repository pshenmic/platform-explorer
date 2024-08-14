const Block = require('../models/Block')
const PaginatedResultSet = require('../models/PaginatedResultSet')

module.exports = class BlockDAO {
  constructor (knex) {
    this.knex = knex
  }

  getStats = async () => {
    const rows = await this.knex
      .select(this.knex('state_transitions').count('*').as('tx_count'))
      .select(this.knex('transfers').count('*').as('transfers_count'))
      .select(this.knex('data_contracts').count('*').as('data_contracts_count'))
      .select(this.knex('documents').count('*').as('documents_count'))
      .select(this.knex('identities').count('*').as('identities_count'))

    const [row] = rows

    const {
      tx_count: txCount,
      transfers_count: transfersCount,
      data_contracts_count: dataContractsCount,
      documents_count: documentsCount,
      identities_count: identitiesCount
    } = row

    return {
      transactionsCount: parseInt(txCount),
      transfersCount: parseInt(transfersCount),
      dataContractsCount: parseInt(dataContractsCount),
      documentsCount: parseInt(documentsCount),
      identitiesCount: parseInt(identitiesCount)
    }
  }

  getBlockByHash = async (blockHash) => {
    const results = await this.knex
      .select('blocks.hash as hash', 'state_transitions.hash as st_hash', 'blocks.height as height', 'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version', 'blocks.l1_locked_height as l1_locked_height', 'blocks.validator as validator')
      .from('blocks')
      .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
      .where('blocks.hash', blockHash)

    const [block] = results

    if (!block) {
      return null
    }

    const txs = results.reduce((acc, value) => value.st_hash ? [...acc, value.st_hash] : acc, [])

    return Block.fromRow({ header: block, txs })
  }

  getBlocksByValidator = async (validator, page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('blocks')
      .select(
        'blocks.hash as hash',
        'blocks.height as height',
        'blocks.timestamp as timestamp',
        'blocks.block_version as block_version',
        'blocks.app_version as app_version',
        'blocks.l1_locked_height as l1_locked_height',
        'blocks.validator as validator',
        this.knex.raw(`rank() over (partition by blocks.validator order by blocks.height ${order}) as rank`)
      )
      .where('blocks.validator', validator)
      .as('blocks')

    const rows = await this.knex(subquery)
      .select(this.knex('blocks').count('height').as('total_count').where('blocks.validator', validator),
        'blocks.hash as hash', 'height', 'timestamp', 'block_version',
        'app_version', 'l1_locked_height', 'state_transitions.hash as st_hash', 'validator')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('blocks.height', order)
      .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const blocksMap = rows.reduce((blocks, row) => {
      const block = blocks[row.hash]
      const { st_hash: txHash } = row
      const txs = block?.txs || []

      if (txHash) {
        txs.push(txHash)
      }

      return { ...blocks, [row.hash]: { ...row, txs } }
    }, {})

    const resultSet = Object.keys(blocksMap).map(blockHash => Block.fromRow({
      header: blocksMap[blockHash], txs: blocksMap[blockHash].txs
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getBlockByHeight = async (height) => {
    const results = await this.knex
      .select('blocks.hash as hash', 'state_transitions.hash as st_hash', 'blocks.height as height', 'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version', 'blocks.l1_locked_height as l1_locked_height', 'blocks.validator as validator')
      .from('blocks')
      .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
      .where('blocks.height', height)

    const [block] = results

    if (!block) {
      return null
    }

    const txs = results.reduce((acc, value) => value.st_hash ? [...acc, value.st_hash] : acc, [])

    return Block.fromRow({ header: block, txs })
  }

  getBlocks = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('blocks')
      .select(this.knex('blocks').count('height').as('total_count'),
        'blocks.hash as hash', 'blocks.height as height', 'blocks.timestamp as timestamp',
        'blocks.block_version as block_version', 'blocks.app_version as app_version',
        'blocks.l1_locked_height as l1_locked_height', 'blocks.validator as validator')
      .select(this.knex.raw(`rank() over (order by blocks.height ${order}) rank`))
      .as('blocks')

    const rows = await this.knex(subquery)
      .select('rank', 'total_count', 'blocks.hash as hash', 'height', 'timestamp', 'block_version',
        'app_version', 'l1_locked_height', 'state_transitions.hash as st_hash', 'validator')
      .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('blocks.height', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    // map-reduce Blocks with Transactions
    const blocksMap = rows.reduce((blocks, row) => {
      const block = blocks[row.hash]
      const { st_hash: txHash } = row
      const txs = block?.txs || []

      if (txHash) {
        txs.push(txHash)
      }

      return { ...blocks, [row.hash]: { ...row, txs } }
    }, {})

    const resultSet = Object.keys(blocksMap).map(blockHash => Block.fromRow({
      header: blocksMap[blockHash], txs: blocksMap[blockHash].txs
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
