module.exports = class ContestedResourcesStatus {
  totalContestedResources
  totalPendingContestedResources
  totalVotesCount
  endingResourceValue

  constructor (totalContestedResources, totalPendingContestedResources, totalVotesCount, endingResourceValue) {
    this.totalContestedResources = totalContestedResources ?? null
    this.totalPendingContestedResources = totalPendingContestedResources ?? null
    this.totalVotesCount = totalVotesCount ?? null
    this.endingResourceValue = endingResourceValue ?? null
  }

  static fromObject ({ totalContestedResources, totalPendingContestedResources, totalVotesCount, endingResourceValue }) {
    return new ContestedResourcesStatus(totalContestedResources, totalPendingContestedResources, totalVotesCount, endingResourceValue)
  }

  /* eslint-disable camelcase */
  static fromRow ({ total_contested_documents_count, pending_contested_documents_count, total_votes_count }) {
    return new ContestedResourcesStatus(Number(total_contested_documents_count ?? 0), Number(pending_contested_documents_count ?? 0), Number(total_votes_count ?? 0))
  }
}
