const RpcClient = require('@dashevo/dashd-rpc/promise')

const config = {
  protocol: 'http',
  host: process.env.DASHCORE_HOST,
  port: Number(process.env.DASHCORE_PORT),
  user: process.env.DASHCORE_USER,
  pass: process.env.DASHCORE_PASS
}

const rpc = new RpcClient(config)

class DashCoreRPC {
  static async getProTxInfo(proTxHash,blockHash) {
    try {
      const { result } = await rpc.protx('info', proTxHash, blockHash)
      return result
    } catch (e) {
      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }

  static async getRawTransaction(proTxHash) {
    try {
      const { result } = await rpc.getRawTransaction(proTxHash, 1)
      return result
    } catch (e) {
      console.error(e)
      if (e.code === -8) {
        return null
      } else {
        throw e
      }
    }
  }
}

module.exports = DashCoreRPC
