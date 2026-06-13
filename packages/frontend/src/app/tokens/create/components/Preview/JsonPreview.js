'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useTokenWizard } from '../../TokenWizardContext'
import { buildTokenConfiguration } from '../../buildTokenConfiguration'
import FaqView from './FaqView'

// Same palette override as /dataContract/create SchemaField — Platform Explorer dark.
const platformTheme = EditorView.theme({
  '&': {
    backgroundColor: '#2E393D',
    border: '1px solid #404E53',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    fontSize: '12px'
  },
  '.cm-gutters': {
    backgroundColor: '#1F2528',
    borderRight: '1px solid #404E53',
    color: '#6B7780'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent'
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent'
  }
})

const editableExtensions = [json(), platformTheme]

const basicSetup = {
  lineNumbers: true,
  foldGutter: true,
  highlightActiveLine: false,
  highlightActiveLineGutter: false,
  bracketMatching: true,
  autocompletion: false,
  indentOnInput: false
}

const TITLES = {
  json: 'Token configuration',
  faq: 'FAQ'
}

// JSON → form. Supply fields aren't reversed: form scales by 10^decimals
// before reaching JSON, so the round-trip would be lossy.
const isOwnerRule = (rule) => rule?.authorizedToMakeChange === 'ContractOwner'

const parseFormUpdates = (config) => {
  if (!config || typeof config !== 'object') return null
  const updates = {}

  const enLoc = config?.conventions?.localizations?.en
  if (typeof enLoc?.singularForm === 'string') updates.name = enLoc.singularForm
  if (typeof enLoc?.pluralForm === 'string') {
    updates.pluralForm = enLoc.pluralForm
    updates.pluralEdited = true
  }
  if (typeof enLoc?.shouldCapitalize === 'boolean') {
    updates.shouldCapitalize = enLoc.shouldCapitalize
  }

  const decimals = config?.conventions?.decimals
  if (typeof decimals === 'number') updates.decimals = decimals

  if (typeof config.startAsPaused === 'boolean') {
    updates.startAsPaused = config.startAsPaused
  }
  if (typeof config.allowTransferToFrozenBalance === 'boolean') {
    updates.allowTransferToFrozenBalance = config.allowTransferToFrozenBalance
  }

  if (config.manualMintingRules) updates.allowMint = isOwnerRule(config.manualMintingRules)
  if (config.manualBurningRules) updates.allowBurn = isOwnerRule(config.manualBurningRules)
  if (config.distributionRules?.changeDirectPurchasePricingRules) {
    updates.allowDirectPurchase = isOwnerRule(config.distributionRules.changeDirectPurchasePricingRules)
  }
  if (config.freezeRules) updates.allowFreeze = isOwnerRule(config.freezeRules)
  if (config.destroyFrozenFundsRules) updates.allowDestroyFrozen = isOwnerRule(config.destroyFrozenFundsRules)
  if (config.emergencyActionRules) updates.allowEmergency = isOwnerRule(config.emergencyActionRules)

  const dest = config?.distributionRules?.newTokensDestinationIdentity
  if (typeof dest === 'string') updates.destinationIdentity = dest
  else if (dest === null) updates.destinationIdentity = ''

  const pp = config?.distributionRules?.preProgrammedDistribution
  if (pp && typeof pp === 'object' && pp.distributions && typeof pp.distributions === 'object') {
    const rows = []
    let seq = 0
    for (const [ts, perId] of Object.entries(pp.distributions)) {
      const tsNum = Number(ts)
      if (!Number.isFinite(tsNum) || !perId || typeof perId !== 'object') continue
      // datetime-local is local wall-clock, so shift by the tz offset before
      // slicing — using raw toISOString() (UTC) would drift the round-trip.
      const local = new Date(tsNum - new Date(tsNum).getTimezoneOffset() * 60000)
      const iso = local.toISOString().slice(0, 16)
      for (const [identity, amount] of Object.entries(perId)) {
        rows.push({ id: `pp${++seq}`, time: iso, identity, amount: String(amount) })
      }
    }
    updates.preProgrammedRows = rows
  } else if (pp === null) {
    updates.preProgrammedRows = []
  }

  // Perpetual: only Time + FixedAmount round-trips back to form; others ignored.
  const pd = config?.distributionRules?.perpetualDistribution
  if (pd && typeof pd === 'object') {
    const time = pd.distributionType?.TimeBasedDistribution
    const fixed = time?.function?.FixedAmount
    if (time && fixed && typeof time.interval === 'number') {
      updates.perpetualEnabled = true
      const intervalMs = time.interval
      let unit = 'days'; let value = intervalMs / 86_400_000
      if (intervalMs % 86_400_000 !== 0) {
        unit = 'hours'; value = intervalMs / 3_600_000
        if (intervalMs % 3_600_000 !== 0) {
          unit = 'minutes'; value = intervalMs / 60_000
          if (intervalMs % 60_000 !== 0) {
            unit = 'seconds'; value = intervalMs / 1000
          }
        }
      }
      updates.perpetualIntervalValue = String(value)
      updates.perpetualIntervalUnit = unit
      updates.perpetualAmount = String(fixed.amount)
      if (typeof pd.distributionRecipient === 'string' && pd.distributionRecipient === 'ContractOwner') {
        updates.perpetualRecipient = 'owner'
        updates.perpetualRecipientIdentity = ''
      } else if (pd.distributionRecipient?.Identity) {
        updates.perpetualRecipient = 'identity'
        updates.perpetualRecipientIdentity = pd.distributionRecipient.Identity
      }
    }
  } else if (pd === null) {
    updates.perpetualEnabled = false
  }

  const kh = config?.keepsHistory
  if (kh && typeof kh === 'object') {
    updates.keepsHistory = {
      transfer: kh.keepsTransferHistory !== false,
      freezing: kh.keepsFreezingHistory !== false,
      minting: kh.keepsMintingHistory !== false,
      burning: kh.keepsBurningHistory !== false,
      directPricing: kh.keepsDirectPricingHistory !== false,
      directPurchase: kh.keepsDirectPurchaseHistory !== false
    }
  }

  if (typeof config.description === 'string') updates.description = config.description
  else if (config.description === null) updates.description = ''

  return updates
}

