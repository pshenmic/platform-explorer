const Kucoin = require('../kucoin')
const Coinbase = require('../coinbase')
const cache = require('../cache')
const { RATE_CACHE_KEY, RATE_CACHE_LIFE_INTERVAL } = require('../constants')

class RateController {
  async getUSDRate (request, response) {
    // exchanges are slow to answer and the rate is polled by every page
    const cached = cache.get(RATE_CACHE_KEY)

    if (cached) {
      return response.send(cached)
    }

    const kucoinResponse = await Kucoin.getRates()

    if (typeof kucoinResponse.usd === 'number') {
      const rate = { ...kucoinResponse, source: 'Kucoin' }

      cache.set(RATE_CACHE_KEY, rate, RATE_CACHE_LIFE_INTERVAL)

      return response.send(rate)
    }

    const coinbaseResponse = await Coinbase.getRates()

    if (typeof coinbaseResponse.usd === 'number') {
      const rate = { ...coinbaseResponse, source: 'Coinbase' }

      cache.set(RATE_CACHE_KEY, rate, RATE_CACHE_LIFE_INTERVAL)

      return response.send(rate)
    }

    response.status(503).send({ error: 'Rate services unavailable' })
  }
}

module.exports = RateController
