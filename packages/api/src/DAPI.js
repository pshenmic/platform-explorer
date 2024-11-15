const Withdrawal = require('./models/Withdrawal')
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

  async getDocuments (type, dataContractData, identifier, startAfter, limit) {
    const dataContractObject = {
      $format_version: '0',
      documentSchemas: JSON.parse(dataContractData.schema),
      version: dataContractData.version,
      ownerId: dataContractData.owner,
      id: dataContractData.identifier
    }

    const dataContract = await this.dpp.dataContract.createFromObject(dataContractObject)

    const data = await this.dapi.platform.getDocuments(Identifier.from(dataContractObject.id), type, {
      limit,
      startAfter,
      where: [
        ['$ownerId', '=', identifier]
      ]
    })

    return data.documents.map(
      (document) =>
        Withdrawal.fromRaw(
          this.dpp.document.createExtendedDocumentFromDocumentBuffer(document, type, dataContract).toJSON()
        )
    )
  }
}

module.exports = DAPI
