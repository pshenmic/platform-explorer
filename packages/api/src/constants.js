const TenderdashRPC = require('./tenderdashRpc')

let GenesisTime

module.exports = {
  EPOCH_CHANGE_TIME: Number(process.env.EPOCH_CHANGE_TIME),
  BLOCK_TIME: 5000,
  get genesisTime () {
    if (!GenesisTime) {
      return TenderdashRPC.getGenesis().then((v) => {
        GenesisTime = v.genesis_time
        return v.genesis_time
      }).catch(Error)
    }
    return GenesisTime
  }
}
