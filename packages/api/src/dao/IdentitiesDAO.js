const Identity = require('../models/Identity')
const Transfer = require('../models/Transfer')
const Transaction = require('../models/Transaction')
const Document = require('../models/Document')
const DataContract = require('../models/DataContract')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { IDENTITY_CREDIT_WITHDRAWAL, IDENTITY_TOP_UP } = require('../enums/StateTransitionEnum')
const {
  decodeStateTransition,
  getAliasStateByVote,
  getAliasFromDocument,
  getAliasInfo
} = require('../utils')
const StateTransitionEnum = require('../enums/StateTransitionEnum')
const BatchEnum = require('../enums/BatchEnum')
const { DPNS_CONTRACT } = require('../constants')
const SeriesData = require('../models/SeriesData')

module.exports = class IdentitiesDAO {
  constructor (knex, sdk) {
    this.knex = knex
    this.sdk = sdk
  }

  getIdentityByIdentifier = async (identifier) => {
    const aliasSubquery = this.knex('identity_aliases')
      .select('identity_identifier')
      .select(this.knex.raw(`
          array_agg(
            json_build_object(
              'alias', alias,
              'timestamp', timestamp::timestamptz,
              'tx', state_transition_hash
            )
          ) as aliases
        `))
      .where('identity_identifier', '=', identifier)
      .groupBy('identity_identifier')
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transition_hash')
      .leftJoin('blocks', 'block_hash', 'blocks.hash')
      .as('identity_alias')

    const subquery = this.knex('identities')
      .select('identities.id', 'identities.identifier as identifier', 'identities.owner as owner',
        'identities.state_transition_hash as tx_hash', 'identities.state_transition_id as tx_id', 'identities.revision as revision',
        'identities.is_system as is_system')
      .select(this.knex.raw('rank() over (partition by identities.identifier order by identities.id desc) rank'))
      .where('identities.identifier', '=', identifier)
      .as('all_identities')

    const lastRevisionIdentities = this.knex(subquery)
      .select('identifier', 'owner', 'revision', 'tx_hash', 'tx_id', 'is_system', 'transfers.id as transfer_id',
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

    const mainQuery = this.knex.with('with_alias', lastRevisionIdentities)
      .select(
        'identifier', 'with_alias.owner as owner', 'revision',
        'transfer_id', 'sender', 'tx_hash', 'is_system',
        'blocks.timestamp as timestamp', 'recipient', 'amount',
        'state_transitions.data as tx_data'
      )
      .select(this.knex('state_transitions').count('*').where('owner', identifier).as('total_txs'))
      .select(this.knex('state_transitions').sum('gas_used').where('owner', identifier).as('total_gas_spent'))
      .select(this.knex(documentsSubQuery).count('*').where('rank', 1).as('total_documents'))
      .select(this.knex(dataContractsSubQuery).count('*').where('rank', 1).as('total_data_contracts'))
      .select(this.knex(transfersSubquery).count('*').as('total_transfers'))
      .select(this.knex(aliasSubquery).select('aliases').limit(1).as('aliases'))
      .leftJoin('state_transitions', 'state_transitions.id', 'tx_id')
      .leftJoin('blocks', 'state_transitions.block_height', 'blocks.height')
      .from('with_alias')
      .limit(1)

    const statisticSubquery = this.knex('state_transitions')
      .whereRaw('owner = identifier and type = ?', [IDENTITY_CREDIT_WITHDRAWAL])
      .as('statistic')

    const rows = await this.knex.with('with_alias', mainQuery)
      .select(
        'identifier', 'owner', 'revision',
        'transfer_id', 'sender', 'tx_hash',
        'is_system', 'timestamp', 'recipient',
        'amount', 'total_txs', 'total_gas_spent',
        'total_documents', 'total_data_contracts',
        'total_transfers', 'aliases', 'tx_data',
        this.knex.raw('ROUND(total_gas_spent/total_txs) as average_gas_spent')
      )
      .select(this.knex('transfers')
        .select(this.knex.raw('sum(amount)'))
        .where('recipient', identifier)
        .orWhere('sender', identifier)
        .andWhere('type', IDENTITY_TOP_UP)
        .leftJoin('state_transitions', 'state_transition_hash', 'hash')
        .as('total_top_ups_amount'))
      .select(this.knex('transfers')
        .select(this.knex.raw('sum(amount)'))
        .where('sender', identifier)
        .andWhere('type', IDENTITY_CREDIT_WITHDRAWAL)
        .leftJoin('state_transitions', 'state_transition_hash', 'hash')
        .as('total_withdrawals_amount'))
      .select(this.knex(statisticSubquery)
        .select('hash')
        .where('type', IDENTITY_CREDIT_WITHDRAWAL)
        .orderBy('id', 'desc')
        .limit(1)
        .as('last_withdrawal_hash'))
      .select(this.knex(statisticSubquery)
        .select('timestamp')
        .where('type', IDENTITY_CREDIT_WITHDRAWAL)
        .orderBy('id', 'desc')
        .limit(1)
        .as('last_withdrawal_timestamp'))
      .select(
        this.knex(statisticSubquery)
          .count('id')
          .whereRaw('type=?', [IDENTITY_CREDIT_WITHDRAWAL])
          .as('total_withdrawals'))
      .select(
        this.knex(statisticSubquery)
          .count('id')
          .whereRaw('type=?', [IDENTITY_TOP_UP])
          .as('total_top_ups'))
      .from('with_alias')

    if (!rows.length) {
      return null
    }

    const [row] = rows

    if (!row) {
      return null
    }

    const identity = Identity.fromRow(row)

    const aliases = await Promise.all(identity.aliases.map(async alias => {
      const aliasInfo = await getAliasInfo(alias.alias, this.sdk)

      return getAliasStateByVote(aliasInfo, alias, identifier)
    }))

    const publicKeys = await this.sdk.identities.getIdentityPublicKeys(identity.identifier)

    let fundingCoreTx = null

    if (row.tx_data) {
      const { assetLockProof } = await decodeStateTransition(row.tx_data)

      fundingCoreTx = assetLockProof?.fundingCoreTx
    }

    const balance = await this.sdk.identities.getIdentityBalance(identity.identifier)

    return Identity.fromObject({
      ...identity,
      aliases,
      balance: String(balance),
      publicKeys: publicKeys?.map(key => {
        const contractBounds = key.getContractBounds()

        return {
          keyId: key.keyId,
          keyType: key.keyType,
          raw: key.hex(),
          data: key.data,
          purpose: key.purpose,
          securityLevel: key.securityLevel,
          readOnly: key.readOnly,
          publicKeyHash: key.getPublicKeyHash(),
          contractBounds: contractBounds
            ? {
                identifier: contractBounds.identifier.base58(),
                documentTypeName: contractBounds.documentTypeName ?? null
              }
            : null
        }
      }),
      fundingCoreTx
    })
  }

  getIdentitiesByDPNSName = async (dpns) => {
    const rows = await this.knex('identity_aliases')
      .select('identity_identifier', 'alias', 'timestamp', 'state_transition_hash as tx')
      .whereILike('alias', `${dpns}%`)
      .leftJoin('state_transitions', 'state_transition_hash', 'hash')
      .leftJoin('blocks', 'blocks.hash', 'block_hash')

    if (rows.length === 0) {
      return null
    }

    return Promise.all(rows.map(async row => {
      const aliasInfo = await getAliasInfo(row.alias, this.sdk)

      return {
        identifier: row.identity_identifier,
        alias: row.alias,
        status: getAliasStateByVote(aliasInfo, { ...row }, row.identity_identifier)
      }
    }))
  }

  getIdentities = async (page, limit, order, orderBy) => {
    const fromRank = (page - 1) * limit
    // const toRank = fromRank + limit - 1

    const orderByOptions = [{ column: 'identity_id', order }]

    if (orderBy === 'tx_count') {
      orderByOptions.unshift({ column: 'total_txs', order })
    }

    if (orderBy === 'balance') {
      orderByOptions.unshift({ column: 'balance', order })
    }

    const subquery = this.knex('identities')
      .select('identities.id as identity_id', 'identities.identifier as identifier', 'identities.owner as identity_owner',
        'identities.is_system as is_system', 'identities.state_transition_hash as tx_hash', 'identities.state_transition_id as tx_id', 'identities.revision as revision')
      .where('revision', 0)

    const countSubquery = this.knex('with_alias')
      .select(this.knex.raw('count(*) over () as total_count'))
      .limit(1)
      .as('total_count')

    const transfersSubquery = this.knex('transfers')
      .whereRaw('recipient_id = with_alias.identity_id')
      .orWhereRaw('sender_id = with_alias.identity_id')
      .as('balance')

    const identityDataSubquery = this.knex
      .with('with_alias', subquery)
      .select('identity_id', 'identifier', 'identity_owner', 'revision', 'tx_hash', 'is_system', 'tx_id', 'total_count')
      .select(
        this.knex(transfersSubquery)
          .sum(this.knex.raw(
            'CASE WHEN recipient_id = with_alias.identity_id THEN amount WHEN recipient_id = with_alias.identity_id THEN -amount ELSE 0 END'
          ))
          .as('balance')
          .limit(1)
          .as('balance')
      )
      .select(this.knex('state_transitions').count('*').whereRaw('owner_id = identity_id').limit(1).as('total_txs'))
      .leftJoin(countSubquery, this.knex.raw('true'), this.knex.raw('true'))
      .from('with_alias')
      .as('subquery')

    const limitedDataSubquery = this.knex(identityDataSubquery)
      .select(
        'identity_id', 'identifier', 'identity_owner', 'tx_hash',
        'is_system', 'tx_id', 'total_txs', 'total_count'
      )
      .select(
        this.knex('identities')
          .select('revision')
          .whereRaw('subquery.identifier = identities.identifier')
          .orderBy('revision', 'DESC')
          .limit(1)
          .as('revision')
      )
      .limit(limit)
      .offset(fromRank)
      .orderBy(orderByOptions)
      .as('limited_subquery')

    const timestampSubquery = this.knex(limitedDataSubquery)
      .select(
        'blocks.timestamp as timestamp', 'revision', 'identity_id', 'identifier',
        'identity_owner', 'tx_hash', 'is_system', 'tx_id', 'total_txs', 'total_count'
      )
      .leftJoin('state_transitions', 'state_transitions.id', 'tx_id')
      .leftJoin('blocks', 'state_transitions.block_height', 'blocks.height')
      .as('timestamp_subquery')

    const rows = this.knex(timestampSubquery)
      .orderBy(orderByOptions)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = await Promise.all(rows.map(async row => {
      const balance = await this.sdk.identities.getIdentityBalance(row.identifier.trim())

      const aliases = []
      const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.identifier.trim()]], 1)

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return Identity.fromRow({
        ...row,
        owner: row.identity_owner,
        total_data_contracts: parseInt(row.total_data_contracts),
        total_documents: parseInt(row.total_documents),
        balance: String(balance),
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

  getDocumentsByIdentity = async (identifier, typeName, page, limit, order) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    let typeQuery = 'documents.owner = ?'

    const queryBindings = [identifier]

    if (typeName) {
      typeQuery = typeQuery + ' and document_type_name = ?'

      queryBindings.push(typeName)
    }

    const subquery = this.knex('documents')
      .select('documents.id', 'documents.identifier as identifier', 'documents.owner as document_owner', 'documents.data_contract_id as data_contract_id',
        'documents.revision as revision', 'documents.state_transition_hash as tx_hash',
        'documents.deleted as deleted', 'documents.is_system as document_is_system', 'document_type_name', 'transition_type')
      .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
      .whereRaw(typeQuery, queryBindings)

    const filteredDocuments = this.knex.with('with_alias', subquery)
      .select('with_alias.id as document_id', 'identifier', 'document_owner', 'revision', 'data_contract_id',
        'deleted', 'tx_hash', 'document_is_system', 'rank', 'document_type_name', 'transition_type')
      .select(this.knex('with_alias').count('*').where('rank', 1).as('total_count'))
      .select(this.knex.raw(`rank() over (order by with_alias.id ${order}) row_number`))
      .from('with_alias')
      .where('rank', 1)
      .as('documents')

    const rows = await this.knex(filteredDocuments)
      .select('document_id', 'documents.identifier as identifier', 'document_owner', 'data_contracts.identifier as data_contract_identifier',
        'revision', 'deleted', 'tx_hash', 'total_count', 'row_number', 'document_type_name', 'transition_type',
        'data_contract_id', 'blocks.timestamp as timestamp', 'document_is_system')
      .leftJoin('state_transitions', 'state_transitions.hash', 'tx_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
      .whereBetween('row_number', [fromRank, toRank])
      .orderBy('document_id ', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliases = []
      const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.document_owner.trim()]], 1)

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return Document.fromRow({
        ...row,
        is_system: row.document_is_system,
        transition_type: BatchEnum[row.transition_type],
        owner: {
          identifier: row.document_owner?.trim() ?? null,
          aliases: aliases ?? []
        }
      })
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getTransactionsByIdentity = async (identifier, page, limit, order) => {
    const fromRank = (page - 1) * limit

    const subquery = this.knex('state_transitions')
      .select('state_transitions.id as state_transition_id', 'state_transitions.hash as tx_hash',
        'state_transitions.index as index', 'state_transitions.type as type', 'state_transitions.block_hash as block_hash',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status', 'state_transitions.error as error',
        'state_transitions.owner as owner', 'state_transitions.data as data'
      )
      .where('state_transitions.owner', '=', identifier)

    const rows = await this.knex.with('with_alias', subquery)
      .select('state_transition_id', 'tx_hash', 'index', 'block_hash', 'type',
        'gas_used', 'status', 'gas_used', 'owner', 'data',
        'blocks.timestamp as timestamp', 'blocks.height as block_height')
      .select(this.knex('with_alias').count('*').as('total_count'))
      .leftJoin('blocks', 'blocks.hash', 'block_hash')
      .from('with_alias')
      .offset(fromRank)
      .limit(limit)
      .orderBy('state_transition_id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = await Promise.all(rows.map(async (row) => {
      const decodedTransaction = row.type === StateTransitionEnum.BATCH ? await decodeStateTransition(row.data) : {}
      const [transition] = decodedTransaction?.transitions ?? []

      return Transaction.fromRow({
        ...row,
        type: StateTransitionEnum[row.type],
        batch_type: transition?.action
      })
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getTransfersByIdentity = async (identifier, hash, page, limit, order, type) => {
    const fromRank = (page - 1) * limit

    let searchQuery = '(transfers.sender = ? OR transfers.recipient = ?)'
    const searchBingings = [identifier, identifier]

    if (typeof type === 'number') {
      searchQuery = searchQuery + ' AND state_transitions.type = ?'
      searchBingings.push(type)
    }

    if (hash) {
      searchQuery = searchQuery + ' AND state_transitions.hash = ?'
      searchBingings.push(hash)
    }

    const subquery = this.knex('transfers')
      .select(
        'transfers.id as id', 'transfers.amount as amount',
        'transfers.sender as sender', 'transfers.recipient as recipient',
        'transfers.state_transition_hash as tx_hash',
        'state_transitions.block_hash as block_hash',
        'state_transitions.type as type',
        'state_transitions.gas_used as gas_used'
      )
      .whereRaw(searchQuery, searchBingings)
      .leftJoin('state_transitions', 'state_transitions.hash', 'transfers.state_transition_hash')

    const rows = await this.knex
      .with('with_alias', subquery)
      .select(
        'amount', 'block_hash', 'type',
        'sender', 'recipient', 'with_alias.id',
        'tx_hash', 'blocks.timestamp as timestamp',
        'block_hash', 'gas_used'
      )
      .select(this.knex('with_alias').count('*').as('total_count'))
      .leftJoin('blocks', 'blocks.hash', 'with_alias.block_hash')
      .from('with_alias')
      .offset(fromRank)
      .limit(limit)
      .orderBy('with_alias.id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    return new PaginatedResultSet(rows.map(row => Transfer.fromRow({
      ...row,
      type: StateTransitionEnum[row.type]
    })), page, limit, totalCount)
  }

  getIdentityWithdrawalsByTimestamps = async (identifier, timestamps = []) => {
    return this.knex('state_transitions')
      .select('state_transitions.hash', 'blocks.timestamp as timestamp', 'state_transitions.data as data')
      .whereIn(
        'blocks.timestamp',
        timestamps
      )
      .andWhere('owner', identifier)
      .andWhere('type', IDENTITY_CREDIT_WITHDRAWAL)
      .leftJoin('blocks', 'block_hash', 'blocks.hash')
      .orderBy('id', 'desc')
  }

  getIdentitiesHistorySeries = async (start, end, interval, intervalInMs) => {
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
      .select('blocks_sub.timestamp', 'identifier', 'blocks_sub.height')
      .leftJoin('state_transitions', function () {
        this.on('type', '=', StateTransitionEnum.IDENTITY_CREATE).andOn('state_transitions.block_height', '=', 'blocks_sub.height')
      })
      .whereRaw('identifier is not null')
      .leftJoin('identities', 'state_transition_id', 'state_transitions.id')

    const counted = this.knex
      .with('ranges', ranges)
      .with(
        'filtered_data',
        dataSubquery
      )
      .select('date_from')
      .select(this.knex.raw('count(identifier) as identities_count'))
      .select(this.knex.raw('min(height) as block_height'))
      .leftJoin('filtered_data', function () {
        this.on('timestamp', '>', 'date_from').andOn('timestamp', '<=', 'date_to')
      })
      .groupBy('date_from')
      .from('ranges')
      .as('counted')

    const rows = await this.knex(counted)
      .select('identities_count', 'block_height', 'hash as block_hash', 'date_from')
      .leftJoin('blocks', function () {
        this.on('blocks.height', '=', 'block_height').andOnNotNull('block_height')
      })
      .as('subquery')

    return rows.map(row => ({
      timestamp: row.date_from.toISOString(),
      data: {
        registeredIdentities: Number(row.identities_count ?? 0),
        blockHeight: row.block_height,
        blockHash: row.block_hash
      }
    }))
      .map(({ timestamp, data }) => new SeriesData(timestamp, data))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }
}
