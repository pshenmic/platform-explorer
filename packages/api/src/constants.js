const TenderdashRPC = require('./tenderdashRpc')

let genesisTime

module.exports = {
  CONTESTED_RESOURCE_VOTE_DEADLINE: Number(process.env.CONTESTED_RESOURCE_VOTE_DEADLINE ?? 1209600000),
  WITHDRAWAL_CONTRACT_TYPE: 'withdrawal',
  EPOCH_CHANGE_TIME: Number(process.env.EPOCH_CHANGE_TIME),
  TCP_CONNECT_TIMEOUT: Number(process.env.TCP_CONNECT_TIMEOUT),
  VALIDATORS_CACHE_LIFE_INTERVAL: Number(process.env.VALIDATORS_CACHE_LIFE_INTERVAL ?? 300000),
  VALIDATORS_CACHE_KEY: 'validators',
  BANNED_STATE_CACHE_KEY: 'banned_state',
  PLATFORM_QUORUMS_CACHE_KEY: 'platform_quorums',
  PROTX_LIST_CACHE_KEY: 'protx_list',
  CORE_BLOCK_HASH_CACHE_KEY: 'core_block_hash',
  CORE_BLOCK_HASH_CACHE_MAX_ENTRIES: 100000,
  CORE_BLOCK_HASH_CACHE_LIFE_INTERVAL: 14 * 86400000,
  CORE_NETWORK_CACHE_KEY: 'core_network',
  CORE_NETWORK_CACHE_LIFE_INTERVAL: 60000,
  // Core targets a block every 2.5 minutes
  CORE_BLOCKS_PER_DAY: 576,
  DUFFS_PER_DASH: 100000000,
  CREDITS_PER_DASH: 100000000000,
  EPOCH_STATS_MAX_POINTS: 84,
  PROTX_LIST_CACHE_LIFE_INTERVAL: 60000,
  DPNS_CONTRACT: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
  WITHDRAWAL_CONTRACT: '4fJLR2GYTPFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6',
  NETWORK: process.env.NETWORK ?? 'testnet',
  GEOIP_PROVIDER: '@ip-location-db/dbip-city-mmdb',
  GEOIP_TABLE_NAME: 'dbip-city-ipv4.mmdb',
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
