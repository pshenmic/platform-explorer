const { Identifier } = require('dash').PlatformProtocol

const { IdentityPublicKey } = require('@dashevo/wasm-dpp/dist/wasm/wasm_dpp')

/**
 * @class DAPI
 * @constructor
 * @param {dapi-client} dapi - instance of dapi
 * @param {wasm-dpp} dpp - instance of wasm dpp
 */
class DAPI {
  dapi
  dpp

  constructor (dapi, dpp) {
    this.dapi = dapi
    this.dpp = dpp
  }

  /**
   * Get balance for identity
   * @method DAPI#getIdentityBalance
   * @param {string} Identifier - Identifier must be in base58
   * @returns {Promise<number>}
   */
  async getIdentityBalance (identifier) {
    const { balance } = await this.dapi.platform.getIdentityBalance(Identifier.from(identifier))
    return balance
  }

  /**
   * Get total credits from platform
   * @func
   * @returns {Promise<number>}
   */
  async getTotalCredits () {
    const { totalCreditsInPlatform } = await this.dapi.platform.getTotalCreditsInPlatform()
    return totalCreditsInPlatform
  }

  /**
   * Fetch epoch info from dapi
   * @func
   * @param {number} count - count of epochs to get
   * @param {number} [start] - start index
   * @param {boolean} [ascending] - order
   * @returns {Promise<EpochInfo>}
   */
  async getEpochsInfo (count, start, ascending) {
    const { epochsInfo } = await this.dapi.platform.getEpochsInfo(start, count, { ascending })
    return epochsInfo
  }

  /**
   * Fetch documents from DAPI
   * Allows **only one field** `identifier`**|**`owner`
   * @func
   * @param {string} type - document type name
   * @param {object} dataContractObject - object with data contract info
   * @param {string} [identifier] - identifier in base58
   * @param {string} [owner] - identifier in base58
   * @param {number} [limit]
   * @returns {Promise<Array<ExtendedDocument>>}
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
   * @func
   * @param {string} contractId - base64 contractId
   * @param {string} documentTypeName - document type name
   * @param {string} indexName - index name like `parentNameAndLabel
   * @param {number} resultType - enum from 0 to 2
   * @param {Array<Buffer>} indexValuesList - Buffer array of contested values
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

  /**
   * Fetch identity keys
   * @func
   * @param {string} identifier - Identifier must be in base58
   * @param {number[]} keysIds - list of keys ids to get
   * @param {number} [limit]
   * @returns {Promise<Array<IdentityPublicKey>>}
   */
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

  /**
   * Fetch platform status
   * @function
   * @returns {Promise<status>}
   */
  async getStatus () {
    return this.dapi.platform.getStatus()
  }
}

module.exports = DAPI
