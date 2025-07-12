const { IdentifierWASM, IdentityPublicKeyWASM } = require('pshenmic-dpp')

class DAPI {
  dapi
  dpp

  constructor (dapi, dpp) {
    this.dapi = dapi
    this.dpp = dpp
  }

  async getIdentityBalance (identifier) {
    const { balance } = await this.dapi.platform.getIdentityBalance(new IdentifierWASM(identifier).bytes())
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
   * @param {Array<Array>} query
   * @param {number} limit
   * @param {Array<Array>} orderBy
   * @param {?boolean} raw returns raw data if `true`
   * @param {Object} skip - {startAfter?: {Buffer}, startAt?: {Buffer}}
   */
  async getDocuments (type, dataContractObject, query, limit, orderBy, skip, raw) {
    const dataContract = await this.dpp.dataContract.createFromObject(dataContractObject)

    const { startAt, startAfter } = skip ?? {}

    const { documents } = await this.dapi.platform.getDocuments(new IdentifierWASM(dataContractObject.id).bytes(), type, {
      limit,
      where: query,
      orderBy,
      startAt,
      startAfter
    })

    return raw
      ? documents
      : (documents ?? []).map(
          (document) => this.dpp.document.createExtendedDocumentFromDocumentBuffer(document, type, dataContract).getDocument())
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

  async getIdentityKeys (identifier, keysIds, limit) {
    const { identityKeys } = await this.dapi.platform.getIdentityKeys(new IdentifierWASM(identifier).bytes(), keysIds, limit)

    return identityKeys.map(key => {
      const serialized = IdentityPublicKeyWASM.fromBytes(key)

      const contractBounds = serialized.getContractBounds()

      return {
        keyId: serialized.keyId,
        type: serialized.keyTypeNumber,
        raw: Buffer.from(key).toString('hex'),
        data: serialized.data,
        purpose: serialized.purposeNumber,
        securityLevel: serialized.securityLevelNumber,
        isReadOnly: serialized.readOnly,
        isMaster: serialized.isMaster(),
        hash: serialized.getPublicKeyHash(),
        contractBounds: contractBounds
          ? {
              type: contractBounds.contractBoundsType,
              id: contractBounds.identifier.base58(),
              typeName: contractBounds.documentTypeName
            }
          : null
      }
    })
  }

  async getIdentityNonce (identifier) {
    const { identityNonce } = await this.dapi.platform.getIdentityNonce(new IdentifierWASM(identifier).bytes())
    return identityNonce
  }

  async getIdentityContractNonce (identifier, dataContractId) {
    const { identityContractNonce } = await this.dapi.platform.getIdentityContractNonce(new IdentifierWASM(identifier).bytes(), new IdentifierWASM(dataContractId).bytes())
    return identityContractNonce
  }

  /**
   * Fetch token total credits in platform by token id
   * @param tokenId {String} base58
   * @returns {Promise<*|GetTotalCreditsInPlatformResponse>}
   */
  async getTokenTotalSupply (tokenId) {
    return this.dapi.platform.getTokenTotalSupply(Identifier.from(tokenId))
  }

  async getTokenContractInfo (tokenId) {
    return this.dapi.platform.getTokenContractInfo(Identifier.from(tokenId))
  }

  async getStatus () {
    return this.dapi.platform.getStatus()
  }

  async broadcastTransition (base64) {
    return this.dapi.platform.broadcastStateTransition(base64)
  }
}

module.exports = DAPI
