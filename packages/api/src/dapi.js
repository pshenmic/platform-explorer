const DAPIClient = require('@dashevo/dapi-client')

const client = new DAPIClient(
  {
    dapiAddresses: [
      process.env.DAPI_URL,
      '127.0.0.1:9901'
    ],
    network: process.env.DAPI_NETWORK ?? 'local'
  }
)

class DAPI {
  static async getTotalCredits () {
    const { totalCreditsOnPlatform } = await client.platform.getTotalCredits()
    return totalCreditsOnPlatform
  }
}

module.exports = DAPI
