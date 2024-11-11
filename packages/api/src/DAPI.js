const {Identifier} = require('dash').PlatformProtocol

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

  async getDocuments(type, dataContractObject, options) {
    const dataContract = await this.dpp.dataContract.createFromObject(dataContractObject)


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let startAfter

    let options = {
      limit: page * limit > 100 ? 100 : limit,
    }

    if(page*limit>limit){
      const cycles = Math.ceil((limit * page) / (page * limit > 100 ? 100 : limit))

      for (let i = 0; i < cycles - 1; i++) {
        if (startAfter) {
          options.startAfter = startAfter
        }

        const docs = await this.dapi.getDocuments(
          type,
          documentObject,
          options
        )

        if (docs.length === (page * limit > 100 ? 100 : limit)) {
          startAfter = docs[docs.length - 1].getId()
        } else {
          return response.status(400).send({message: `out of range`})
        }
      }

      options.limit = limit
      const docs = await this.dapi.getDocuments(
        type,
        documentObject,
        options
      )

      if (docs.length === limit) {
        startAfter = docs[docs.length - 1].getId()
      } else {
        return response.status(400).send({message: `out of range`})
      }
    }

    options = {
      orderBy: orderData.map(el => typeof el === 'string' ? JSON.parse(el) : el),
      limit: limit,
    }

    if (startAfter) {
      options.startAfter = startAfter
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    const data = await this.dapi.platform.getDocuments(Identifier.from(dataContractObject.id), type, options)

    return data.documents.map((document) =>
      this.dpp.document.createExtendedDocumentFromDocumentBuffer(document, type, dataContract))
  }
}

module.exports = DAPI
