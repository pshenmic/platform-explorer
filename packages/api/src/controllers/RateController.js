const Kucoin = require('../kucoin')
const Coinbase = require('../coinbase')

class RateController {
  async getUSDRate (request, response) {
    const kucoinResponse = await Kucoin.getUSDRate().catch((err) => {
      console.error(err)
      return null
    })

    if (typeof kucoinResponse === 'number') {
      response.send({ usd: kucoinResponse, source: 'Kucoin' })
    }

    const coinbaseResponse = await Coinbase.getUSDRate(request).catch((err) => {
      console.error(err)
      return null
    })

    if (typeof coinbaseResponse === 'number') {
      response.send({ usd: coinbaseResponse, source: 'Coinbase' })
    }

    response.status(503).send({ error: 'Rate services unavailable' })
  }
}

module.exports = RateController
