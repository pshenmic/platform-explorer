const ChoiceEnum = require('../enums/ChoiceEnum')
const ContestedResource = require('../models/ContestedResource')
const { buildIndexBuffer, getAliasFromDocument, getAliasDocumentForIdentifiers } = require('../utils')
const Vote = require('../models/Vote')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { CONTESTED_RESOURCE_VOTE_DEADLINE } = require('../constants')
const ContestedResourceStatus = require('../models/ContestedResourcesStatus')
const { ContestedStateResultType } = require('dash-platform-sdk/src/types')

module.exports = class ContestedDAO {
  constructor (knex, sdk) {
    this.knex = knex
    this.sdk = sdk
  }

  getContestedResource = async (resourceValue) => {
    const prefundedDocumentsSubquery = this.knex('documents')
      .whereRaw('prefunded_voting_balance is not null')
      .andWhereRaw('data is not null')
      .as('sub')

    const documentsPrefundingIndexeKeysSubquery = this.knex(prefundedDocumentsSubquery)
      .select('id', 'data_contract_id', 'data')
      .select(this.knex.raw('jsonb_object_keys(prefunded_voting_balance) as key'))
      .as('sub')

    const dataContractsWithContestedDocs = this.knex(documentsPrefundingIndexeKeysSubquery)
      .select('schema', 'data_contracts.id as data_contract_id', 'sub.id as document_id',
        'data', 'data_contracts.identifier as data_contract_identifier', 'sub.key as key')
      .leftJoin('data_contracts', 'sub.data_contract_id', 'data_contracts.id')
      .as('data_contracts_with_contested')

    const filteredIndexElementSubquery = this.knex
      .select('index_element', 'data_contract_identifier', 'data_contract_id', 'data', 'document_id', 'data_contracts_with_contested.key as key')
      .select(this.knex.raw('index_element->>\'name\' as name'))
      .whereRaw('index_element->>\'name\' = data_contracts_with_contested.key')
      .fromRaw('?, jsonb_each(schema) AS key_value(key, value), jsonb_array_elements(value->\'indices\') AS index_element', dataContractsWithContestedDocs)
      .as('index_elements')

    const keysSubquery = this.knex
      .select(
        'document_id', 'field_index', 'name as index_name',
        'data', 'data_contract_identifier',
        this.knex.raw('jsonb_object_keys(property) as property_keys')
      )
      .fromRaw('?, jsonb_array_elements(index_elements.index_element -> \'properties\') WITH ORDINALITY AS t(property,field_index)', filteredIndexElementSubquery)
      .as('keys_subquery')

    const documentsResourceValues = this.knex(keysSubquery)
      .select('document_id', 'data_contract_identifier', 'index_name')
      .select(this.knex.raw('jsonb_agg(data->property_keys order by field_index asc) as resource_value'))
      .groupBy('index_name', 'document_id', 'data_contract_identifier')
      .as('resource_values')

    const contestedDocumentsSubquery = this.knex(documentsResourceValues)
      .select('resource_value', 'document_id', 'data_contract_identifier', 'index_name')
      .whereRaw('resource_value = ?', [JSON.stringify(resourceValue)])
      .as('contested_documents_sub')

    const documentGasSubquery = this.knex(contestedDocumentsSubquery)
      .select('resource_value', 'document_id', 'data_contract_identifier', 'index_name',
        'gas_used as document_tx_gas_used', 'blocks.timestamp as document_timestamp',
        'documents.state_transition_hash as document_state_transition_hash', 'documents.owner as owner',
        'documents.identifier as document_identifier', 'documents.document_type_name as document_type_name',
        'documents.prefunded_voting_balance as prefunded_voting_balance'
      )
      .leftJoin('documents', 'documents.id', 'document_id')
      .leftJoin('state_transitions', 'documents.state_transition_hash', 'hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .as('contested_documents_sub')

    const rows = await this.knex(documentGasSubquery)
      .select('resource_value', 'data_contract_identifier', 'document_tx_gas_used',
        'prefunded_voting_balance', 'gas_used as vote_gas_used', 'document_timestamp',
        'masternode_votes.choice as choice', 'document_state_transition_hash',
        'masternode_votes.state_transition_hash as masternode_vote_tx',
        'masternode_votes.power as masternode_power',
        'masternode_votes.towards_identity_identifier as towards_identity', 'contested_documents_sub.index_name as index_name',
        'contested_documents_sub.owner as owner', 'document_identifier', 'document_timestamp as timestamp',
        'contested_documents_sub.document_type_name as document_type_name'
      )
      .joinRaw('left join masternode_votes ON masternode_votes.index_values = contested_documents_sub.resource_value')
      .leftJoin('state_transitions', 'masternode_votes.state_transition_hash', 'hash')

    if (rows.length === 0) {
      return null
    }

    const uniqueVotes = rows
      .filter((item, pos, self) =>
        self.findIndex((row) => row.masternode_vote_tx === item.masternode_vote_tx) === pos
      )

    const uniqueContenders = rows
      .filter((item, pos, self) =>
        self.findIndex((row) => row.owner === item.owner) === pos &&
        self.findIndex((row) => row.document_identifier === item.document_identifier) === pos
      )

    const [firstTx] = rows.sort((a, b) => new Date(a.timestamp ?? new Date()).getTime() - new Date(b.timestamp ?? new Date()).getTime())

    const totalCountTowardsIdentity = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + currentValue.masternode_power * (currentValue.choice === ChoiceEnum.TowardsIdentity ? 1 : 0), 0)

    const totalCountAbstain = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + currentValue.masternode_power * (currentValue.choice === ChoiceEnum.ABSTAIN ? 1 : 0), 0)

    const totalCountLock = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + currentValue.masternode_power * (currentValue.choice === ChoiceEnum.LOCK ? 1 : 0), 0)

    const totalCountVotes = (totalCountLock ?? 0) + (totalCountAbstain ?? 0) + (totalCountTowardsIdentity ?? 0)

    const totalVotesGasUsed = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + Number((currentValue.vote_gas_used ?? 0)), 0)

    const totalDocumentsGasUsed = uniqueContenders
      .reduce((accumulator, currentValue) => accumulator + Number((currentValue.document_tx_gas_used ?? 0)), 0)

    const owners = rows.map(row => row.owner.trim())

    const aliasDocuments = await getAliasDocumentForIdentifiers(owners, this.sdk)

    const contenders = await Promise.all(uniqueContenders.map(async (row) => {
      const aliasDocument = aliasDocuments[row.owner.trim()]

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return {
        identifier: row.owner?.trim() ?? null,
        timestamp: row.timestamp ?? null,
        documentIdentifier: row.document_identifier?.trim() ?? null,
        documentStateTransition: row.document_state_transition_hash ?? null,
        aliases: aliases ?? [],
        towardsIdentityVotes: uniqueVotes
          .filter((vote) => vote.towards_identity?.trim() === row.owner.trim())
          .reduce((accumulator, currentValue) => currentValue.choice === ChoiceEnum.TowardsIdentity
            ? accumulator + 1 * currentValue.masternode_power
            : accumulator
          , 0) ?? null,
        abstainVotes: uniqueVotes.reduce((accumulator, currentValue) => currentValue.choice === ChoiceEnum.ABSTAIN
          ? accumulator + 1 * currentValue.masternode_power
          : accumulator
        , 0) ?? null,
        lockVotes: uniqueVotes.reduce((accumulator, currentValue) => (currentValue.choice === ChoiceEnum.LOCK) && currentValue.towards_identity?.trim() !== row.owner.trim()
          ? accumulator + 1 * currentValue.masternode_power
          : accumulator
        , 0) ?? null
      }
    }))

    let status

    if (firstTx.data_contract_identifier && firstTx.index_name && firstTx.document_type_name && firstTx.resource_value) {
      const dataContract = await this.sdk.dataContracts.getDataContractByIdentifier(firstTx.data_contract_identifier)

      const { finishedVoteInfo } = await this.sdk.contestedResources.getContestedResourceVoteState(
        dataContract,
        firstTx.document_type_name,
        firstTx.index_name,
        firstTx.resource_value.map(buildIndexBuffer),
        ContestedStateResultType.DOCUMENTS_AND_VOTE_TALLY
      )

      status = typeof finishedVoteInfo !== 'undefined'
    }

    return ContestedResource.fromRaw({
      ...firstTx,
      contenders,
      totalGasUsed: totalVotesGasUsed + totalDocumentsGasUsed,
      totalDocumentsGasUsed,
      totalVotesGasUsed,
      totalCountTowardsIdentity,
      totalCountAbstain,
      totalCountLock,
      totalCountVotes,
      status,
      endTimestamp: firstTx.timestamp ? new Date(new Date(firstTx.timestamp).getTime() + CONTESTED_RESOURCE_VOTE_DEADLINE) : null
    })
  }

  getContestedResources = async (page, limit, order) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    const prefundedDocumentsSubquery = this.knex('documents')
      .whereRaw('prefunded_voting_balance is not null')
      .andWhereRaw('data is not null')
      .groupBy('identifier', 'id', 'data_contract_id')
      .as('sub')

    const documentsPrefundingIndexeKeysSubquery = this.knex(prefundedDocumentsSubquery)
      .select('id', 'data_contract_id', 'data', 'state_transition_hash')
      .select(this.knex.raw('jsonb_object_keys(prefunded_voting_balance) as key'))
      .as('sub')

    const dataContractsWithContestedDocs = this.knex(documentsPrefundingIndexeKeysSubquery)
      .select('schema', 'sub.id as document_id', 'data', 'sub.key as key')
      .leftJoin('data_contracts', 'sub.data_contract_id', 'data_contracts.id')
      .as('data_contracts_with_contested')

    const filteredIndexElementSubquery = this.knex
      .select('index_element', 'data', 'document_id', 'data_contracts_with_contested.key as key')
      .select(this.knex.raw('index_element->>\'name\' as name'))
      .whereRaw('index_element->>\'name\' = data_contracts_with_contested.key')
      .fromRaw('?, jsonb_each(schema) AS key_value(key, value), jsonb_array_elements(value->\'indices\') AS index_element', dataContractsWithContestedDocs)
      .as('index_elements')

    const keysSubquery = this.knex
      .select(
        'document_id', 'field_index', 'name as index_name', 'data',
        this.knex.raw('jsonb_object_keys(property) as property_keys')
      )
      .fromRaw('?, jsonb_array_elements(index_elements.index_element -> \'properties\') WITH ORDINALITY AS t(property,field_index)', filteredIndexElementSubquery)
      .as('keys_subquery')

    const resourceValuesSubquery = this.knex(keysSubquery)
      .select('document_id')
      .select(this.knex.raw('jsonb_agg(data->property_keys order by field_index asc) as resource_value'))
      .groupBy('document_id')
      .as('resource_values')

    const rankSubquery = this.knex(resourceValuesSubquery)
      .select('document_id', 'resource_value')
      .select(this.knex.raw(`row_number() over (PARTITION BY resource_value order by document_id ${order}) as value_rank`))
      .as('ranked_documents')

    const paginationRankSubquery = this.knex(rankSubquery)
      .select('document_id', 'resource_value')
      .select(this.knex.raw(`rank() over (order by document_id ${order})`))
      .where('value_rank', '=', '1')

    const rows = await this.knex
      .with('ranked_documents', paginationRankSubquery)
      .from('ranked_documents')
      .select(
        'documents.document_type_name as document_type_name', 'documents.id as document_id',
        'resource_value', 'prefunded_voting_balance', 'power', 'timestamp',
        'data_contracts.identifier as data_contract_identifier', 'choice')
      .select(this.knex('ranked_documents').select(this.knex.raw('count(*)')).limit(1).as('total_count'))
      .leftJoin('documents', 'documents.id', 'document_id')
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')
      .leftJoin('state_transitions', 'documents.state_transition_hash', 'hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('document_id', order)
      .joinRaw('left join masternode_votes ON resource_value = index_values')

    if (rows.length === 0) {
      return new PaginatedResultSet([], page, limit, -1)
    }

    const [{ total_count: totalCount }] = rows

    const uniqueResources = rows
      .filter((item, pos, self) => self
        .findIndex((row) => row.document_id === item.document_id) === pos
      )

    const resourcesWithVotes = uniqueResources.map(row => {
      const filteredRows = rows
        .filter((resource) => resource.document_id === row.document_id)

      const totalCountTowardsIdentity = filteredRows
        .reduce((accumulator, currentValue) => accumulator + currentValue.power * (currentValue.choice === ChoiceEnum.TowardsIdentity ? 1 : 0), 0)

      const totalCountAbstain = filteredRows
        .reduce((accumulator, currentValue) => accumulator + currentValue.power * (currentValue.choice === ChoiceEnum.ABSTAIN ? 1 : 0), 0)

      const totalCountLock = filteredRows
        .reduce((accumulator, currentValue) => accumulator + currentValue.power * (currentValue.choice === ChoiceEnum.LOCK ? 1 : 0), 0)

      const totalCountVotes = totalCountLock + totalCountAbstain + totalCountTowardsIdentity

      return ContestedResource.fromObject({
        resourceValue: row.resource_value ?? null,
        timestamp: row.timestamp ?? null,
        endTimestamp: row.timestamp ? new Date(new Date(row.timestamp).getTime() + CONTESTED_RESOURCE_VOTE_DEADLINE) : null,
        dataContractIdentifier: row.data_contract_identifier ?? null,
        documentTypeName: row.document_type_name ?? null,
        indexName: Object.keys(row.prefunded_voting_balance)[0] ?? null,
        totalCountTowardsIdentity,
        totalCountAbstain,
        totalCountLock,
        totalCountVotes
      })
    })

    return new PaginatedResultSet(resourcesWithVotes, page, limit, Number(totalCount ?? 0))
  }

  getVotesForContestedResource = async (choice, resourceValue, page, limit, order) => {
    const fromRank = ((page - 1) * limit)

    let query = 'index_values = ?'
    const bindings = [JSON.stringify(resourceValue)]

    if (choice !== null && !isNaN(choice)) {
      query = query + ' and choice = ?'
      bindings.push(choice)
    }

    const prefundedDocumentsSubquery = this.knex('documents')
      .whereRaw('prefunded_voting_balance is not null')
      .andWhereRaw('data is not null')
      .as('sub')

    const documentsPrefundingIndexeKeysSubquery = this.knex(prefundedDocumentsSubquery)
      .select('id', 'data_contract_id', 'data')
      .select(this.knex.raw('jsonb_object_keys(prefunded_voting_balance) as key'))
      .as('sub')

    const dataContractsWithContestedDocs = this.knex(documentsPrefundingIndexeKeysSubquery)
      .select('schema', 'sub.id as document_id', 'data', 'sub.key as key')
      .leftJoin('data_contracts', 'sub.data_contract_id', 'data_contracts.id')
      .as('data_contracts_with_contested')

    const filteredIndexElementSubquery = this.knex
      .select('index_element', 'data', 'document_id', 'data_contracts_with_contested.key as key')
      .select(this.knex.raw('index_element->>\'name\' as name'))
      .whereRaw('index_element->>\'name\' = data_contracts_with_contested.key')
      .fromRaw('?, jsonb_each(schema) AS key_value(key, value), jsonb_array_elements(value->\'indices\') AS index_element', dataContractsWithContestedDocs)
      .as('index_elements')

    const keysSubquery = this.knex
      .select(
        'document_id', 'field_index', 'name as index_name', 'data',
        this.knex.raw('jsonb_object_keys(property) as property_keys')
      )
      .fromRaw('?, jsonb_array_elements(index_elements.index_element -> \'properties\') WITH ORDINALITY AS t(property,field_index)', filteredIndexElementSubquery)
      .as('keys_subquery')

    const documentsResourceValues = this.knex(keysSubquery)
      .select('document_id', 'index_name')
      .select(this.knex.raw('jsonb_agg(data->property_keys order by field_index asc) as resource_value'))
      .groupBy('index_name', 'document_id')
      .as('resource_values')

    const contestedDocumentsSubquery = this.knex(documentsResourceValues)
      .select(
        'resource_value', 'document_id',
        'identifier as document_identifier', 'owner'
      )
      .whereRaw('resource_value = ?', [JSON.stringify(resourceValue)])
      .leftJoin('documents', 'document_id', 'id')
      .as('contested_documents_sub')

    const subquery = this.knex('masternode_votes')
      .select('masternode_votes.id as id', 'pro_tx_hash', 'masternode_votes.state_transition_hash as state_transition_hash', 'voter_identity_id', 'choice',
        'towards_identity_identifier', 'data_contract_id', 'document_type_name', 'index_name', 'index_values',
        'data_contracts.identifier as data_contract_identifier', 'blocks.timestamp as timestamp', 'power')
      .whereRaw(query, bindings)
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')
      .leftJoin('state_transitions', 'masternode_votes.state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .as('subquery')

    const rows = await this.knex(subquery)
      .select(
        'pro_tx_hash', 'subquery.state_transition_hash as state_transition_hash', 'choice', 'document_identifier',
        'subquery.timestamp as timestamp', 'towards_identity_identifier', 'voter_identity_id', 'power',
        'data_contract_identifier', 'document_type_name', 'index_name', 'index_values'
      )
      .select(this.knex(subquery).count('*').as('total_count'))
      .offset(fromRank)
      .limit(limit)
      .leftJoin(contestedDocumentsSubquery, 'towards_identity_identifier', 'owner')
      .orderBy('subquery.id', order)

    const towardsIdentityIdentifiers = rows
      .filter(row => row.towards_identity_identifier)
      .map(row => row.towards_identity_identifier.trim())

    const aliasDocuments = await getAliasDocumentForIdentifiers(towardsIdentityIdentifiers, this.sdk)

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliasDocument = aliasDocuments[row.towards_identity_identifier.trim()]

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return Vote.fromRow({ ...row, aliases })
    }))

    const totalCount = rows.length > 0 ? Number(rows[0].total_count ?? 0) : 0

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getContestedResourcesStatus = async () => {
    const pendingTimestamp = new Date(new Date().getTime() - CONTESTED_RESOURCE_VOTE_DEADLINE)

    const prefundedDocumentsSubquery = this.knex('documents')
      .whereRaw('prefunded_voting_balance is not null')
      .andWhereRaw('data is not null')
      .groupBy('identifier', 'id', 'data_contract_id')
      .as('sub')

    const documentsPrefundingIndexeKeysSubquery = this.knex(prefundedDocumentsSubquery)
      .select('id', 'data_contract_id', 'data', 'state_transition_hash')
      .select(this.knex.raw('jsonb_object_keys(prefunded_voting_balance) as key'))
      .as('sub')

    const dataContractsWithContestedDocs = this.knex(documentsPrefundingIndexeKeysSubquery)
      .select('schema', 'sub.id as document_id', 'data', 'sub.key as key')
      .leftJoin('data_contracts', 'sub.data_contract_id', 'data_contracts.id')
      .as('data_contracts_with_contested')

    const filteredIndexElementSubquery = this.knex
      .select('index_element', 'data', 'document_id', 'data_contracts_with_contested.key as key')
      .select(this.knex.raw('index_element->>\'name\' as name'))
      .whereRaw('index_element->>\'name\' = data_contracts_with_contested.key')
      .fromRaw('?, jsonb_each(schema) AS key_value(key, value), jsonb_array_elements(value->\'indices\') AS index_element', dataContractsWithContestedDocs)
      .as('index_elements')

    const keysSubquery = this.knex
      .select(
        'document_id', 'field_index', 'name as index_name', 'data',
        this.knex.raw('jsonb_object_keys(property) as property_keys')
      )
      .fromRaw('?, jsonb_array_elements(index_elements.index_element -> \'properties\') WITH ORDINALITY AS t(property,field_index)', filteredIndexElementSubquery)
      .as('keys_subquery')

    const resourceValuesSubquery = this.knex(keysSubquery)
      .select('document_id')
      .select(this.knex.raw('jsonb_agg(data->property_keys order by field_index asc) as resource_value'))
      .groupBy('document_id')
      .as('resource_values')

    const rankSubquery = this.knex(resourceValuesSubquery)
      .select('document_id', 'resource_value')
      .select(this.knex.raw('row_number() over (PARTITION BY resource_value order by document_id desc) as value_rank'))
      .as('ranked_documents')

    const paginationRankSubquery = this.knex(rankSubquery)
      .select('document_id', 'resource_value')
      .where('value_rank', '=', '1')
      .as('sub')

    const timestampResourceSubquery = this.knex(paginationRankSubquery)
      .select('resource_value', 'timestamp')
      .where('timestamp', '<', new Date().toISOString())
      .andWhere('timestamp', '>', new Date(new Date().getTime() - CONTESTED_RESOURCE_VOTE_DEADLINE).toISOString())
      .leftJoin('documents', 'id', 'document_id')
      .leftJoin('state_transitions', 'state_transition_hash', 'hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .as('joined_subquery')

    const lastContestedResourceValue = this.knex(timestampResourceSubquery)
      .select('resource_value', 'timestamp', 'choice')
      .select(this.knex.raw('NULL::bigint as total_contested_documents_count'))
      .select(this.knex.raw('NULL::bigint as pending_contested_documents_count'))
      .select(this.knex.raw('NULL::bigint as total_votes_count'))
      .joinRaw('LEFT JOIN masternode_votes ON resource_value = index_values')

    const statusSubquery = this.knex('documents')
      .select(this.knex.raw('NULL::jsonb as resource_value'))
      .select(this.knex.raw('NULL::timestamptz as timestamp'))
      .select(this.knex.raw('NULL::bigint as choice'))
      .select(this.knex.raw('count(*) as total_contested_documents_count'))
      .select(this.knex.raw(`count(CASE WHEN timestamp>'${pendingTimestamp.toISOString()}'::timestamptz THEN 1 END) as pending_contested_documents_count`))
      .select(this.knex('masternode_votes').count('*').as('total_votes_count'))
      .where('revision', '=', 1)
      .andWhereRaw('prefunded_voting_balance is not null')
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'block_hash')

    const rows = await this.knex.union(statusSubquery, lastContestedResourceValue)

    const [status] = rows.filter(row => row.total_contested_documents_count !== null)

    if (rows.length < 2) {
      return ContestedResourceStatus.fromRow(status)
    }

    const [{ resource_value: resourceValue, timestamp }] = rows.filter(row => row.resource_value !== null)

    const expiringContestedResource = rows
      .filter(row => row.resourceValue !== null)
      .reduce((accumulator, currentValue) => {
        switch (Number(currentValue.choice ?? -1)) {
          case ChoiceEnum.TowardsIdentity:
            accumulator.totalCountTowardsIdentity += 1
            break
          case ChoiceEnum.ABSTAIN:
            accumulator.totalCountAbstain += 1
            break
          case ChoiceEnum.LOCK:
            accumulator.totalCountLock += 1
            break
        }
        return accumulator
      }, ContestedResource.fromObject({
        totalCountTowardsIdentity: 0,
        totalCountLock: 0,
        totalCountAbstain: 0,
        resourceValue,
        timestamp,
        endTimestamp: new Date(new Date(timestamp).getTime() + CONTESTED_RESOURCE_VOTE_DEADLINE)
      }))

    return ContestedResourceStatus.fromObject({
      ...ContestedResourceStatus.fromRow(status),
      expiringContestedResource
    })
  }
}
