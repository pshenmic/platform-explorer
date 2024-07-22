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
  static async getProTxInfo (proTxHash) {
    try {
      const { result } = await rpc.protx('info', proTxHash)
      return result
    } catch (e) {
      if (e.code === -8) {
        return null
      } else {
        console.error(e)
        throw e
      }
    }
  }
}

module.exports = DashCoreRPC
