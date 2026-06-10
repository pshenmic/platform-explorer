'use client'

import { createContext, useContext, useMemo, useState } from 'react'

const TokenWizardContext = createContext(null)

export const useTokenWizard = () => {
  const ctx = useContext(TokenWizardContext)
  if (!ctx) throw new Error('useTokenWizard must be used within TokenWizardProvider')
  return ctx
}

const DEFAULT_KEEPS_HISTORY = {
  transfer: true,
  freezing: true,
  minting: true,
  burning: true,
  directPricing: true,
  directPurchase: true
}

// Neutral starting point: a general-purpose token (mintable, burnable,
// transferable, no max supply, all guards on, no recurring distribution).
// Every field stays editable — there are no presets that pre-set hidden options.
const buildInitialForm = () => ({
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
  // Seed one row so the repeater UI is visible by default.
  preProgrammedRows: [{ id: 'pp-init', time: '', identity: '', amount: '' }],
  perpetualEnabled: false,
  perpetualType: 'time',
  perpetualIntervalValue: '',
  perpetualIntervalUnit: 'days',
  perpetualAmount: '',
  perpetualRecipient: 'owner',
  perpetualRecipientIdentity: ''
})

export const TokenWizardProvider = ({ children }) => {
  const [form, setFormState] = useState(buildInitialForm)

  const setField = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const value = useMemo(
    () => ({ form, setField }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form]
  )

  return (
    <TokenWizardContext.Provider value={value}>
      {children}
    </TokenWizardContext.Provider>
  )
}
