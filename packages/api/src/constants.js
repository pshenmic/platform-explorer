const TenderdashRPC = require('./tenderdashRpc')

let genesisTime

module.exports = {
  EPOCH_CHANGE_TIME: Number(process.env.EPOCH_CHANGE_TIME),
  DAPIConfig: {
    dapiAddresses: [
      {
        host: process.env.DAPI_HOST,
        port: process.env.DAPI_PORT,
        retries: process.env.DAPI_RETRIES,
        protocol: process.env.DAPI_PROTOCOL,
      }
    ],
    retries: Number(process.env.DAPI_RETRIES)
  },
  get genesisTime () {
    if (!genesisTime || isNaN(genesisTime)) {
      return TenderdashRPC.getBlockByHeight(1).then((blockInfo) => {
        if (!blockInfo?.block?.header?.time) {
          throw new Error('Could not load genesis time')
        }
        genesisTime = new Date(blockInfo.block.header.time)
        return isNaN(genesisTime) ? null : genesisTime
      }).catch((e) => {
        console.error(e)
        throw new Error('Could not load genesis time')
      })
    }
    return genesisTime
  }
}
