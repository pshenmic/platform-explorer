const TenderdashRPC = require('./tenderdashRpc')

let genesisTime

module.exports = {
  EPOCH_CHANGE_TIME: Number(process.env.EPOCH_CHANGE_TIME),
  BLOCK_TIME: 5000,
  get genesisTime () {
    if (!genesisTime) {
      return TenderdashRPC.getGenesis().then((genesis) => {
        genesisTime = genesis.genesis_time
        return genesis.genesis_time
      }).catch(() => { throw new Error('Could not load genesis time') })
    }
    return genesisTime
  }
}
