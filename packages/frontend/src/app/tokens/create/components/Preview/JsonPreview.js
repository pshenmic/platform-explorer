'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useTokenWizard } from '../../TokenWizardContext'
import { buildTokenConfiguration } from '../../buildTokenConfiguration'

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

const extensions = [json(), platformTheme]

// Reverse mapping: JSON config → partial form updates. Only "simple" fields
// that have a 1:1 form widget are mapped back. baseSupply / maxSupply stay
// form-only because the form value gets scaled by 10^decimals before reaching
// JSON — round-tripping the raw scaled value back to the form input would be
// lossy.
const isOwnerRule = (rule) => rule?.authorizedToMakeChange === 'ContractOwner'

const parseFormUpdates = (config) => {
  if (!config || typeof config !== 'object') return null
  const updates = {}

  const name = config?.conventions?.localizations?.en?.singularForm
  if (typeof name === 'string') updates.name = name

  if (typeof config.startAsPaused === 'boolean') {
    updates.startAsPaused = config.startAsPaused
  }

  if (config.manualMintingRules) updates.allowMint = isOwnerRule(config.manualMintingRules)
  if (config.manualBurningRules) updates.allowBurn = isOwnerRule(config.manualBurningRules)
  if (config.distributionRules?.changeDirectPurchasePricingRules) {
    updates.allowDirectPurchase = isOwnerRule(config.distributionRules.changeDirectPurchasePricingRules)
  }
  if (config.freezeRules) updates.allowFreeze = isOwnerRule(config.freezeRules)
  if (config.destroyFrozenFundsRules) updates.allowDestroyFrozen = isOwnerRule(config.destroyFrozenFundsRules)
  if (config.emergencyActionRules) updates.allowEmergency = isOwnerRule(config.emergencyActionRules)

  if (typeof config.description === 'string') updates.description = config.description
  else if (config.description === null) updates.description = ''

  return updates
}

function JsonPreview () {
  const { form, setField } = useTokenWizard()
  const configuration = useMemo(() => buildTokenConfiguration(form), [form])
  const code = useMemo(() => JSON.stringify(configuration, null, 2), [configuration])

  const [editorValue, setEditorValue] = useState(code)
  const [parseError, setParseError] = useState(null)
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
        <span>Token configuration</span>
        <a
          href='https://github.com/dashpay/platform/tree/master/packages/rs-dpp/src/data_contract/associated_token'
          target='_blank'
          rel='noopener noreferrer'
          className='Preview__JsonDocsLink'
        >
          ↗ docs
        </a>
      </div>
      <CodeMirror
        value={editorValue}
        extensions={extensions}
        theme={oneDark}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          bracketMatching: true,
          autocompletion: false,
          indentOnInput: false
        }}
        onChange={handleChange}
        onFocus={() => { isFocusedRef.current = true }}
        onBlur={() => { isFocusedRef.current = false }}
        height='100%'
      />
      {parseError && (
        <div className='Preview__JsonError'>Invalid JSON — last valid state kept</div>
      )}
    </div>
  )
}

export default JsonPreview
