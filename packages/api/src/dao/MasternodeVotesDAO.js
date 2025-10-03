const Vote = require('../models/Vote')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { getAliasFromDocument, getAliasDocumentForIdentifiers } = require('../utils')

module.exports = class MasternodeVotesDAO {
  constructor (knex, sdk) {
    this.knex = knex
    this.sdk = sdk
  }

  getMasternodeVotes = async (choice, timestampStart, timestampEnd, voterIdentity, towardsIdentity, power, page, limit, order) => {
    const fromRank = ((page - 1) * limit)

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

    const subquery = this.knex('masternode_votes')
      .select('masternode_votes.id as id', 'pro_tx_hash', 'masternode_votes.state_transition_hash as state_transition_hash', 'voter_identity_id', 'choice',
        'towards_identity_identifier', 'data_contract_id', 'document_type_name', 'index_name', 'index_values',
        'data_contracts.identifier as data_contract_identifier', 'blocks.timestamp as timestamp', 'power')
      .whereRaw(...timestampFilter)
      .whereRaw(...voterIdentityFilter)
      .whereRaw(...towardsIdentityFilter)
      .whereRaw(...choiceFilter)
      .whereRaw(...powerFilter)
      .leftJoin('data_contracts', 'data_contract_id', 'data_contracts.id')
      .leftJoin('state_transitions', 'masternode_votes.state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('pro_tx_hash', 'subquery.state_transition_hash as state_transition_hash', 'choice',
        'subquery.timestamp as timestamp', 'towards_identity_identifier', 'voter_identity_id',
        'data_contract_identifier', 'document_type_name', 'index_name', 'index_values', 'power')
      .select(this.knex(subquery).count('*').as('total_count'))
      .offset(fromRank)
      .limit(limit)
      .orderBy('subquery.id', order)

    const identifiers = rows
      .filter(row => row.towards_identity_identifier)
      .map(row => row.towards_identity_identifier.trim())

    const aliasDocuments = await getAliasDocumentForIdentifiers(identifiers, this.sdk)

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliasDocument = row.towards_identity_identifier ? aliasDocuments[row.towards_identity_identifier.trim()] : undefined

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

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
