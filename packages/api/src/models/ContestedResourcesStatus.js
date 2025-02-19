module.exports = class ContestedResourcesStatus {
  totalContestedResources
  totalPendingContestedResources
  totalVotesCount
  expiringContestedResource

  constructor (totalContestedResources, totalPendingContestedResources, totalVotesCount, expiringContestedResource) {
    this.totalContestedResources = totalContestedResources ?? null
    this.totalPendingContestedResources = totalPendingContestedResources ?? null
    this.totalVotesCount = totalVotesCount ?? null
    this.expiringContestedResource = expiringContestedResource ?? null
  }

  static fromObject ({ totalContestedResources, totalPendingContestedResources, totalVotesCount, expiringContestedResource }) {
    return new ContestedResourcesStatus(totalContestedResources, totalPendingContestedResources, totalVotesCount, expiringContestedResource)
  }

  /* eslint-disable camelcase */
  static fromRow ({ total_contested_documents_count, pending_contested_documents_count, total_votes_count }) {
    return new ContestedResourcesStatus(Number(total_contested_documents_count ?? 0), Number(pending_contested_documents_count ?? 0), Number(total_votes_count ?? 0))
  }
}
