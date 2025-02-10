const ChoiceEnum = require('../enums/ChoiceEnum')
const ContestedResource = require('../models/ContestedResource')
const { buildIndexBuffer, getAliasInfo, getAliasStateByVote } = require('../utils')
const { base58 } = require('@scure/base')
const Vote = require('../models/Vote')
const PaginatedResultSet = require('../models/PaginatedResultSet')

module.exports = class ContestedDAO {
  constructor (knex, dapi) {
    this.knex = knex
    this.dapi = dapi
  }

  getContestedResource = async (resourceValue) => {
    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

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
      .whereRaw('resource_value <@ ?', [JSON.stringify(resourceValue)])
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
        'masternode_votes.towards_identity_identifier as towards_identity', 'contested_documents_sub.index_name as index_name',
        'contested_documents_sub.owner as owner', 'document_identifier', 'document_timestamp as timestamp',
        'contested_documents_sub.document_type_name as document_type_name'
      )
      .joinRaw('left join masternode_votes ON masternode_votes.index_values <@ contested_documents_sub.resource_value')// ('masternode_votes', 'masternode_votes.index_values', 'contested_documents_sub.resource_value')
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'contested_documents_sub.owner')
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
      .reduce((accumulator, currentValue) => accumulator + (currentValue.choice === ChoiceEnum.TowardsIdentity ? 1 : 0), 0)

    const totalCountAbstain = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + (currentValue.choice === ChoiceEnum.ABSTAIN ? 1 : 0), 0)

    const totalCountLock = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + (currentValue.choice === ChoiceEnum.LOCK ? 1 : 0), 0)

    const totalCountVotes = uniqueVotes.length

    const totalVotesGasUsed = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + Number((currentValue.vote_gas_used ?? 0)), 0)

    const totalDocumentsGasUsed = uniqueContenders
      .reduce((accumulator, currentValue) => accumulator + Number((currentValue.document_tx_gas_used ?? 0)), 0)

    const contenders = await Promise.all(uniqueContenders.map(async (row) => {
      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias, this.dapi)

        return getAliasStateByVote(aliasInfo, { alias }, row.owner)
      }))

      return {
        identifier: row.owner?.trim() ?? null,
        timestamp: row.timestamp ?? null,
        documentIdentifier: row.document_identifier?.trim() ?? null,
        documentStateTransition: row.document_state_transition_hash ?? null,
        aliases: aliases ?? [],
        totalCountTowardsIdentity: uniqueVotes
          .filter((vote) => vote.towards_identity === row.owner)
          .reduce((accumulator, currentValue) => currentValue.choice === ChoiceEnum.TowardsIdentity
            ? accumulator + 1
            : accumulator
          , 0) ?? null,
        abstainVotes: uniqueVotes.reduce((accumulator, currentValue) => currentValue.choice === ChoiceEnum.ABSTAIN
          ? accumulator + 1
          : accumulator
        , 0) ?? null,
        lockVotes: uniqueVotes.reduce((accumulator, currentValue) => currentValue.choice !== ChoiceEnum.ABSTAIN && currentValue.towards_identity !== row.owner
          ? accumulator + 1
          : accumulator
        , 0) ?? null
      }
    }))

    let status

    if (firstTx.data_contract_identifier && firstTx.index_name && firstTx.document_type_name && firstTx.resource_value) {
      const { finishedVoteInfo } = await this.dapi.getContestedState(
        base58.decode(firstTx.data_contract_identifier),
        firstTx.document_type_name,
        firstTx.index_name,
        1,
        firstTx.resource_value.map(buildIndexBuffer)
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
      status
    })
  }

  getContestedResources = async (page, limit, order) => {
    const fromRank = (page - 1) * limit + 1
    const toRank = fromRank + limit - 1

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

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
      .select(this.knex.raw('row_number() over (PARTITION BY resource_value order by document_id) as value_rank'))
      .as('ranked_documents')

    return this.knex(rankSubquery)
      .select('document_id', 'resource_value')
      .where('value_rank', '=', '1')


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
      .reduce((accumulator, currentValue) => accumulator + (currentValue.choice === ChoiceEnum.TowardsIdentity ? 1 : 0), 0)

    const totalCountAbstain = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + (currentValue.choice === ChoiceEnum.ABSTAIN ? 1 : 0), 0)

    const totalCountLock = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + (currentValue.choice === ChoiceEnum.LOCK ? 1 : 0), 0)

    const totalCountVotes = uniqueVotes.length

    const totalVotesGasUsed = uniqueVotes
      .reduce((accumulator, currentValue) => accumulator + Number((currentValue.vote_gas_used ?? 0)), 0)

    const totalDocumentsGasUsed = uniqueContenders
      .reduce((accumulator, currentValue) => accumulator + Number((currentValue.document_tx_gas_used ?? 0)), 0)

    const contenders = await Promise.all(uniqueContenders.map(async (row) => {
      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias, this.dapi)

        return getAliasStateByVote(aliasInfo, { alias }, row.owner)
      }))

      return {
        identifier: row.owner?.trim() ?? null,
        timestamp: row.timestamp ?? null,
        documentIdentifier: row.document_identifier?.trim() ?? null,
        documentStateTransition: row.document_state_transition_hash ?? null,
        aliases: aliases ?? [],
        totalCountTowardsIdentity: uniqueVotes
          .filter((vote) => vote.towards_identity === row.owner)
          .reduce((accumulator, currentValue) => currentValue.choice === ChoiceEnum.TowardsIdentity
              ? accumulator + 1
              : accumulator
            , 0) ?? null,
        abstainVotes: uniqueVotes.reduce((accumulator, currentValue) => currentValue.choice === ChoiceEnum.ABSTAIN
            ? accumulator + 1
            : accumulator
          , 0) ?? null,
        lockVotes: uniqueVotes.reduce((accumulator, currentValue) => currentValue.choice !== ChoiceEnum.ABSTAIN && currentValue.towards_identity !== row.owner
            ? accumulator + 1
            : accumulator
          , 0) ?? null
      }
    }))

    let status

    if (firstTx.data_contract_identifier && firstTx.index_name && firstTx.document_type_name && firstTx.resource_value) {
      const { finishedVoteInfo } = await this.dapi.getContestedState(
        base58.decode(firstTx.data_contract_identifier),
        firstTx.document_type_name,
        firstTx.index_name,
        1,
        firstTx.resource_value.map(buildIndexBuffer)
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
      status
    })
  }

  getVotesForContestedResource = async (choice, resourceValue, page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    let query = 'index_values = ?'
    const bindings = [JSON.stringify(resourceValue)]

    if (choice) {
      query = query + ' and choice = ?'
      bindings.push(choice)
    }

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const subquery = this.knex('masternode_votes')
      .select('masternode_votes.id as id', 'pro_tx_hash', 'masternode_votes.state_transition_hash as state_transition_hash', 'voter_identity_id', 'choice',
        'towards_identity_identifier', 'data_contract_id', 'document_type_name', 'index_name', 'index_values',
        'data_contracts.identifier as data_contract_identifier', 'blocks.timestamp as timestamp', 'aliases')
      .select(this.knex.raw(`rank() over (order by masternode_votes.id ${order}) rank`))
      .whereRaw(query, bindings)
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')
      .leftJoin('state_transitions', 'masternode_votes.state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'towards_identity_identifier')
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('pro_tx_hash', 'subquery.state_transition_hash as state_transition_hash', 'choice',
        'subquery.timestamp as timestamp', 'towards_identity_identifier', 'voter_identity_id',
        'data_contract_identifier', 'document_type_name', 'index_name', 'index_values', 'aliases')
      .select(this.knex(subquery).count('*').as('total_count'))
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('subquery.id', order)

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias, this.dapi)

        return getAliasStateByVote(aliasInfo, { alias }, row.owner)
      }))

      return Vote.fromRow({ ...row, aliases })
    }))

    const totalCount = rows.length > 0 ? Number(rows[0].total_count ?? 0) : 0

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
