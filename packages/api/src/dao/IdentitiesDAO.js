const Identity = require('../models/Identity')
const Transfer = require('../models/Transfer')
const Transaction = require('../models/Transaction')
const Document = require('../models/Document')
const DataContract = require('../models/DataContract')
const PaginatedResultSet = require('../models/PaginatedResultSet')

module.exports = class IdentitiesDAO {
  constructor (knex) {
    this.knex = knex
  }

  getIdentityByIdentifier = async (identifier) => {
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
      .select(this.knex.raw('COALESCE((select sum(amount) from transfers where recipient = identifier), 0) - COALESCE((select sum(amount) from transfers where sender = identifier), 0) as balance'))
      .select(this.knex('state_transitions').count('*').where('owner', identifier).as('total_txs'))
      .select(this.knex(documentsSubQuery).count('*').where('rank', 1).as('total_documents'))
      .select(this.knex(dataContractsSubQuery).count('*').where('rank', 1).as('total_data_contracts'))
      .select(this.knex(transfersSubquery).count('*').as('total_transfers'))
      .from('with_alias')
      .limit(1)

    if (!rows.length) {
      return null
    }

    const [row] = rows

    return Identity.fromRow({ ...row })
  }

  getIdentityByDPNS = async (dpns) => {
    const identifier = this.knex('identity_aliases')
      .select('identity_identifier')
      .whereRaw(`LOWER(alias) LIKE LOWER('${dpns}')`)
      .limit(1)

    const identity = await this.getIdentityByIdentifier(identifier)

    return identity
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

    const subquery = this.knex('identities')
      .select('identities.id as identity_id', 'identities.identifier as identifier', 'identities.owner as identity_owner',
        'identities.is_system as is_system', 'identities.state_transition_hash as tx_hash',
        'identities.revision as revision')
      .select(this.knex.raw('COALESCE((select sum(amount) from transfers where recipient = identifier), 0) - COALESCE((select sum(amount) from transfers where sender = identifier), 0) as balance'))
      .select(this.knex('state_transitions').count('*').whereRaw('owner = identifier').as('total_txs'))
      .select(this.knex.raw('rank() over (partition by identities.identifier order by identities.id desc) rank'))
      .as('identities')

    const filteredIdentities = this.knex(subquery)
      .select('balance', 'total_txs', 'identity_id', 'identifier', 'identity_owner', 'tx_hash', 'revision', 'rank', 'is_system')
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
      .select('total_txs', 'balance', 'identity_id', 'identifier', 'identity_owner', 'revision', 'tx_hash', 'blocks.timestamp as timestamp', 'row_number', 'is_system')
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
      .from('with_alias')
      .whereBetween('row_number', [fromRank, toRank])
      .orderBy(orderByOptions)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    return new PaginatedResultSet(rows.map(row => Identity.fromRow({
      ...row,
      owner: row.identity_owner,
      total_data_contracts: parseInt(row.total_data_contracts),
      total_documents: parseInt(row.total_documents),
      total_txs: parseInt(row.total_txs),
      balance: parseInt(row.balance)
    })), page, limit, totalCount)
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
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status', 'state_transitions.error as error'
      )
      .select(this.knex.raw(`rank() over (order by state_transitions.id ${order}) rank`))
      .where('state_transitions.owner', '=', identifier)

    const rows = await this.knex.with('with_alias', subquery)
      .select('state_transition_id', 'tx_hash', 'index', 'block_hash', 'type', 'rank',
        'gas_used', 'status', 'gas_used',
        'blocks.timestamp as timestamp', 'blocks.height as block_height')
      .select(this.knex('with_alias').count('*').as('total_count'))
      .leftJoin('blocks', 'blocks.hash', 'block_hash')
      .from('with_alias')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('state_transition_id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    return new PaginatedResultSet(rows.map(row => Transaction.fromRow(row)), page, limit, totalCount)
  }

  getTransfersByIdentity = async (identifier, page, limit, order) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('transfers')
      .select('transfers.id as id', 'transfers.amount as amount', 'transfers.sender as sender', 'transfers.recipient as recipient', 'transfers.state_transition_hash as tx_hash')
      .select(this.knex.raw(`rank() over (order by id ${order}) rank`))
      .where('transfers.sender', '=', identifier)
      .orWhere('transfers.recipient', '=', identifier)

    const rows = await this.knex.with('with_alias', subquery)
      .select('with_alias.id', 'amount', 'sender', 'recipient', 'rank', 'tx_hash', 'blocks.timestamp as timestamp')
      .select(this.knex('with_alias').count('*').as('total_count'))
      .leftJoin('state_transitions', 'state_transitions.hash', 'tx_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .from('with_alias')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('with_alias.id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    return new PaginatedResultSet(rows.map(row => Transfer.fromRow(row)), page, limit, totalCount)
  }
}
