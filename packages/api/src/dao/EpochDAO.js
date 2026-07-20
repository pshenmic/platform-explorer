const EpochData = require('../models/EpochData')
const ChoiceEnum = require('../enums/ChoiceEnum')
const BatchEnum = require('../enums/BatchEnum')
const { DPNS_CONTRACT } = require('../constants')

module.exports = class EpochDAO {
  constructor (knex) {
    this.knex = knex
  }

  getEpochByObject = async (epoch) => {
    const epochEnd = new Date(epoch.endTime)
    const epochPeriod = epoch.endTime - epoch.startTime

    const votersSubquery = this.knex('masternode_votes')
      .select('voter_identity_id')
      .select(this.knex.raw('count(*) as rating'))
      .select(this.knex.raw(`SUM(CASE WHEN choice=${ChoiceEnum.TowardsIdentity} THEN 1 ELSE 0 END) as voter_yes`))
      .select(this.knex.raw(`SUM(CASE WHEN choice=${ChoiceEnum.ABSTAIN} THEN 1 ELSE 0 END) as voter_abstain`))
      .select(this.knex.raw(`SUM(CASE WHEN choice=${ChoiceEnum.LOCK} THEN 1 ELSE 0 END) as voter_lock`))
      .where('timestamp', '>', new Date(epoch.startTime).toISOString())
      .andWhere('timestamp', '<=', epochEnd.toISOString())
      .orderBy('rating', 'desc')
      .groupBy('voter_identity_id')
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .as('voters_subquery')

    const votesBaseSubquery = this.knex('masternode_votes')
      .where('timestamp', '>', new Date(epoch.startTime).toISOString())
      .andWhere('timestamp', '<=', epochEnd.toISOString())
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .as('total_votes')

    const votesSubquery = this.knex(votesBaseSubquery)
      .select('index_values')
      .select(this.knex.raw('count(*) as rating'))
      .orderBy('rating', 'desc')
      .limit(1)
      .groupBy('index_values')
      .as('votes_subquery')

    const votes = this.knex(votesSubquery)
      .select('choice')
      .leftJoin('masternode_votes', 'masternode_votes.index_values', 'votes_subquery.index_values')
      .leftJoin('state_transitions', 'state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .as('resource_votes')

    const documentsSubquery = this.knex('documents')
      .select('documents.transition_type', 'documents.document_type_name', 'documents.prefunded_voting_balance', 'data_contracts.identifier as data_contract_identifier')
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .leftJoin('state_transitions', 'state_transitions.hash', 'documents.state_transition_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .where('blocks.timestamp', '>', new Date(epoch.startTime).toISOString())
      .andWhere('blocks.timestamp', '<=', epochEnd.toISOString())
      .as('epoch_documents')

    const bestValidator = this.knex('blocks')
      .select('validator')
      .count('* as rating')
      .where('timestamp', '>', new Date(epoch.startTime).toISOString())
      .andWhere('timestamp', '<=', epochEnd.toISOString())
      .groupBy('validator')
      .as('bestValidator')

    const subquery = this.knex('state_transitions')
      .select(
        'validators.pro_tx_hash',
        this.knex.raw('ROW_NUMBER() OVER (ORDER BY COUNT(blocks.hash) DESC) as row_num')
      )
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
      .leftJoin('validators', 'blocks.validator', 'validators.pro_tx_hash')
      .sum('gas_used as collected_fees')
      .count('* as tx_count')
      .where('blocks.timestamp', '>', new Date(epoch.startTime).toISOString())
      .andWhere('blocks.timestamp', '<=', epochEnd.toISOString())
      .groupBy('validators.pro_tx_hash')
      .as('subquery')

    const epochInfo = this.knex(subquery)
      .select(
        'tx_count',
        'collected_fees',
        'row_num',
        this.knex.raw('SUM(collected_fees) OVER () as total_collected_fees'),
        this.knex.raw('SUM(tx_count) OVER () as total_tx_count'),
        this.knex.raw(`SUM(tx_count) OVER () * 1.0 / ${epochPeriod / 1000} as tps`)
      )
      .orderBy('row_num', 'asc')
      .limit(1)
      .as('epochInfo')

    const isInProgressEpoch = epoch.totalBlocksInEpoch === null && epoch.endTime > Date.now()

    const columns = [
      this.knex(bestValidator)
        .select('validator')
        .orderBy('rating', 'desc')
        .limit(1)
        .as('best_validator'),
      this.knex(epochInfo).select('total_tx_count').as('total_tx_count'),
      this.knex(epochInfo).select('total_collected_fees').as('total_collected_fees'),
      this.knex(epochInfo).select('tps').as('tps'),
      this.knex(votesSubquery).select('index_values').as('top_voted_resource'),
      this.knex(votes)
        .count('* as yes')
        .where('choice', '=', ChoiceEnum.TowardsIdentity)
        .as('resource_votes_yes'),
      this.knex(votes)
        .count('* as abstain')
        .where('choice', '=', ChoiceEnum.ABSTAIN)
        .as('resource_votes_abstain'),
      this.knex(votes)
        .count('* as lock')
        .where('choice', '=', ChoiceEnum.LOCK)
        .as('resource_votes_lock'),
      this.knex(votersSubquery).select('voter_identity_id').limit(1).as('voter_identity_id'),
      this.knex(votersSubquery).select('voter_yes').limit(1).as('voter_yes'),
      this.knex(votersSubquery).select('voter_abstain').limit(1).as('voter_abstain'),
      this.knex(votersSubquery).select('voter_lock').limit(1).as('voter_lock'),
      this.knex(votesBaseSubquery)
        .count('*')
        .as('total_votes'),
      this.knex(votesBaseSubquery)
        .sum('gas_used')
        .as('total_votes_gas_used'),
      this.knex(documentsSubquery)
        .count('*')
        .where('transition_type', '=', BatchEnum.DOCUMENT_CREATE)
        .as('total_created_documents_count'),
      this.knex(documentsSubquery)
        .count('*')
        .where('transition_type', '=', BatchEnum.DOCUMENT_DELETE)
        .as('total_deleted_documents_count'),
      this.knex(documentsSubquery)
        .count('*')
        .where('transition_type', '=', BatchEnum.DOCUMENT_CREATE)
        .andWhere('document_type_name', '=', 'domain')
        .andWhere('data_contract_identifier', '=', DPNS_CONTRACT)
        .as('total_registered_names_count'),
      this.knex(documentsSubquery)
        .count('*')
        .where('transition_type', '=', BatchEnum.DOCUMENT_CREATE)
        .whereRaw('prefunded_voting_balance is not null')
        .as('total_contested_documents_count'),
      this.knex('blocks')
        .select(this.knex.raw('CASE WHEN count(*) > 1 THEN round(extract(epoch from max(timestamp) - min(timestamp)) * 1000 / (count(*) - 1)) ELSE NULL END'))
        .where('timestamp', '>', new Date(epoch.startTime).toISOString())
        .andWhere('timestamp', '<=', epochEnd.toISOString())
        .as('avg_block_time')
    ]

    if (isInProgressEpoch) {
      columns.push(
        this.knex('blocks')
          .count('*')
          .where('height', '>=', Number(epoch.firstBlockHeight))
          .as('pending_blocks_in_epoch'),
        this.knex('state_transitions')
          .sum('gas_used')
          .where('block_height', '>=', Number(epoch.firstBlockHeight))
          .as('pending_epoch_reward')
      )
    }

    const [row] = await this.knex.select(columns)

    return EpochData.fromObject({ epoch, ...row })
  }
}
