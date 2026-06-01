'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { useTokenWizard } from '../../TokenWizardContext'
import { buildTokenConfiguration } from '../../buildTokenConfiguration'
import { buildDataContract } from '../../buildDataContract'
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
const readOnlyExtensions = [
  json(),
  platformTheme,
  EditorView.editable.of(false),
  EditorState.readOnly.of(true)
]

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
  token: 'Token configuration',
  contract: 'Data contract',
  faq: 'FAQ'
}

// Reverse mapping: JSON config → partial form updates. Only "simple" fields
// that have a 1:1 form widget are mapped back. baseSupply / maxSupply stay
// form-only because the form value gets scaled by 10^decimals before reaching
// JSON — round-tripping the raw scaled value back to the form input would be
// lossy.
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

  // Pre-programmed: flatten { ts: { id: amount } } back to row list.
  const pp = config?.distributionRules?.preProgrammedDistribution
  if (pp && typeof pp === 'object' && pp.distributions && typeof pp.distributions === 'object') {
    const rows = []
    let seq = 0
    for (const [ts, perId] of Object.entries(pp.distributions)) {
      const tsNum = Number(ts)
      if (!Number.isFinite(tsNum) || !perId || typeof perId !== 'object') continue
      const iso = new Date(tsNum).toISOString().slice(0, 16)
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

function JsonPreview () {
  const { form, setField } = useTokenWizard()
  const configuration = useMemo(() => buildTokenConfiguration(form), [form])
  const code = useMemo(() => JSON.stringify(configuration, null, 2), [configuration])
  const contractCode = useMemo(() => JSON.stringify(buildDataContract(form), null, 2), [form])

  const [editorValue, setEditorValue] = useState(code)
  const [parseError, setParseError] = useState(null)
  const [view, setView] = useState('faq')
  const isFocusedRef = useRef(false)
  const debounceRef = useRef(null)

  // Sync form → editor ONLY when form changes (not on blur). Blur preserves
  // the user's typed text. Use a ref for focus so the effect doesn't depend
  // on it; otherwise blur would re-fire the effect and snap the value back.
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
          <TabButton id='token' label='Token' view={view} onSelect={setView}/>
          <TabButton id='contract' label='Contract' view={view} onSelect={setView}/>
          <TabButton id='faq' label='FAQ' view={view} onSelect={setView}/>
        </div>
      </div>

      {view === 'token' && (
        <>
          <CodeMirror
            value={editorValue}
            extensions={editableExtensions}
            theme={oneDark}
            basicSetup={basicSetup}
            onChange={handleChange}
            onFocus={() => { isFocusedRef.current = true }}
            onBlur={() => { isFocusedRef.current = false }}
            height='100%'
          />
          {parseError && (
            <div className='Preview__JsonError'>Invalid JSON — last valid state kept</div>
          )}
        </>
      )}

      {view === 'contract' && (
        <CodeMirror
          value={contractCode}
          extensions={readOnlyExtensions}
          theme={oneDark}
          basicSetup={basicSetup}
          height='100%'
        />
      )}

      {view === 'faq' && <FaqView/>}
    </div>
  )
}

export default JsonPreview