const TabButton = ({ id, label, view, onSelect }) => (
  <button
    type='button'
    role='tab'
    aria-selected={view === id}
    className={`Preview__ViewToggleBtn${view === id ? ' Preview__ViewToggleBtn--active' : ''}`}
    onClick={() => onSelect(id)}
  >
    {label}
  </button>
)

function JsonPreview ({ view, onViewChange }) {
  const { form, setField } = useTokenWizard()
  const configuration = useMemo(() => buildTokenConfiguration(form), [form])
  const code = useMemo(() => JSON.stringify(configuration, null, 2), [configuration])

  const [editorValue, setEditorValue] = useState(code)
  const [parseError, setParseError] = useState(null)
  // Kept here so FAQ open-state survives switching to the JSON tab and back.
  const [faqOpen, setFaqOpen] = useState(() => new Set())
  const toggleFaq = (key) => setFaqOpen((prev) => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })
  const isFocusedRef = useRef(false)
  const debounceRef = useRef(null)

  // Sync form → editor only on form change. Focus tracked via ref so blur
  // doesn't re-fire and snap the user's typed value back.
  useEffect(() => {
    if (!isFocusedRef.current) {
      setEditorValue(code)
      setParseError(null)
    }
  }, [code])

  const handleChange = (newValue) => {
    setEditorValue(newValue)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(newValue)
        setParseError(null)
        const updates = parseFormUpdates(parsed)
        if (updates) {
          for (const [key, value] of Object.entries(updates)) {
            setField(key, value)
          }
        }
      } catch (e) {
        // Invalid JSON mid-typing — keep user's input, don't touch form.
        setParseError(e?.message || 'Invalid JSON')
      }
    }, 500)
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  return (
    <div className='Preview__Json'>
      <div className='Preview__JsonTitle'>
        <span>{TITLES[view]}</span>
        <div className='Preview__ViewToggle' role='tablist'>
          <TabButton id='json' label='JSON' view={view} onSelect={onViewChange}/>
          <TabButton id='faq' label='FAQ' view={view} onSelect={onViewChange}/>
        </div>
      </div>

      {view === 'json' && (
        <>
          <CodeMirror
            value={editorValue}
            extensions={editableExtensions}
            theme={oneDark}
            basicSetup={basicSetup}
            onChange={handleChange}
            onFocus={() => { isFocusedRef.current = true }}
            onBlur={() => { isFocusedRef.current = false }}
          />
          {parseError && (
            <div className='Preview__JsonError'>Invalid JSON — last valid state kept</div>
          )}
        </>
      )}

      {view === 'faq' && <FaqView open={faqOpen} onToggle={toggleFaq}/>}
    </div>
  )
}

export default JsonPreview
