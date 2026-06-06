'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { DEFAULT_TEMPLATE_ID, getTemplate } from './templates'

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

const buildInitialForm = (templateId) => {
  const template = getTemplate(templateId)
  return {
    template: templateId,
    name: '',
    pluralForm: '',
    pluralEdited: false,
    decimals: template.defaults.decimals,
    baseSupply: '',
    hasMaxSupply: template.defaults.hasMaxSupply,
    maxSupply: '',
    allowMint: template.defaults.allowMint,
    allowBurn: template.defaults.allowBurn,
    allowTransfer: template.defaults.allowTransfer,
    allowDirectPurchase: template.defaults.allowDirectPurchase,
    allowFreeze: template.defaults.allowFreeze ?? true,
    allowDestroyFrozen: template.defaults.allowDestroyFrozen ?? true,
    allowEmergency: template.defaults.allowEmergency ?? true,
    startAsPaused: template.defaults.startAsPaused ?? false,
    description: '',
    shouldCapitalize: template.defaults.shouldCapitalize ?? true,
    destinationIdentity: template.defaults.destinationIdentity ?? '',
    allowTransferToFrozenBalance: template.defaults.allowTransferToFrozenBalance ?? false,
    keepsHistory: { ...DEFAULT_KEEPS_HISTORY, ...(template.defaults.keepsHistory || {}) },
    // Seed one row so the repeater UI is visible by default.
    preProgrammedRows: [{ id: 'pp-init', time: '', identity: '', amount: '' }],
    perpetualEnabled: false,
    perpetualType: 'time',
    perpetualIntervalValue: '',
    perpetualIntervalUnit: 'days',
    perpetualAmount: '',
    perpetualRecipient: 'owner',
    perpetualRecipientIdentity: ''
  }
}

export const TokenWizardProvider = ({ children }) => {
  const [form, setFormState] = useState(() => buildInitialForm(DEFAULT_TEMPLATE_ID))

  const setField = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const selectTemplate = (templateId) => {
    const template = getTemplate(templateId)
    if (template.disabled) return
    setFormState((prev) => ({
      ...prev,
      template: templateId,
      decimals: template.defaults.decimals,
      hasMaxSupply: template.defaults.hasMaxSupply,
      allowMint: template.defaults.allowMint,
      allowBurn: template.defaults.allowBurn,
      allowTransfer: template.defaults.allowTransfer,
      allowDirectPurchase: template.defaults.allowDirectPurchase,
      allowFreeze: template.defaults.allowFreeze ?? true,
      allowDestroyFrozen: template.defaults.allowDestroyFrozen ?? true,
      allowEmergency: template.defaults.allowEmergency ?? true,
      startAsPaused: template.defaults.startAsPaused ?? false,
      // Templates only override fields they explicitly define; preserve user input otherwise.
      shouldCapitalize: template.defaults.shouldCapitalize ?? prev.shouldCapitalize,
      destinationIdentity: template.defaults.destinationIdentity ?? prev.destinationIdentity,
      allowTransferToFrozenBalance: template.defaults.allowTransferToFrozenBalance ?? prev.allowTransferToFrozenBalance,
      keepsHistory: template.defaults.keepsHistory
        ? { ...DEFAULT_KEEPS_HISTORY, ...template.defaults.keepsHistory }
        : prev.keepsHistory
    }))
  }

  const value = useMemo(
    () => ({ form, setField, selectTemplate }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form]
  )

  return (
    <TokenWizardContext.Provider value={value}>
      {children}
    </TokenWizardContext.Provider>
  )
}
