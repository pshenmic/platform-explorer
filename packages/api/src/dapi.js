const DAPIClient = require('@dashevo/dapi-client')

const client = new DAPIClient(
  {
    dapiAddresses: [
      process.env.DAPI_URL
    ],
    network: process.env.DAPI_NETWORK
  }
)

class DAPI {
  static async getTotalCredits() {
    const { totalCreditsOnPlatform } = await client.platform.getTotalCredits()
    return totalCreditsOnPlatform
  }
}

module.exports = DAPI