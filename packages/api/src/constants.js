const TenderdashRPC = require('./tenderdashRpc')

let genesisTime

module.exports = {
  TENDERDASH_URL: process.env.TENDERDASH_URL,
  CONTESTED_RESOURCE_VOTE_DEADLINE: Number(process.env.CONTESTED_RESOURCE_VOTE_DEADLINE ?? 1209600000),
  WITHDRAWAL_CONTRACT_TYPE: 'withdrawal',
  REDIS_PUBSUB_NEW_BLOCK_CHANNEL: process.env.REDIS_PUBSUB_NEW_BLOCK_CHANNEL ?? 'update',
  EPOCH_CHANGE_TIME: Number(process.env.EPOCH_CHANGE_TIME),
  TCP_CONNECT_TIMEOUT: Number(process.env.TCP_CONNECT_TIMEOUT),
  VALIDATORS_CACHE_LIFE_INTERVAL: Number(process.env.VALIDATORS_CACHE_LIFE_INTERVAL ?? 300000),
  VALIDATORS_CACHE_KEY: 'validators',
  DPNS_CONTRACT: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  WITHDRAWAL_CONTRACT: '4fJLR2GYTPFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6',
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
  },
  TENDERDASH_WS_BLOCKS_SUBSCRIPTION: {
    jsonrpc: "2.0",
    method: "subscribe",
    id: 1,
    params: {
      query: "tm.event='NewBlock'"
    }
  }
}
