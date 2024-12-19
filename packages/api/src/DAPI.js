const Withdrawal = require('./models/Withdrawal')
const { Identifier } = require('dash').PlatformProtocol

const { IdentityPublicKey } = require('@dashevo/wasm-dpp/dist/wasm/wasm_dpp')

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

  async getDocuments (type, dataContractObject, identifier, limit) {
    const dataContract = await this.dpp.dataContract.createFromObject(dataContractObject)

    const { documents } = await this.dapi.platform.getDocuments(Identifier.from(dataContractObject.id), type, {
      limit,
      where: [
        ['$ownerId', '=', Identifier.from(identifier)]
      ]
    })

    return documents.map(
      (document) =>
        Withdrawal.fromRaw(
          this.dpp.document.createExtendedDocumentFromDocumentBuffer(document, type, dataContract).toJSON()
        )
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

  async getIdentityKeys (identifier, keysIds, limit) {
    const { identityKeys } = await this.dapi.platform.getIdentityKeys(Identifier.from(identifier), keysIds, limit)

    return identityKeys.map(key => {
      const serialized = IdentityPublicKey.fromBuffer(Buffer.from(key))

      const { contractBounds } = IdentityPublicKey.fromBuffer(Buffer.from(key)).toObject()

      return {
        keyId: serialized.getId(),
        type: serialized.getType(),
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

  async getStatus () {
    return this.dapi.platform.getStatus()
  }
}

module.exports = DAPI
