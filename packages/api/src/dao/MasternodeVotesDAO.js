const Vote = require('../models/Vote')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { getAliasInfo, getAliasStateByVote, buildIndexBuffer } = require('../utils')
const { base58 } = require('@scure/base')

module.exports = class MasternodeVotesDAO {
  constructor (knex, dapi) {
    this.knex = knex
    this.dapi = dapi
  }

  getMasternodeVotes = async (choice, timestampStart, timestampEnd, voterIdentity, towardsIdentity, power, page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const timestampFilter = timestampStart && timestampEnd
      ? [
          'blocks.timestamp BETWEEN ? AND ?',
          [timestampStart, timestampEnd]
        ]
      : ['true']

    const voterIdentityFilter = voterIdentity
      ? [
          'state_transitions.owner = ?',
          [voterIdentity]
        ]
      : ['true']

    const towardsIdentityFilter = towardsIdentity
      ? [
          'towards_identity_identifier = ?',
          [towardsIdentity]
        ]
      : ['true']

    const choiceFilter = choice
      ? [
          'choice = ?',
          [choice]
        ]
      : ['true']

    const powerFilter = power
      ? [
          'power = ?',
          [power]
        ]
      : ['true']

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier')
      .select(this.knex.raw(`
          array_agg(
            json_build_object(
              'alias', alias,
              'tx', state_transition_hash
            )
          ) as aliases
        `))
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

    const documentsGroupSubquery = this.knex(resourceValuesSubquery)
      .select('resource_value')
      .select(this.knex.raw('array_agg(document_id) as document_ids'))
      .groupBy('resource_value')
      .as('resource_values')

    const subquery = this.knex('masternode_votes')
      .select('masternode_votes.id as id', 'pro_tx_hash', 'masternode_votes.state_transition_hash as state_transition_hash', 'voter_identity_id', 'choice',
        'towards_identity_identifier', 'data_contract_id', 'document_type_name', 'index_name', 'index_values', 'document_ids',
        'data_contracts.identifier as data_contract_identifier', 'blocks.timestamp as timestamp', 'aliases', 'power')
      .select(this.knex.raw(`rank() over (order by masternode_votes.id ${order}) rank`))
      .whereRaw(...timestampFilter)
      .whereRaw(...voterIdentityFilter)
      .whereRaw(...towardsIdentityFilter)
      .whereRaw(...choiceFilter)
      .whereRaw(...powerFilter)
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')
      .leftJoin('state_transitions', 'masternode_votes.state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'towards_identity_identifier')
      .leftJoin(documentsGroupSubquery, 'resource_values.resource_value', 'index_values')
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('pro_tx_hash', 'subquery.state_transition_hash as state_transition_hash', 'choice',
        'subquery.timestamp as timestamp', 'towards_identity_identifier', 'voter_identity_id', 'document_ids',
        'data_contract_identifier', 'document_type_name', 'index_name', 'index_values', 'aliases', 'power')
      .select(this.knex(subquery).count('*').as('total_count'))
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('subquery.id', order)

    const t = await Promise.all(rows.map(async row => {
      const value = row.index_values.map(val => buildIndexBuffer(val))

      const d = await this.dapi.getContestedState(
        Buffer.from(base58.decode(row.data_contract_identifier)).toString('base64'),
        row.document_type_name.trim(),
        row.index_name.trim(),
        1,
        value
      )

      return {
        ...row,
        d
      }
    }))

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias.alias, this.dapi)

        return getAliasStateByVote(aliasInfo, alias, row.owner)
      }))

      return Vote.fromRow({ ...row, aliases })
    }))

    const totalCount = rows.length > 0 ? Number(rows[0].total_count ?? 0) : 0

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getMasternodeVoteByTx = async (hash) => {
    const [row] = await this.knex('masternode_votes')
      .select('pro_tx_hash', 'masternode_votes.state_transition_hash as state_transition_hash', 'voter_identity_id', 'choice',
        'blocks.timestamp as timestamp', 'towards_identity_identifier', 'document_type_name',
        'data_contracts.identifier as data_contract_identifier', 'index_name', 'index_values', 'power')
      .where('masternode_votes.state_transition_hash', '=', hash)
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')

    return row ? Vote.fromRow(row) : null
  }
}
