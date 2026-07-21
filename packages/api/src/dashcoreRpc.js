const RpcClient = require('@dashevo/dashd-rpc/promise')
const ServiceNotAvailableError = require('./errors/ServiceNotAvailableError')

const config = {
  protocol: 'http',
  host: process.env.DASHCORE_HOST,
  port: Number(process.env.DASHCORE_PORT),
  user: process.env.DASHCORE_USER,
  pass: process.env.DASHCORE_PASS
}

const rpc = new RpcClient(config)

class DashCoreRPC {
  static async callMethod (method, args, onError = (e) => {}) {
    try {
      const { result } = await rpc[method](...args)

      return result
    } catch (e) {
      const handlerResponse = await onError(e)

      // a handler that returns undefined did not handle the error; any other
      // value (including null) is treated as the resolved result
      if (handlerResponse !== undefined) {
        return handlerResponse
      }

      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }

  static async getRawTransaction (proTxHash) {
    return await this.callMethod('getRawTransaction', [proTxHash, 1])
  }

  // When the masternode is not in the list at the requested block Core returns
  // a -8 error. With `fallback` (default) the state is resolved from the node's
  // registration block instead; with `fallback` disabled null is returned so
  // callers can use it as a present/absent probe (e.g. binary search).
  static async getProTxInfo (proTxHash, blockHash = undefined, fallback = true) {
    const args = ['info', proTxHash]
    if (blockHash) args.push(blockHash)

    return await this.callMethod('protx', args, async (e) => {
      if (e.code === -8) {
        if (!fallback) {
          return null
        }

        const { blockhash } = await this.getRawTransaction(proTxHash)

        return await this.getProTxInfo(proTxHash, blockhash)
      }
    })
  }

  static async getBlockCount () {
    return await this.callMethod('getblockcount', [])
  }

  static async getBlockHash (height) {
    return await this.callMethod('getblockhash', [height])
  }

  static async getProTxList (type, detailed, blockHeight = undefined) {
    const args = ['list', type, detailed]
    if (blockHeight) args.push(blockHeight)

    return await this.callMethod('protx', args)
  }

  static async getQuorumsListExtended (height) {
    const args = ['listextended']
    if (height) args.push(height)

    return await this.callMethod('quorum', args)
  }

  static async getQuorumInfo (quorumHash, llmqType = 1) {
    return await this.callMethod('quorum', ['info', llmqType, quorumHash])
  }

  static async getNodeMemberOfQuorum (proTxHash, count) {
    const args = ['memberof', proTxHash]

    if (count) args.push(count)

    return await this.callMethod('quorum', args)
  }
}

module.exports = DashCoreRPC
