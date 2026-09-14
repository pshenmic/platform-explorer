const Kucoin = require('../kucoin')
const Coinbase = require('../coinbase')

class RateController {
  async getUSDRate (request, response) {
    const kucoinResponse = await Kucoin.getRates()

    if (typeof kucoinResponse.usd === 'number') {
      return response.send({ ...kucoinResponse, source: 'Kucoin' })
    }

    const coinbaseResponse = await Coinbase.getRates()

    if (typeof coinbaseResponse.usd === 'number') {
      return response.send({ ...coinbaseResponse, source: 'Coinbase' })
    }

    response.status(503).send({ error: 'Rate services unavailable' })
  }
}

module.exports = RateController
