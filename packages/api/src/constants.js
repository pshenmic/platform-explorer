const TenderdashRPC = require('./tenderdashRpc')

let genesisTime

module.exports = {
  WITHDRAWAL_CONTRACT_TYPE: 'withdrawal',
  EPOCH_CHANGE_TIME: Number(process.env.EPOCH_CHANGE_TIME),
  TCP_CONNECT_TIMEOUT: Number(process.env.TCP_CONNECT_TIMEOUT),
  DPNS_CONTRACT: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  NETWORK: process.env.NETWORK ?? 'testnet',
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
