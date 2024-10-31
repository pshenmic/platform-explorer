const {Identifier} = require('dash').PlatformProtocol

const {
  v0: {GetDocumentsRequest},
} = require('@dashevo/dapi-grpc');

class DAPI {
  dapi
  dpp

  constructor(dapi, dpp) {
    this.dapi = dapi
    this.dpp = dpp
  }

  async getIdentityBalance(identifier) {
    const {balance} = await this.dapi.platform.getIdentityBalance(Identifier.from(identifier))
    return balance
  }

  async getTotalCredits() {
    const {totalCreditsInPlatform} = await this.dapi.platform.getTotalCreditsInPlatform()
    return totalCreditsInPlatform
  }

  async getEpochsInfo(count, start, ascending) {
    const {epochsInfo} = await this.dapi.platform.getEpochsInfo(start, count, {ascending})
    return epochsInfo
  }

  async getContestedState(contractId,
                          documentTypeName,
                          indexName = 'parentNameAndLabel',
                          resultType = 2,
                          indexValuesList, startAtIdentifierInfo,
                          allowIncludeLockedAndAbstainingVoteTally,
                          count
  ) {
    const {contestedResourceContenders} = await this.dapi.platform.getContestedResourceVoteState(
      Buffer.from(contractId, 'base64'),
      documentTypeName,
      indexName,
      resultType,
      indexValuesList,
      startAtIdentifierInfo,
      allowIncludeLockedAndAbstainingVoteTally,
      count
    )
    return contestedResourceContenders
  }
}

module.exports = DAPI
