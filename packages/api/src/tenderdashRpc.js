const fetch = require('node-fetch')
const ServiceNotAvailableError = require('./errors/ServiceNotAvailableError')

const PLATFORM_VERSION = '1' + require('../package.json').dependencies['dash'].substr(1);
const BASE_URL = process.env.BASE_URL

const call = async (path, method, body) => {
  try {
    const response = await fetch(`${BASE_URL}/${path}`, {
      method,
      body,
      headers: {
        'content-type': 'application/json'
      }
    })

    if (response.status === 200) {
      return response.json()
    } else {
      const text = await response.text()
      console.error(text)
      throw new Error(`Unknown status code from Tenderdash RPC (${response.status})`)
    }
  } catch (e) {
    console.error(e)
    throw new ServiceNotAvailableError()
  }
}

class TenderdashRPC {
  static async getBlocks (page, limit, order) {
    let query = 'block_search?query=block.height>=1'

    if (page) {
      query += '&page=' + page
    }

    if (limit) {
      query += '&per_page=' + limit
    } else {
      query += '&per_page=' + 30
    }

    if (order) {
      query += '&order=' + order
    } else {
      query += '&order=desc'
    }

    return call(query, 'GET')
  }

  static async getBlockByHash (hash) {
    return call(`block_by_hash?hash=${hash}`, 'GET')
  }

  static async getBlockByHeight (height) {
    return call(`block?height=${height}`, 'GET')
  }

  static async getTransactionByHash (hash) {
    return call(`tx?hash=${hash}`, 'GET')
  }

  static async getTransactions (from, to) {
    let query = 'tx_search?query='

    if (from) {
      query += `tx.height>${from}`
    } else {
      query += 'tx.height>1'
    }

    if (to) {
      query += `%20AND%20tx.height<${to}`
    }

    return call(query, 'GET')
  }

  static async getStatus () {
    const { sync_info: syncInfo, node_info: nodeInfo } = await call('status', 'GET')
    const { latest_block_height: tenderdashChainHeight, max_peer_block_height: maxPeerHeight } = syncInfo
    const { network } = nodeInfo

    const tenderdashVersion = nodeInfo.version

    return {
      network,
      tenderdashVersion,
      platformVersion: PLATFORM_VERSION,
      maxPeerHeight,
      tenderdashChainHeight,
    }
  }

  static async getGenesis () {
    const { genesis } = await call('genesis', 'GET')

    return genesis
  }
}

module.exports = TenderdashRPC
