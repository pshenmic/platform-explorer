module.exports = {
  getUSDRate: async () => {
    const response = await fetch('https://api.kucoin.com/api/v1/market/stats?symbol=DASH-USDT', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      }
    })

    if (response.status !== 200) {
      throw new Error('kucoin api error')
    }

    return Number((await response.json()).data.sell)
  }
}
