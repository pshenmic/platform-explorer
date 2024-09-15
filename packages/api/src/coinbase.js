module.exports = {
  getUSDRate: async () => {
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

      const rate = (await response.json()).data?.rates.USD
      return rate ? Number(rate) : null
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
