const Vote = require('../models/Vote')
const PaginatedResultSet = require('../models/PaginatedResultSet')

module.exports = class MasternodeVotesDAO {
  constructor (knex) {
    this.knex = knex
  }

  getMasternodeVotes = async (timestampStart, timestampEnd, voterIdentity, towardsIdentity, choice, power, page, limit, order) => {
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
          [voterIdentity]
        ]
      : ['true']

    const choiceFilter = choice
      ? [
          'towards_identity_identifier = ?',
          [voterIdentity]
        ]
      : ['true']

    // TODO: Implement Power filter

    const subquery = this.knex('masternode_votes')
      .select('id', 'pro_tx_hash', 'state_transition_hash', 'voter_identity_id', 'choice',
        'towards_identity_identifier', 'data_contract_id', 'document_type_name', 'index_name', 'index_values',
        'data_contracts.identifier as data_contract_identifier', 'blocks.timestamp as timestamp')
      .select(this.knex.raw(`rank() over (order by id ${order}) rank`))
      .select(this.knex('masternode_votes').count('id').as('total_count'))
      .whereRaw(...timestampFilter)
      .whereRaw(...voterIdentityFilter)
      .whereRaw(...towardsIdentityFilter)
      .whereRaw(...choiceFilter)
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('pro_tx_hash', 'subquery.state_transition_hash as state_transition_hash', 'choice',
        'timestamp', 'towards_identity_identifier', 'total_count', 'voter_identity_id',
        'data_contract_identifier', 'document_type_name', 'index_name', 'index_values')
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('subquery.id', order)

    const resultSet = rows.map(row => Vote.fromRow(row))
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

  getMasternodeVotesByIdentity = async (identifier, page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('masternode_votes')
      .select('id', 'pro_tx_hash', 'state_transition_hash', 'voter_identity_id', 'choice',
        'towards_identity_identifier', 'data_contract_id', 'document_type_name', 'index_name', 'index_values')
      .select(this.knex.raw(`rank() over (order by id ${order}) rank`))
      .where('voter_identity_id', '=', identifier)
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('pro_tx_hash', 'subquery.state_transition_hash as state_transition_hash', 'voter_identity_id', 'choice',
        'blocks.timestamp as timestamp', 'towards_identity_identifier',
        'data_contracts.identifier as data_contract_identifier', 'document_type_name', 'index_name', 'index_values')
      .select(this.knex(subquery).count('id').as('total_count'))
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('subquery.id', order)

    const resultSet = rows.map(row => Vote.fromRow(row))
    const totalCount = rows.length > 0 ? Number(rows[0].total_count ?? 0) : 0

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }
}
