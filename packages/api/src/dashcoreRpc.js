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
  static async getProTxInfo (proTxHash) {
    try {
      const { result } = await rpc.protx('info', proTxHash)
      return result
    } catch (e) {
      console.error(e)
      throw new ServiceNotAvailableError()
    }
  }
}

module.exports = DashCoreRPC
