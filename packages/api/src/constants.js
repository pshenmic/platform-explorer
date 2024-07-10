const TenderdashRPC = require('./tenderdashRpc')

let genesisTime

module.exports = {
  EPOCH_CHANGE_TIME: Number(process.env.EPOCH_CHANGE_TIME),
  get genesisTime () {
    if (!genesisTime) {
      return TenderdashRPC.getGenesis().then((genesis) => {
        genesisTime = new Date(genesis.genesis_time)
        return genesisTime
      }).catch(() => { throw new Error('Could not load genesis time') })
    }
    return genesisTime
  }
}
