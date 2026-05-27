'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { DEFAULT_TEMPLATE_ID, getTemplate } from './templates'

const TokenWizardContext = createContext(null)

export const useTokenWizard = () => {
  const ctx = useContext(TokenWizardContext)
  if (!ctx) throw new Error('useTokenWizard must be used within TokenWizardProvider')
  return ctx
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
    description: ''
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
      startAsPaused: template.defaults.startAsPaused ?? false
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
