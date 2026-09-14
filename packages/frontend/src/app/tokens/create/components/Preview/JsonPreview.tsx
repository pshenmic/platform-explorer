'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useTokenWizard } from '../../TokenWizardContext'
import type {
  HistoryFlags,
  IntervalUnit,
  PreProgrammedRow,
  TokenForm
} from '../../TokenWizardContext'
import { buildTokenConfiguration } from '../../buildTokenConfiguration'
import type { PreviewView } from '../../CreateTokenPage'
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

const TITLES: Record<PreviewView, string> = {
  json: 'Token configuration',
  faq: 'FAQ'
}

// JSON → form. Supply fields aren't reversed: form scales by 10^decimals
// before reaching JSON, so the round-trip would be lossy.
const isOwnerRule = (rule: unknown): boolean =>
  typeof rule === 'object' &&
  rule != null &&
  (rule as { authorizedToMakeChange?: string }).authorizedToMakeChange === 'ContractOwner'

type PartialFormUpdates = Partial<TokenForm>

const parseFormUpdates = (config: unknown): PartialFormUpdates | null => {
  if (!config || typeof config !== 'object') return null
  const c = config as Record<string, any>
  const updates: PartialFormUpdates = {}

  const enLoc = c?.conventions?.localizations?.en
  if (typeof enLoc?.singularForm === 'string') updates.name = enLoc.singularForm
  if (typeof enLoc?.pluralForm === 'string') {
    updates.pluralForm = enLoc.pluralForm
    updates.pluralEdited = true
  }
  if (typeof enLoc?.shouldCapitalize === 'boolean') {
    updates.shouldCapitalize = enLoc.shouldCapitalize
  }

  const decimals = c?.conventions?.decimals
  if (typeof decimals === 'number') updates.decimals = decimals

  if (typeof c.startAsPaused === 'boolean') {
    updates.startAsPaused = c.startAsPaused
  }
  if (typeof c.allowTransferToFrozenBalance === 'boolean') {
    updates.allowTransferToFrozenBalance = c.allowTransferToFrozenBalance
  }

  if (c.manualMintingRules) updates.allowMint = isOwnerRule(c.manualMintingRules)
  if (c.manualBurningRules) updates.allowBurn = isOwnerRule(c.manualBurningRules)
  if (c.distributionRules?.changeDirectPurchasePricingRules) {
    updates.allowDirectPurchase = isOwnerRule(c.distributionRules.changeDirectPurchasePricingRules)
  }
  if (c.freezeRules) updates.allowFreeze = isOwnerRule(c.freezeRules)
  if (c.destroyFrozenFundsRules) updates.allowDestroyFrozen = isOwnerRule(c.destroyFrozenFundsRules)
  if (c.emergencyActionRules) updates.allowEmergency = isOwnerRule(c.emergencyActionRules)

  const dest = c?.distributionRules?.newTokensDestinationIdentity
  if (typeof dest === 'string') updates.destinationIdentity = dest
  else if (dest === null) updates.destinationIdentity = ''

  const pp = c?.distributionRules?.preProgrammedDistribution
  if (pp && typeof pp === 'object' && pp.distributions && typeof pp.distributions === 'object') {
    const rows: PreProgrammedRow[] = []
    let seq = 0
    for (const [ts, perId] of Object.entries(pp.distributions as Record<string, unknown>)) {
      const tsNum = Number(ts)
      if (!Number.isFinite(tsNum) || !perId || typeof perId !== 'object') continue
      // datetime-local is local wall-clock, so shift by the tz offset before
      // slicing — using raw toISOString() (UTC) would drift the round-trip.
      const local = new Date(tsNum - new Date(tsNum).getTimezoneOffset() * 60000)
      const iso = local.toISOString().slice(0, 16)
      for (const [identity, amount] of Object.entries(perId as Record<string, unknown>)) {
        rows.push({ id: `pp${++seq}`, time: iso, identity, amount: String(amount) })
      }
    }
    updates.preProgrammedRows = rows
  } else if (pp === null) {
    updates.preProgrammedRows = []
  }

  // Perpetual: only Time + FixedAmount round-trips back to form; others ignored.
  const pd = c?.distributionRules?.perpetualDistribution
  if (pd && typeof pd === 'object') {
    const time = pd.distributionType?.TimeBasedDistribution
    const fixed = time?.function?.FixedAmount
    if (time && fixed && typeof time.interval === 'number') {
      updates.perpetualEnabled = true
      const intervalMs = time.interval as number
      let unit: IntervalUnit = 'days'
      let value = intervalMs / 86_400_000
      if (intervalMs % 86_400_000 !== 0) {
        unit = 'hours'
        value = intervalMs / 3_600_000
        if (intervalMs % 3_600_000 !== 0) {
          unit = 'minutes'
          value = intervalMs / 60_000
          if (intervalMs % 60_000 !== 0) {
            unit = 'seconds'
            value = intervalMs / 1000
          }
        }
      }
      updates.perpetualIntervalValue = String(value)
      updates.perpetualIntervalUnit = unit
      updates.perpetualAmount = String(fixed.amount)
      if (
        typeof pd.distributionRecipient === 'string' &&
        pd.distributionRecipient === 'ContractOwner'
      ) {
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

  const kh = c?.keepsHistory
  if (kh && typeof kh === 'object') {
    const history: HistoryFlags = {
      transfer: kh.keepsTransferHistory !== false,
      freezing: kh.keepsFreezingHistory !== false,
      minting: kh.keepsMintingHistory !== false,
      burning: kh.keepsBurningHistory !== false,
      directPricing: kh.keepsDirectPricingHistory !== false,
      directPurchase: kh.keepsDirectPurchaseHistory !== false
    }
    updates.keepsHistory = history
  }

  if (typeof c.description === 'string') updates.description = c.description
  else if (c.description === null) updates.description = ''

  return updates
}

interface TabButtonProps {
  id: PreviewView
  label: string
  view: PreviewView
  onSelect: (id: PreviewView) => void
}

const TabButton = ({ id, label, view, onSelect }: TabButtonProps) => (
  <button
    type="button"
    role="tab"
    aria-selected={view === id}
    className={`Preview__ViewToggleBtn${view === id ? ' Preview__ViewToggleBtn--active' : ''}`}
    onClick={() => onSelect(id)}
  >
    {label}
  </button>
)

interface JsonPreviewProps {
  view: PreviewView
  onViewChange: (view: PreviewView) => void
}

function JsonPreview({ view, onViewChange }: JsonPreviewProps) {
  const { form, setField } = useTokenWizard()
  const configuration = useMemo(() => buildTokenConfiguration(form), [form])
  const code = useMemo(() => JSON.stringify(configuration, null, 2), [configuration])

  const [editorValue, setEditorValue] = useState(code)
  const [parseError, setParseError] = useState<string | null>(null)
  // Kept here so FAQ open-state survives switching to the JSON tab and back.
  const [faqOpen, setFaqOpen] = useState(() => new Set<string>())
  const toggleFaq = (key: string) =>
    setFaqOpen(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  const isFocusedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync form → editor only on form change. Focus tracked via ref so blur
  // doesn't re-fire and snap the user's typed value back.
  useEffect(() => {
    if (!isFocusedRef.current) {
      setEditorValue(code)
      setParseError(null)
    }
  }, [code])

  const handleChange = (newValue: string) => {
    setEditorValue(newValue)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try {
        const parsed: unknown = JSON.parse(newValue)
        setParseError(null)
        const updates = parseFormUpdates(parsed)
        if (updates) {
          for (const [key, value] of Object.entries(updates)) {
            setField(key as keyof TokenForm, value as TokenForm[keyof TokenForm])
          }
        }
      } catch (e) {
        // Invalid JSON mid-typing — keep user's input, don't touch form.
        setParseError((e as Error)?.message || 'Invalid JSON')
      }
    }, 500)
  }

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    []
  )

  return (
    <div className="Preview__Json">
      <div className="Preview__JsonTitle">
        <span>{TITLES[view]}</span>
        <div className="Preview__ViewToggle" role="tablist">
          <TabButton id="json" label="JSON" view={view} onSelect={onViewChange} />
          <TabButton id="faq" label="FAQ" view={view} onSelect={onViewChange} />
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
            onFocus={() => {
              isFocusedRef.current = true
            }}
            onBlur={() => {
              isFocusedRef.current = false
            }}
          />
          {parseError && (
            <div className="Preview__JsonError">Invalid JSON — last valid state kept</div>
          )}
        </>
      )}

      {view === 'faq' && <FaqView open={faqOpen} onToggle={toggleFaq} />}
    </div>
  )
}

export default JsonPreview
