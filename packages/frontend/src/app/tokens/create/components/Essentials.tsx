'use client'

import { useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { YesNoBadge } from './FeatureRow'
import Tooltip from '@components/ui/Tooltips/Tooltip'
import { useTokenWizard } from '../TokenWizardContext'
import type { TokenForm } from '../TokenWizardContext'
import './Essentials.css'
import './Advanced.css'

const sanitizeName = (s: string): string => s.replace(/[^A-Za-z0-9]/g, '')

const nameHint = (value: string): string | null => {
  if (value && value.length < 3) return 'At least 3 characters'
  return null
}

interface FieldLabelProps {
  label: ReactNode
  tooltip: ReactNode
  rightSlot?: ReactNode
}

const FieldLabel = ({ label, tooltip, rightSlot }: FieldLabelProps) => (
  <div className="Essentials__LabelRow">
    <Tooltip content={tooltip} placement="top">
      <button type="button" className="Essentials__Label">
        {label}
      </button>
    </Tooltip>
    {rightSlot}
  </div>
)

type BooleanFormKey = {
  [K in keyof TokenForm]: TokenForm[K] extends boolean ? K : never
}[keyof TokenForm]

function Essentials() {
  const { form, setField } = useTokenWizard()
  const [touched, setTouched] = useState<{ name: boolean }>({ name: false })

  const markTouched = (key: 'name') => () => setTouched(t => ({ ...t, [key]: true }))

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = sanitizeName(e.target.value)
    setField('name', next)
    if (!form.pluralEdited) {
      setField('pluralForm', next ? `${next}s` : '')
    }
  }

  const nameError = touched.name ? nameHint(form.name) : null

  const onDigitsChange =
    (key: 'baseSupply' | 'maxSupply') => (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value.replace(/\D/g, '')
      setField(key, next)
    }

  const toggle = (key: BooleanFormKey) => () => setField(key, !form[key])

  return (
    <div className="Essentials">
      <div className="Essentials__Field">
        <FieldLabel
          label="Token name"
          tooltip="Singular display name. 3–25 letters or digits, no spaces."
        />
        <input
          className="WizardInput WizardInput--sm"
          placeholder="Singular, e.g. MyToken (3–25, no spaces)"
          value={form.name}
          onChange={onNameChange}
          onBlur={markTouched('name')}
          maxLength={25}
          style={{ width: '100%' }}
        />
        {nameError && <p className="Essentials__Hint">{nameError}</p>}
      </div>

      <div className="Essentials__Field">
        <FieldLabel
          label="Description"
          tooltip="Optional note shown on the token page. Up to 256 characters."
        />
        <textarea
          className="WizardTextarea"
          placeholder="Optional notes shown on the token page (e.g. what the token is for)."
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          rows={3}
          maxLength={256}
          style={{ width: '100%' }}
        />
      </div>

      <div className="Essentials__Field">
        <FieldLabel
          label="Base supply"
          tooltip="Tokens minted to you now. Mint more later if minting is on."
        />
        <input
          className="WizardInput WizardInput--sm"
          placeholder="1000000"
          value={form.baseSupply}
          onChange={onDigitsChange('baseSupply')}
          inputMode="numeric"
          style={{ width: '100%' }}
        />
      </div>

      <div className="Essentials__Field">
        <FieldLabel
          label="Max supply"
          tooltip="Hard cap on tokens that can ever exist. Off = unlimited."
          rightSlot={<YesNoBadge value={form.hasMaxSupply} onToggle={toggle('hasMaxSupply')} />}
        />
        <input
          className="WizardInput WizardInput--sm"
          placeholder={form.hasMaxSupply ? '10000000' : 'Unlimited'}
          value={form.maxSupply}
          onChange={onDigitsChange('maxSupply')}
          inputMode="numeric"
          disabled={!form.hasMaxSupply}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}

export default Essentials
