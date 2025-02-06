const EpochData = require('../models/EpochData')
const ChoiceEnum = require('../enums/ChoiceEnum')

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
        this.knex.raw(`SUM(tx_count) OVER () * 1.0 / ${epochPeriod / 1000} as tps`)
      )
      .orderBy('row_num', 'asc')
      .limit(1)
      .as('epochInfo')

    const [row] = await this.knex(bestValidator)
      .orderBy('rating', 'desc')
      .limit(1)
      .select(
        'validator as best_validator',
        this.knex(epochInfo).select('tx_count').as('tx_count'),
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
          .as('total_votes_gas_used')
      )

    return EpochData.fromObject({ epoch, ...row })
  }
}
