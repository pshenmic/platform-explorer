// Mirrors GET /rate response in packages/api/src/controllers/RateController.js

export type RateSource = 'Kucoin' | 'Coinbase'

export interface Rate {
  usd: number
  source: RateSource
}
