const DAPIClient = require('@dashevo/dapi-client')

class DAPI {
  DAPIClient
  constructor (options){
    this.DAPIClient = new DAPIClient(options)
  }

  async getIdentityBalance(identifier){
    const balance = await this.DAPIClient.platform.getIdentityBalance(identifier)
    return balance
  }
}

module.exports = DAPI