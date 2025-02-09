const Document = require('../models/Document')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const DocumentActionEnum = require('../enums/DocumentActionEnum')
const { decodeStateTransition, getAliasInfo, getAliasStateByVote } = require('../utils')

module.exports = class DocumentsDAO {
  constructor (knex, dapi, client) {
    this.knex = knex
    this.client = client
    this.dapi = dapi
  }

  getDocumentByIdentifier = async (identifier) => {
    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const subquery = this.knex('documents')
      .select('documents.id as id', 'documents.identifier as identifier', 'documents.owner as document_owner',
        'data_contracts.identifier as data_contract_identifier', 'documents.data as data', 'document_type_name',
        'documents.revision as revision', 'documents.state_transition_hash as tx_hash', 'state_transitions.data as tx_data',
        'documents.deleted as deleted', 'documents.is_system as is_system', 'documents.transition_type as transition_type')
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .leftJoin('state_transitions', 'hash', 'documents.state_transition_hash')
      .where('documents.identifier', '=', identifier)
      .as('documents')

    const rows = await this.knex(subquery)
      .select('identifier', 'document_owner', 'data_contract_identifier', 'transition_type', 'aliases.aliases as aliases',
        'deleted', 'tx_hash', 'is_system', 'blocks.timestamp as timestamp', 'document_type_name')
      .select(
        this.knex(subquery)
          .select('documents.data')
          .orderBy('documents.id', 'desc')
          .limit(1)
          .as('data')
      )
      .select(
        this.knex(subquery)
          .select('documents.revision')
          .orderBy('documents.revision', 'desc')
          .limit(1)
          .as('revision')
      )
      .select(
        this.knex(subquery)
          .select('documents.tx_data')
          .where('documents.transition_type', DocumentActionEnum.Create)
          .limit(1)
          .as('create_tx_data')
      )
      .orderBy('documents.id', 'desc')
      .leftJoin(aliasesSubquery, 'aliases.identity_identifier', 'document_owner')
      .leftJoin('state_transitions', 'state_transitions.hash', 'tx_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .limit(1)

    const [row] = rows

    if (!row) {
      return null
    }

    const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
      const aliasInfo = await getAliasInfo(alias, this.dapi)

      return getAliasStateByVote(aliasInfo, { alias }, row.document_owner)
    }))

    let transitions = []

    if (row.create_tx_data) {
      const decodedTransitions = await decodeStateTransition(this.client, row.create_tx_data)

      transitions = decodedTransitions.transitions ?? []
    }

    const [transitionWithEntropy] = transitions?.filter(transition => transition.entropy !== '')

    const document = Document.fromRow({
      ...row,
      owner: {
        identifier: row.document_owner?.trim(),
        aliases: aliases ?? []
      }
    })

    return Document.fromObject({
      ...document,
      entropy: transitionWithEntropy?.entropy,
      prefundedVotingBalance: transitionWithEntropy?.prefundedVotingBalance,
      nonce: transitionWithEntropy?.nonce
    })
  }

  getDocumentsByDataContract = async (identifier, typeName, page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    let typeQuery = 'data_contracts.identifier = ?'
    const queryBindings = [identifier]

    if (typeName) {
      typeQuery = typeQuery + ' and document_type_name = ?'
      queryBindings.push(typeName)
    }

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const dataSubquery = this.knex('documents')
      .select('documents.data as data', 'documents.identifier as identifier')
      .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.revision desc) rank'))
      .orderBy('documents.id', 'desc')
      .as('documents_data')

    const filterDataSubquery = this.knex(dataSubquery)
      .select('data', 'identifier')
      .where('documents_data.rank', '1')
      .as('documents_data')

    const subquery = this.knex('documents')
      .select('documents.id as id', 'documents.identifier as identifier', 'documents.owner as document_owner',
        'data_contracts.identifier as data_contract_identifier', 'document_type_name', 'documents.data as document_data',
        'documents.revision as revision', 'documents.state_transition_hash as tx_hash',
        'documents.deleted as deleted', 'documents.is_system as is_system', 'transition_type', 'prefunded_voting_balance')
      .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .whereRaw(typeQuery, queryBindings)

    const filteredDocuments = this.knex.with('with_alias', subquery)
      .select('id', 'with_alias.identifier as identifier', 'document_owner', 'rank', 'revision', 'data_contract_identifier',
        'tx_hash', 'deleted', 'is_system', 'document_data', 'document_type_name', 'transition_type', 'prefunded_voting_balance',
        this.knex('with_alias').count('*').as('total_count').where('rank', '1'))
      .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
      .from('with_alias')
      .where('rank', '1')
      .as('documents')

    const rows = await this.knex(filteredDocuments)
      .select('documents.id as id', 'documents.identifier as identifier', 'document_owner', 'row_number', 'revision', 'data_contract_identifier',
        'tx_hash', 'deleted', 'document_data', 'total_count', 'is_system', 'blocks.timestamp as timestamp', 'prefunded_voting_balance',
        'document_type_name', 'transition_type', 'aliases')
      .whereBetween('row_number', [fromRank, toRank])
      .leftJoin('state_transitions', 'tx_hash', 'state_transitions.hash')
      .leftJoin(filterDataSubquery, 'documents.identifier', '=', 'documents_data.identifier')
      .leftJoin(aliasesSubquery, 'document_owner', 'identity_identifier')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .orderBy('id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias, this.dapi)

        return getAliasStateByVote(aliasInfo, { alias }, row.owner)
      }))

      return Document.fromRow({
        ...row,
        data: row.document_data,
        owner: {
          identifier: row.document_owner?.trim(),
          aliases: aliases ?? []
        }
      })
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getDocumentRevisions = async (identifier, page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const subquery = this.knex('documents')
      .select(
        'documents.id as id', 'revision', 'transition_type', 'gas_used', 'timestamp', 'identifier',
        'documents.owner as owner', 'state_transitions.hash as hash', 'documents.data as data')
      .select(this.knex.raw(`rank() over (order by state_transitions.id ${order}) rank`))
      .where('documents.identifier', '=', identifier)
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('revision', 'gas_used', 'subquery.owner', 'hash as tx_hash', 'timestamp', 'transition_type', 'data', 'identifier', 'aliases')
      .select(this.knex(subquery).count('*').as('total_count'))
      .whereBetween('rank', [fromRank, toRank])
      .leftJoin(aliasesSubquery, 'identity_identifier', 'owner')
      .orderBy('id', order)

    const [row] = rows

    const totalCount = row?.total_count

    const resultSet = await Promise.all(rows.map(async (row) => {
      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias, this.dapi)

        return getAliasStateByVote(aliasInfo, { alias }, row.owner)
      }))

      return Document.fromRow({
        ...row,
        owner: {
          identifier: row.owner?.trim(),
          aliases: aliases ?? []
        }
      })
    }))

    return new PaginatedResultSet(resultSet, page, limit, Number(totalCount))
  }
}
