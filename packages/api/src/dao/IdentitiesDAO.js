const Identity = require('../models/Identity')
const Transfer = require('../models/Transfer')
const Transaction = require('../models/Transaction')
const Document = require('../models/Document')
const DataContract = require('../models/DataContract')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { IDENTITY_CREDIT_WITHDRAWAL } = require('../enums/StateTransitionEnum')
const { getAliasInfo } = require('../utils')
const { base58 } = require('@scure/base')

module.exports = class IdentitiesDAO {
  constructor (knex, dapi) {
    this.knex = knex
    this.dapi = dapi
  }

  getIdentityByIdentifier = async (identifier) => {
    const aliasSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .where('identity_identifier', '=', identifier)
      .groupBy('identity_identifier')
      .as('identity_alias')

    const subquery = this.knex('identities')
      .select('identities.id', 'identities.identifier as identifier', 'identities.owner as owner',
        'identities.state_transition_hash as tx_hash', 'identities.revision as revision',
        'identities.is_system as is_system')
      .select(this.knex.raw('rank() over (partition by identities.identifier order by identities.id desc) rank'))
      .where('identities.identifier', '=', identifier)
      .as('all_identities')

    const lastRevisionIdentities = this.knex(subquery)
      .select('identifier', 'owner', 'revision', 'tx_hash', 'is_system', 'transfers.id as transfer_id',
        'transfers.sender as sender', 'transfers.recipient as recipient', 'transfers.amount as amount')
      .where('rank', 1)
      .leftJoin('transfers', 'transfers.recipient', 'identifier')

    const documentsSubQuery = this.knex('documents')
      .select('documents.id', 'documents.state_transition_hash', 'documents.owner as owner')
      .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
      .where('documents.owner', identifier)
      .as('as_documents')

    const dataContractsSubQuery = this.knex('data_contracts')
      .select('data_contracts.id', 'data_contracts.state_transition_hash', 'data_contracts.owner as owner')
      .select(this.knex.raw('rank() over (partition by data_contracts.identifier order by data_contracts.id desc) rank'))
      .where('data_contracts.owner', identifier)
      .as('as_data_contracts')

    const transfersSubquery = this.knex('transfers')
      .select('transfers.id as id', 'transfers.sender as sender', 'transfers.recipient as recipient')
      .where('sender', identifier)
      .orWhere('recipient', identifier)
      .as('transfer_alias')

    const rows = await this.knex.with('with_alias', lastRevisionIdentities)
      .select('identifier', 'with_alias.owner as owner', 'revision', 'transfer_id', 'sender',
        'tx_hash', 'is_system', 'blocks.timestamp as timestamp', 'recipient', 'amount')
      .leftJoin('state_transitions', 'state_transitions.hash', 'tx_hash')
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
      .select(this.knex('state_transitions').count('*').where('owner', identifier).as('total_txs'))
      .select(this.knex(documentsSubQuery).count('*').where('rank', 1).as('total_documents'))
      .select(this.knex(dataContractsSubQuery).count('*').where('rank', 1).as('total_data_contracts'))
      .select(this.knex(transfersSubquery).count('*').as('total_transfers'))
      .select(this.knex(aliasSubquery).select('aliases').limit(1).as('aliases'))
      .from('with_alias')
      .limit(1)

    if (!rows.length) {
      return null
    }

    const [row] = rows

    if (!row) {
      return null
    }

    const identity = Identity.fromRow(row)

    const aliases = await Promise.all(identity.aliases.map(async alias => {
      const aliasInfo = await getAliasInfo(alias, this.dapi)

      const isLocked = base58.encode(
        Buffer.from(aliasInfo.contestedState?.finishedVoteInfo?.wonByIdentityId ?? ''),
        'base64') !== identifier

      return {
        alias,
        status: (aliasInfo.contestedState !== null && isLocked) ? 'locked' : 'ok'
      }
    }))

    return {
      ...identity,
      aliases,
      balance: await this.dapi.getIdentityBalance(identity.identifier.trim())
    }
  }

  getIdentityByDPNSName = async (dpns) => {
    const [identity] = await this.knex('identity_aliases')
      .select('identity_identifier', 'alias')
      .whereRaw(`LOWER(alias) LIKE LOWER('${dpns}${dpns.includes('.') ? '' : '.%'}')`)
      .orderBy('id', 'desc')
      .limit(1)

    if (!identity) {
      return null
    }

    return { identifier: identity.identity_identifier, alias: identity.alias }
  }

  getIdentities = async (page, limit, order, orderBy) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    const orderByOptions = [{ column: 'identity_id', order }]

    if (orderBy === 'tx_count') {
      orderByOptions.unshift({ column: 'total_txs', order })
    }

    if (orderBy === 'balance') {
      orderByOptions.unshift({ column: 'balance', order })
    }

    const getRankString = () => {
      return orderByOptions.reduce((acc, value, index, arr) =>
        acc + ` ${value.column} ${value.order}${index === arr.length - 1 ? '' : ','}`, 'order by')
    }

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const subquery = this.knex('identities')
      .select('identities.id as identity_id', 'identities.identifier as identifier', 'identities.owner as identity_owner',
        'identities.is_system as is_system', 'identities.state_transition_hash as tx_hash', 'aliases.aliases as aliases',
        'identities.revision as revision')
      .select(this.knex.raw('COALESCE((select sum(amount) from transfers where recipient = identifier), 0) - COALESCE((select sum(amount) from transfers where sender = identifier), 0) as balance'))
      .select(this.knex('state_transitions').count('*').whereRaw('owner = identifier').as('total_txs'))
      .select(this.knex.raw('rank() over (partition by identities.identifier order by identities.id desc) rank'))
      .leftJoin(aliasesSubquery, 'identity_identifier', 'identifier')
      .as('identities')

    const filteredIdentities = this.knex(subquery)
      .select('balance', 'aliases', 'total_txs', 'identity_id', 'identifier', 'identity_owner', 'tx_hash', 'revision', 'rank', 'is_system')
      .select(this.knex.raw(`row_number() over (${getRankString()}) row_number`))
      .where('rank', 1)

    const documentsSubQuery = this.knex('documents')
      .select('id', 'identifier')
      .whereRaw('documents.owner = with_alias.identifier')
      .as('as_documents')

    const dataContractsSubQuery = this.knex('data_contracts')
      .select('id', 'identifier')
      .whereRaw('data_contracts.owner = with_alias.identifier')
      .as('as_data_contracts')

    const rows = await this.knex.with('with_alias', filteredIdentities)
      .select('total_txs', 'identity_id', 'aliases', 'identifier', 'identity_owner', 'revision', 'tx_hash', 'blocks.timestamp as timestamp', 'row_number', 'aliases', 'is_system', 'balance')
      .select(this.knex('with_alias').count('*').as('total_count'))
      .select(this.knex(this.knex(documentsSubQuery)
        .select('id', this.knex.raw('rank() over (partition by as_documents.identifier order by as_documents.id desc) rank')).as('ranked_documents'))
        .count('*').where('rank', '1').as('total_documents'))
      .select(this.knex(this.knex(dataContractsSubQuery)
        .select('id', this.knex.raw('rank() over (partition by as_data_contracts.identifier order by as_data_contracts.id desc) rank')).as('ranked_data_contracts'))
        .count('*').where('rank', '1').as('total_data_contracts'))
      .select(this.knex('transfers').count('*').whereRaw('sender = identifier or recipient = identifier').as('total_transfers'))
      .leftJoin('state_transitions', 'state_transitions.hash', 'tx_hash')
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
      .whereBetween('row_number', [fromRank, toRank])
      .orderBy(orderByOptions)
      .from('with_alias')

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = await Promise.all(rows.map(async row => {
      const balance = await this.dapi.getIdentityBalance(row.identifier.trim())

      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias, this.dapi)

        const isLocked = base58.encode(
          Buffer.from(aliasInfo.contestedState?.finishedVoteInfo?.wonByIdentityId ?? ''),
          'base64') !== row.identifier

        return {
          alias,
          status: (aliasInfo.contestedState !== null && isLocked) ? 'locked' : 'ok'
        }
      }))

      return Identity.fromRow({
        ...row,
        owner: row.identity_owner,
        total_data_contracts: parseInt(row.total_data_contracts),
        total_documents: parseInt(row.total_documents),
        total_txs: parseInt(row.total_txs),
        balance,
        aliases
      })
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getDataContractsByIdentity = async (identifier, page, limit, order) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    const sumDocuments = this.knex('documents')
      .select('documents.id', 'data_contracts.identifier as dc_identifier', 'documents.data_contract_id')
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .as('sum_documents')

    const subquery = this.knex('data_contracts')
      .select('data_contracts.id', 'data_contracts.identifier as identifier', 'data_contracts.name as name',
        'data_contracts.owner as data_contract_owner', 'data_contracts.version as version',
        'data_contracts.state_transition_hash as tx_hash', 'data_contracts.is_system as is_system')
      .select(this.knex.raw('rank() over (partition by data_contracts.identifier order by data_contracts.id desc) rank'))
      .where('owner', '=', identifier)

    const filteredDataContracts = this.knex.with('with_alias', subquery)
      .select('id', 'identifier', 'name', 'data_contract_owner', 'version', 'tx_hash', 'rank', 'is_system')
      .select(this.knex('with_alias').count('*').where('rank', 1).as('total_count'))
      .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
      .from('with_alias')
      .where('rank', 1)
      .as('data_contractz')

    const rows = await this.knex(filteredDataContracts)
      .select('data_contractz.id as id', 'name', 'identifier', 'data_contract_owner', 'version', 'tx_hash', 'rank', 'total_count', 'row_number', 'is_system', 'blocks.timestamp as timestamp')
      .select(this.knex(sumDocuments)
        .count('*')
        .whereRaw('sum_documents.dc_identifier = data_contractz.identifier')
        .as('documents_count')
      )
      .leftJoin('state_transitions', 'state_transitions.hash', 'tx_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .whereBetween('row_number', [fromRank, toRank])
      .orderBy('blocks.height ', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    return new PaginatedResultSet(rows.map(row => DataContract.fromRow({
      ...row,
      owner: row.data_contract_owner
    })), page, limit, totalCount)
  }

  getDocumentsByIdentity = async (identifier, page, limit, order) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('documents')
      .select('documents.id', 'documents.identifier as identifier', 'documents.owner as document_owner', 'documents.data_contract_id as data_contract_id',
        'documents.revision as revision', 'documents.state_transition_hash as tx_hash',
        'documents.deleted as deleted', 'documents.is_system as document_is_system')
      .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
      .where('documents.owner', '=', identifier)

    const filteredDocuments = this.knex.with('with_alias', subquery)
      .select('with_alias.id as document_id', 'identifier', 'document_owner', 'revision', 'data_contract_id',
        'deleted', 'tx_hash', 'document_is_system', 'rank')
      .select(this.knex('with_alias').count('*').where('rank', 1).as('total_count'))
      .select(this.knex.raw(`rank() over (order by with_alias.id ${order}) row_number`))
      .from('with_alias')
      .where('rank', 1)
      .as('documents')

    const rows = await this.knex(filteredDocuments)
      .select('document_id', 'documents.identifier as identifier', 'document_owner', 'data_contracts.identifier as data_contract_identifier',
        'revision', 'deleted', 'tx_hash', 'total_count', 'row_number',
        'data_contract_id', 'blocks.timestamp as timestamp', 'document_is_system')
      .leftJoin('state_transitions', 'state_transitions.hash', 'tx_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
      .whereBetween('row_number', [fromRank, toRank])
      .orderBy('document_id ', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    return new PaginatedResultSet(rows.map(row => Document.fromRow({
      ...row, is_system: row.document_is_system, owner: row.document_owner
    })), page, limit, totalCount)
  }

  getTransactionsByIdentity = async (identifier, page, limit, order) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('state_transitions')
      .select('state_transitions.id as state_transition_id', 'state_transitions.hash as tx_hash',
        'state_transitions.index as index', 'state_transitions.type as type', 'state_transitions.block_hash as block_hash',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status', 'state_transitions.error as error',
        'state_transitions.owner as owner'
      )
      .select(this.knex.raw(`rank() over (order by state_transitions.id ${order}) rank`))
      .where('state_transitions.owner', '=', identifier)

    const rows = await this.knex.with('with_alias', subquery)
      .select('state_transition_id', 'tx_hash', 'index', 'block_hash', 'type', 'rank',
        'gas_used', 'status', 'gas_used', 'owner',
        'blocks.timestamp as timestamp', 'blocks.height as block_height')
      .select(this.knex('with_alias').count('*').as('total_count'))
      .leftJoin('blocks', 'blocks.hash', 'block_hash')
      .from('with_alias')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('state_transition_id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    return new PaginatedResultSet(rows.map(row => Transaction.fromRow(row)), page, limit, totalCount)
  }

  getTransfersByIdentity = async (identifier, page, limit, order, type) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('transfers')
      .select(
        'transfers.id as id', 'transfers.amount as amount',
        'transfers.sender as sender', 'transfers.recipient as recipient',
        'transfers.state_transition_hash as tx_hash',
        'state_transitions.block_hash as block_hash',
        'state_transitions.type as type'
      )
      .select(this.knex.raw(`rank() over (order by transfers.id ${order}) rank`))
      .whereRaw(`(transfers.sender = '${identifier}' OR transfers.recipient = '${identifier}') ${
        typeof type === 'number'
          ? `AND state_transitions.type = ${type}`
          : ''
      }`)
      .leftJoin('state_transitions', 'state_transitions.hash', 'transfers.state_transition_hash')

    const rows = await this.knex.with('with_alias', subquery)
      .select(
        'rank', 'amount', 'block_hash', 'type',
        'sender', 'recipient', 'with_alias.id',
        'tx_hash', 'blocks.timestamp as timestamp',
        'block_hash'
      )
      .select(this.knex('with_alias').count('*').as('total_count'))
      .leftJoin('blocks', 'blocks.hash', 'with_alias.block_hash')
      .from('with_alias')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('with_alias.id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    return new PaginatedResultSet(rows.map(row => Transfer.fromRow(row)), page, limit, totalCount)
  }

  getIdentityWithdrawalsByTimestamps = async (identifier, timestamps = []) => {
    return this.knex('state_transitions')
      .select('state_transitions.hash', 'blocks.timestamp as timestamp')
      .whereIn(
        'blocks.timestamp',
        timestamps
      )
      .andWhere('owner', identifier)
      .andWhere('type', IDENTITY_CREDIT_WITHDRAWAL)
      .leftJoin('blocks', 'block_hash', 'blocks.hash')
  }
}
