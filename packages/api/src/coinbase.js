module.exports = {
  getUSDRate: async () => {
    const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=DASH', {
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      }
    })

    if (response.status !== 200) {
      throw new Error('Coinbase api error')
    }

    return Number((await response.json()).data.rates.USD)
  }
}
