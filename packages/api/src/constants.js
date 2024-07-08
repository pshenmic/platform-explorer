const TenderdashRPC = require('./tenderdashRpc')
const StateTransitionEnum = require('./StateTransition.enum')

class Constants {
  genesisTime

  async init () {
    this.genesisTime = (await TenderdashRPC.getGenesis()).genesis_time
  }

  static get StateTransitionEnum () {
    return StateTransitionEnum
  }

  static get BLOCK_TIME () {
    return 5000
  }

  static get EPOCH_CHANGE_TIME () {
    return 3600000
  }
}

module.exports = Constants
