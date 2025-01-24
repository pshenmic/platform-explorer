const Block = require('../models/Block')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { getAliasInfo, getAliasStateByVote } = require('../utils')
const Transaction = require('../models/Transaction')

module.exports = class BlockDAO {
  constructor (knex, dapi) {
    this.knex = knex
    this.dapi = dapi
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
    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier',
        this.knex.raw(`
          array_agg(
            json_build_object(
              'alias', alias,
              'timestamp', timestamp::timestamptz
            )
          ) as aliases
        `)
      )
      .groupBy('identity_identifier')
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transition_hash')
      .leftJoin('blocks', 'block_hash', 'blocks.hash')
      .as('aliases')

    const subquery = this.knex('blocks')
      .select(
        'blocks.hash as hash', 'state_transitions.hash as tx_hash',
        'blocks.height as height', 'blocks.timestamp as timestamp',
        'blocks.block_version as block_version', 'blocks.app_version as app_version',
        'blocks.l1_locked_height as l1_locked_height', 'blocks.validator as validator',
        'state_transitions.gas_used as gas_used', 'state_transitions.data as data',
        'state_transitions.status as status', 'state_transitions.owner as owner',
        'aliases.aliases as aliases', 'state_transitions.error as error', 'block_hash',
        'state_transitions.index as index', 'state_transitions.type as type', 'app_hash'
      )
      .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'state_transitions.owner')
      .whereILike('blocks.hash', blockHash)
      .orderBy('state_transitions.index', 'asc')
      .as('subquery')

    const rows = await this.knex(subquery)
      .select(
        'aliases', 'error', 'block_hash',
        'l1_locked_height', 'validator',
        'block_version', 'app_version',
        'index', 'type', 'app_hash',
        'height', 'timestamp',
        'gas_used', 'data',
        'hash', 'tx_hash',
        'status', 'owner'
      )
      .select(this.knex(subquery).sum('gas_used').as('total_gas_used'))

    const [block] = rows

    if (!block) {
      return null
    }

    const txs = block.tx_hash
      ? await Promise.all(rows.map(async (row) => {
        const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
          const aliasInfo = await getAliasInfo(alias.alias, this.dapi)

          return getAliasStateByVote(aliasInfo, alias, row.owner)
        }))

        return Transaction.fromRow({ ...row, aliases })
      }))
      : []

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
        'blocks.app_hash as app_hash',
        this.knex.raw(`rank() over (partition by blocks.validator order by blocks.height ${order}) as rank`)
      )
      .whereILike('blocks.validator', validator)
      .as('blocks')

    const rows = await this.knex(subquery)
      .select(this.knex('blocks').count('height').as('total_count').whereILike('blocks.validator', validator),
        'blocks.hash as hash', 'height', 'timestamp', 'block_version', 'app_hash',
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
      .select(
        'blocks.hash as hash', 'state_transitions.hash as st_hash', 'blocks.height as height',
        'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version',
        'blocks.l1_locked_height as l1_locked_height', 'blocks.validator as validator', 'blocks.app_hash as app_hash')
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

  getBlocks = async (
    page, limit, order,
    validator,
    gasMin, gasMax,
    heightMin, heightMax,
    startTimestamp, endTimestamp,
    epochStartTimestamp, epochEndTimestamp,
    transactionCountMin, transactionCountMax
  ) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const epochQuery = (epochStartTimestamp && epochEndTimestamp)
      ? [
          'timestamp BETWEEN ? AND ?',
          [new Date(epochStartTimestamp).toISOString(), new Date(epochEndTimestamp).toISOString()]
        ]
      : ['true']

    const heightQuery = heightMin
      ? [
          heightMax ? 'height BETWEEN ? AND ?' : 'height >= ?',
          heightMax ? [heightMin, heightMax] : [heightMin]
        ]
      : ['true']

    const timestampQuery = startTimestamp && endTimestamp
      ? [
          'timestamp BETWEEN ? AND ?',
          [new Date(startTimestamp).toISOString(), new Date(endTimestamp).toISOString()]
        ]
      : ['true']

    const validatorQuery = validator
      ? [
          'validator = ?',
          validator
        ]
      : ['true']

    const gasQuery = gasMin
      ? [
          gasMax ? 'total_gas_used BETWEEN ? AND ?' : 'total_gas_used >= ?',
          gasMax ? [gasMin, gasMax] : [gasMin]
        ]
      : ['true']

    const transactionsQuery = transactionCountMin
      ? [
          transactionCountMax ? 'cardinality(txs.txs) BETWEEN ? AND ?' : 'cardinality(txs.txs) >= ?',
          transactionCountMax ? [transactionCountMin, transactionCountMax] : [transactionCountMin]
        ]
      : ['true']

    const subquery = this.knex('blocks')
      .select(
        'blocks.hash as hash', 'blocks.height as height', 'blocks.timestamp as timestamp',
        'blocks.block_version as block_version', 'blocks.app_version as app_version',
        'blocks.l1_locked_height as l1_locked_height', 'blocks.validator as validator',
        'blocks.app_hash as app_hash'
      )
      .whereRaw(...epochQuery)
      .andWhereRaw(...heightQuery)
      .andWhereRaw(...timestampQuery)
      .andWhereRaw(...validatorQuery)
      .as('blocks')

    const transactionsSubquery = this.knex('state_transitions')
      .select('block_hash', this.knex.raw('sum(gas_used) as total_gas_used'), this.knex.raw('array_agg(hash) as txs'))
      .groupBy('block_hash')
      .as('txs')

    const gasSubQuery = this.knex(subquery)
      .select(
        'hash', 'height', 'timestamp', 'block_version', 'app_hash',
        'app_version', 'l1_locked_height', 'txs.txs', 'validator', 'total_gas_used')
      .select(this.knex.raw(`rank() over (order by blocks.height ${order}) rank`))
      .leftJoin(transactionsSubquery, 'txs.block_hash', 'blocks.hash')
      .whereRaw(...gasQuery)
      .andWhereRaw(...transactionsQuery)
      .as('gas')

    const rows = await this.knex(gasSubQuery)
      .select('rank', 'hash', 'height', 'timestamp', 'block_version', 'app_hash',
        'app_version', 'l1_locked_height', 'txs', 'validator', 'total_gas_used',
        this.knex(gasSubQuery).count('height').as('total_count')
      )
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('height', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map(block => Block.fromRow({
      header: block, txs: block.txs ?? []
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
