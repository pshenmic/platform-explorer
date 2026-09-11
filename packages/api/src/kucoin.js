const getPrice = async (symbol) => {
  try {
    const response = await fetch(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`, {
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

module.exports = {
  getRates: async () => {
    const [usd, btc] = await Promise.all([
      getPrice('DASH-USDT'),
      getPrice('DASH-BTC')
    ])

    return { usd, btc }
  }
}
