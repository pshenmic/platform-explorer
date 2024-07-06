const TenderdashRPC = require('./tenderdashRpc')

class Constants {
  genesisTime = new Date()

  async init () {
    this.genesisTime = (await TenderdashRPC.getGenesis()).genesis_time
  }

  static get StateTransitionEnum () {
    return {
      DATA_CONTRACT_CREATE: 0,
      DOCUMENTS_BATCH: 1,
      IDENTITY_CREATE: 2,
      IDENTITY_TOP_UP: 3,
      DATA_CONTRACT_UPDATE: 4,
      IDENTITY_UPDATE: 5,
      IDENTITY_CREDIT_WITHDRAWAL: 6,
      IDENTITY_CREDIT_TRANSFER: 7
    }
  }

  static get BLOCK_TIME () {
    return 5000
  }
}

module.exports = Constants
