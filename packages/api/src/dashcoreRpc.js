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
  static async getRawTransaction (proTxHash) {
    try {
      const { result } = await rpc.getRawTransaction(proTxHash, 1)

      return result
    } catch (e) {
      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }

  static async getProTxInfo (proTxHash, blockHash = undefined) {
    try {
      const args = ['info', proTxHash]
      if (blockHash) args.push(blockHash)

      const { result } = await rpc.protx(...args)

      return result
    } catch (e) {
      if (e.code === -8) {
        const { blockhash } = await this.getRawTransaction(proTxHash)
        const result = await this.getProTxInfo(proTxHash, blockhash)

        return result
      }

      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }

  static async getQuorumsListExtended (height) {
    try {
      const args = ['listextended']
      if (height) args.push(height)

      const { result } = await rpc.quorum(...args)

      return result
    } catch (e) {
      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }

  static async getQuorumInfo (quorumHash, llmqType = 1) {
    try {
      const { result } = await rpc.quorum('info', llmqType, quorumHash)

      return result
    } catch (e) {
      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }

  static async getNodeMemberOfQuorum (proTxHash, count) {
    try {
      const args = ['memberof', proTxHash]

      if (count) args.push(count)

      const { result } = await rpc.quorum(args)

      return result
    } catch (e) {
      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }
}

module.exports = DashCoreRPC
