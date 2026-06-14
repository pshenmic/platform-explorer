// Mirrors packages/api/src/models/Token.js

import type { Localization } from './Localization'
import type { PerpetualDistribution } from './PerpetualDistribution'
import type { PreProgrammedDistribution } from './PreProgrammedDistribution'

export type TokenEmergencyAction = string

export type TokenPrices = Record<string, string> | null

export interface Token {
  identifier: string | null
  position: number | null
  timestamp: string | null
  description: string | null
  localizations: Record<string, Localization> | null
  baseSupply: string | null
  totalSupply: string | null
  maxSupply: string | null
  owner: string | null
  mintable: boolean | null
  burnable: boolean | null
  freezable: boolean | null
  unfreezable: boolean | null
  destroyable: boolean | null
  allowedEmergencyActions: TokenEmergencyAction[] | null
  dataContractIdentifier: string | null
  changeMaxSupply: boolean | null
  totalGasUsed: number | null
  mainGroup: number | null
  totalTransitionsCount: number | null
  totalFreezeTransitionsCount: number | null
  totalBurnTransitionsCount: number | null
  decimals: number | null
  perpetualDistribution: PerpetualDistribution | null
  preProgrammedDistribution: PreProgrammedDistribution | null
  price: string | null
  prices: TokenPrices
}
