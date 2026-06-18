const RpcClient = require('@dashevo/dashd-rpc/promise')
const ServiceNotAvailableError = require('./errors/ServiceNotAvailableError')

const config = {
  protocol: 'http',
  host: process.env.CORE_RPC_HOST,
  port: Number(process.env.CORE_RPC_PORT),
  user: process.env.CORE_RPC_USER,
  pass: process.env.CORE_RPC_PASSWORD
}

const rpc = new RpcClient(config)

class DashCoreRPC {
  static async callMethod (method, args, onError = (e) => {}) {
    try {
      const { result } = await rpc[method](...args)

      return result
    } catch (e) {
      const handlerResponse = await onError(e)

      if (handlerResponse) {
        return handlerResponse
      }

      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }

  static async getRawTransaction (proTxHash) {
    return await this.callMethod('getRawTransaction', [proTxHash, 1])
  }

  static async getProTxInfo (proTxHash, blockHash = undefined) {
    const args = ['info', proTxHash]
    if (blockHash) args.push(blockHash)

    return await this.callMethod('protx', args, async (e) => {
      if (e.code === -8) {
        const { blockhash } = await this.getRawTransaction(proTxHash)

        return await this.getProTxInfo(proTxHash, blockhash)
      }
    })
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
