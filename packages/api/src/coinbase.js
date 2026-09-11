module.exports = {
  getRates: async () => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=DASH', {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      })

      if (response.status !== 200) {
        throw new Error(`Coinbase api error (${response.status}) \n${await response.text()}`)
      }

      const rates = (await response.json()).data?.rates

      return {
        usd: rates?.USD ? Number(rates.USD) : null,
        btc: rates?.BTC ? Number(rates.BTC) : null
      }
    } catch (e) {
      console.error(e)
      return { usd: null, btc: null }
    }
  }
}
