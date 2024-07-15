const fetch = require('node-fetch')
const ServiceNotAvailableError = require('./errors/ServiceNotAvailableError')

const call = async (method, params, id) => {
  try {
    const response = await fetch(process.env.DASHCORE_URL, {
      method: 'POST',
      body: JSON.stringify({
        method,
        params
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${process.env.DASHCORE_USER}:${process.env.DASHCORE_PASS}`)}`
      }
    })

    if (response.status === 200) {
      return response.json()
    } else {
      const text = await response.text()
      console.error(text)
      throw new Error(`Unknown status code from DashCore RPC (${response.status})`)
    }
  } catch (e) {
    console.error(e)
    throw new ServiceNotAvailableError()
  }
}

class DashCoreRPC {
  static async getValidatorInfo (proTxHash) {
    const { result } = await call('protx', ['info', proTxHash])
    return result
  }
}

module.exports = DashCoreRPC
