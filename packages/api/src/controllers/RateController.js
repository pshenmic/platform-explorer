const Kucoin = require('../kucoin')
const Coinbase = require('../coinbase')

class RateController {
  async getUSDRate (request, response) {
    const kucoinResponse = await Kucoin.getUSDRate()

    if (typeof kucoinResponse === 'number') {
      return response.send({ usd: kucoinResponse, source: 'Kucoin' })
    }

    const coinbaseResponse = await Coinbase.getUSDRate(request)

    if (typeof coinbaseResponse === 'number') {
      return response.send({ usd: coinbaseResponse, source: 'Coinbase' })
    }

    response.status(503).send({ error: 'Rate services unavailable' })
  }
}

module.exports = RateController
