const TenderdashRPC = require('./tenderdashRpc')

let genesisTime

module.exports = {
  EPOCH_CHANGE_TIME: Number(process.env.EPOCH_CHANGE_TIME),
  get genesisTime () {
    if (!genesisTime || isNaN(genesisTime)) {
      return TenderdashRPC.getBlockByHeight(1).then(({block}) => {
        genesisTime = new Date(block.header.time)
        return isNaN(genesisTime) ? null : genesisTime
      }).catch((e) => {
        console.error(e)
        throw new Error('Could not load genesis time')
      })
    }
    return genesisTime
  }
}
