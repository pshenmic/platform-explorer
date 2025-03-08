const {Identifier} = require('dash').PlatformProtocol

const {IdentityPublicKey} = require('@dashevo/wasm-dpp/dist/wasm/wasm_dpp')

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
  async getDocuments(type, dataContractObject, query, limit, orderBy, skip, raw) {
    const dataContract = await this.dpp.dataContract.createFromObject(dataContractObject)

    const {startAt, startAfter} = skip ?? {}

    const {documents} = await this.dapi.platform.getDocuments(Identifier.from(dataContractObject.id), type, {
      limit,
      where: query,
      orderBy,
      startAt,
      startAfter
    })

    return raw ? documents : (documents ?? []).map(
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
  async getContestedState(contractId,
                          documentTypeName,
                          indexName,
                          resultType,
                          indexValuesList,
                          startAtIdentifierInfo,
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

  async getIdentityKeys(identifier, keysIds, limit) {
    const {identityKeys} = await this.dapi.platform.getIdentityKeys(Identifier.from(identifier), keysIds, limit)

    return identityKeys.map(key => {
      const serialized = IdentityPublicKey.fromBuffer(Buffer.from(key))

      const {contractBounds} = IdentityPublicKey.fromBuffer(Buffer.from(key)).toObject()

      return {
        keyId: serialized.getId(),
        type: serialized.getType(),
        raw: Buffer.from(key).toString('hex'),
        data: Buffer.from(serialized.getData()).toString('hex'),
        purpose: serialized.getPurpose(),
        securityLevel: serialized.getSecurityLevel(),
        isReadOnly: serialized.isReadOnly(),
        isMaster: serialized.isMaster(),
        hash: Buffer.from(serialized.hash()).toString('hex'),
        contractBounds: contractBounds
          ? {
            type: contractBounds.type,
            id: Identifier.from(Buffer.from(contractBounds.id)),
            typeName: contractBounds.document_type_name
          }
          : null
      }
    })
  }

  async getIdentityNonce(identifier) {
    const {identityNonce} = await this.dapi.platform.getIdentityNonce(Identifier.from(identifier))
    return identityNonce
  }

  async getIdentityContractNonce(identifier, dataContractId) {
    const {identityContractNonce} = await this.dapi.platform.getIdentityContractNonce(Identifier.from(identifier), Identifier.from(dataContractId))
    return identityContractNonce
  }

  async getStatus() {
    return this.dapi.platform.getStatus()
  }

  async broadcastTransition(base64) {
    return this.dapi.platform.broadcastStateTransition(base64)
  }
}

module.exports = DAPI
