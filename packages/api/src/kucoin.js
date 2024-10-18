module.exports = {
  getUSDRate: async () => {
    try {
      const response = await fetch('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=DASH-USDT', {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      })

      if (response.status !== 200) {
        throw new Error(`Kucoin api error (${response.status}) \n${await response.text()}`)
      }

      const rate = (await response.json()).data?.price
      return rate ? Number(rate) : null
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
