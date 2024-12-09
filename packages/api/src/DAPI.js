const { Identifier } = require('dash').PlatformProtocol

class DAPI {
  dapi
  dpp

  constructor (dapi, dpp) {
    this.dapi = dapi
    this.dpp = dpp
  }

  async getIdentityBalance (identifier) {
    const { balance } = await this.dapi.platform.getIdentityBalance(Identifier.from(identifier))
    return balance
  }

  async getTotalCredits () {
    const { totalCreditsInPlatform } = await this.dapi.platform.getTotalCreditsInPlatform()
    return totalCreditsInPlatform
  }

  async getEpochsInfo (count, start, ascending) {
    const { epochsInfo } = await this.dapi.platform.getEpochsInfo(start, count, { ascending })
    return epochsInfo
  }

  /**
   * Fetch documents from DAPI
   * Allows **only one field** `identifier`**|**`owner`
   * @typedef {getDocuments}
   * @param {string} type
   * @param {object} dataContractObject
   * @param {string} identifier
   * @param {string} owner
   * @param {number} limit
  */
  async getDocuments (type, dataContractObject, identifier, owner, limit) {
    const dataContract = await this.dpp.dataContract.createFromObject(dataContractObject)

    const { documents } = await this.dapi.platform.getDocuments(Identifier.from(dataContractObject.id), type, {
      limit,
      where: [
        identifier
          ? ['$id', '=', Identifier.from(identifier)]
          : ['$ownerId', '=', Identifier.from(owner)]
      ]
    })

    return documents.map(
      (document) => this.dpp.document.createExtendedDocumentFromDocumentBuffer(document, type, dataContract).getDocument()
    )
  }

  /**
   * Fetch the version upgrade votes status
   * @typedef {getContestedState}
   * @param {string} contractId - base64 contractId
   * @param {string} documentTypeName
   * @param {string} indexName
   * @param {number} resultType
   * @param {Array<Buffer>} indexValuesList
   * @param {StartAtIdentifierInfo} [startAtIdentifierInfo]
   * @param {number} [count]
   * @returns {Promise<contestedResourceContenders>}
   */
  async getContestedState (contractId,
    documentTypeName,
    indexName,
    resultType,
    indexValuesList,
    startAtIdentifierInfo,
    allowIncludeLockedAndAbstainingVoteTally,
    count
  ) {
    const { contestedResourceContenders } = await this.dapi.platform.getContestedResourceVoteState(
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
