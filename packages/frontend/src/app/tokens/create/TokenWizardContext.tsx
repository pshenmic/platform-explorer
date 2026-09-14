'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type HistoryFlags = {
  transfer: boolean
  freezing: boolean
  minting: boolean
  burning: boolean
  directPricing: boolean
  directPurchase: boolean
}

export type PreProgrammedRow = {
  id: string
  time: string
  identity: string
  amount: string
}

export type PerpetualType = 'time' | 'block' | 'epoch'
export type PerpetualRecipient = 'owner' | 'identity' | 'evonodes'
export type IntervalUnit = 'seconds' | 'minutes' | 'hours' | 'days'

export type TokenForm = {
  name: string
  pluralForm: string
  pluralEdited: boolean
  /** Empty string allowed mid-typing in Advanced decimals field. */
  decimals: number | ''
  baseSupply: string
  hasMaxSupply: boolean
  maxSupply: string
  allowMint: boolean
  allowBurn: boolean
  allowTransfer: boolean
  allowDirectPurchase: boolean
  allowFreeze: boolean
  allowDestroyFrozen: boolean
  allowEmergency: boolean
  startAsPaused: boolean
  description: string
  shouldCapitalize: boolean
  destinationIdentity: string
  allowTransferToFrozenBalance: boolean
  keepsHistory: HistoryFlags
  preProgrammedRows: PreProgrammedRow[]
  perpetualEnabled: boolean
  perpetualType: PerpetualType
  perpetualIntervalValue: string
  perpetualIntervalUnit: IntervalUnit
  perpetualAmount: string
  perpetualRecipient: PerpetualRecipient
  perpetualRecipientIdentity: string
}

export type TokenWizardContextValue = {
  form: TokenForm
  setField: <K extends keyof TokenForm>(key: K, value: TokenForm[K]) => void
}

const TokenWizardContext = createContext<TokenWizardContextValue | null>(null)

export const useTokenWizard = (): TokenWizardContextValue => {
  const ctx = useContext(TokenWizardContext)
  if (!ctx) throw new Error('useTokenWizard must be used within TokenWizardProvider')
  return ctx
}

const DEFAULT_KEEPS_HISTORY: HistoryFlags = {
  transfer: true,
  freezing: true,
  minting: true,
  burning: true,
  directPricing: true,
  directPurchase: true
}

// Neutral defaults: a general-purpose token, every field editable.
const buildInitialForm = (): TokenForm => ({
  name: '',
  pluralForm: '',
  pluralEdited: false,
  decimals: 8,
  baseSupply: '',
  hasMaxSupply: false,
  maxSupply: '',
  allowMint: true,
  allowBurn: true,
  allowTransfer: true,
  allowDirectPurchase: false,
  allowFreeze: true,
  allowDestroyFrozen: true,
  allowEmergency: true,
  startAsPaused: false,
  description: '',
  shouldCapitalize: true,
  destinationIdentity: '',
  allowTransferToFrozenBalance: false,
  keepsHistory: { ...DEFAULT_KEEPS_HISTORY },
  preProgrammedRows: [{ id: 'pp-init', time: '', identity: '', amount: '' }],
  perpetualEnabled: false,
  perpetualType: 'time',
  perpetualIntervalValue: '',
  perpetualIntervalUnit: 'days',
  perpetualAmount: '',
  perpetualRecipient: 'owner',
  perpetualRecipientIdentity: ''
})

export const TokenWizardProvider = ({ children }: { children: ReactNode }) => {
  const [form, setFormState] = useState<TokenForm>(buildInitialForm)

  const setField = <K extends keyof TokenForm>(key: K, value: TokenForm[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }

  const value = useMemo(() => ({ form, setField }), [form])

  return <TokenWizardContext.Provider value={value}>{children}</TokenWizardContext.Provider>
}
