const Vote = require('../models/Vote')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const {getAliasInfo, getAliasStateByVote} = require("../utils");

module.exports = class MasternodeVotesDAO {
  constructor (knex, dapi) {
    this.knex = knex
    this.dapi = dapi
  }

  getMasternodeVotes = async (choice, resourceValue, timestampStart, timestampEnd, voterIdentity, towardsIdentity, power, page, limit, order) => {
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

    const resourceFilter = resourceValue
      ? [
        'index_values = ?',
        [JSON.stringify(resourceValue)]
      ]
      : ['true']

    // TODO: Implement Power filter

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const subquery = this.knex('masternode_votes')
      .select('masternode_votes.id as id', 'pro_tx_hash', 'masternode_votes.state_transition_hash as state_transition_hash', 'voter_identity_id', 'choice',
        'towards_identity_identifier', 'data_contract_id', 'document_type_name', 'index_name', 'index_values',
        'data_contracts.identifier as data_contract_identifier', 'blocks.timestamp as timestamp', 'aliases')
      .select(this.knex.raw(`rank() over (order by masternode_votes.id ${order}) rank`))
      .whereRaw(...timestampFilter)
      .whereRaw(...voterIdentityFilter)
      .whereRaw(...towardsIdentityFilter)
      .whereRaw(...choiceFilter)
      .whereRaw(...resourceFilter)
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

  getMasternodeVoteByTx = async (hash) => {
    const [row] = await this.knex('masternode_votes')
      .select('pro_tx_hash', 'masternode_votes.state_transition_hash as state_transition_hash', 'voter_identity_id', 'choice',
        'blocks.timestamp as timestamp', 'towards_identity_identifier', 'document_type_name',
        'data_contracts.identifier as data_contract_identifier', 'index_name', 'index_values')
      .where('masternode_votes.state_transition_hash', '=', hash)
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')

    return row ? Vote.fromRow(row) : null
  }
}
