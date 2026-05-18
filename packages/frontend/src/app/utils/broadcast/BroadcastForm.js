'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import * as Api from '../../../util/Api'
import { InfoLine, CreditsBlock } from '../../../components/data'
import { CopyButton } from '../../../components/ui/Buttons'
import TransactionStatusBadge from '../../../components/transactions/TransactionStatusBadge'
import TypeBadge from '../../../components/transactions/TypeBadge'
import { explainConsensusError } from '../../../enums/consensusErrors'
import './BroadcastForm.scss'

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#2E393D',
    border: '1px solid #404E53',
    borderRadius: '0.625rem',
    overflow: 'hidden',
    fontSize: '12px'
  },
  '.cm-gutters': {
    backgroundColor: '#1F2528',
    borderRight: '1px solid #404E53',
    color: '#6B7780'
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '.cm-content': { caretColor: 'transparent' },
  '&.cm-focused': { outline: 'none' }
})

const STATE = {
  EMPTY: 'EMPTY',
  VERIFYING: 'VERIFYING',
  VERIFIED_OK: 'VERIFIED_OK',
  VERIFIED_FAIL: 'VERIFIED_FAIL',
  BROADCASTING: 'BROADCASTING',
  WAITING: 'WAITING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
}

const isHex = (input) => /^[0-9a-fA-F]+$/.test(input.trim())

const computeSize = (trimmed) => {
  if (isHex(trimmed)) return Math.floor(trimmed.length / 2)
  try {
    return atob(trimmed).length
  } catch {
    return 0
  }
}

const computeHashFromWasm = async (trimmed) => {
  const { StateTransitionWASM } = await import('dash-platform-sdk/types')
  const tx = isHex(trimmed)
    ? StateTransitionWASM.fromHex(trimmed)
    : StateTransitionWASM.fromBase64(trimmed)
  return tx.hash(false)
}

const toBase64 = (trimmed) => {
  if (!isHex(trimmed)) return trimmed
  // hex → base64 для вызова /transaction/decode (он принимает base64)
  const bytes = new Uint8Array(trimmed.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(trimmed.substr(i * 2, 2), 16)
  }
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

function BroadcastForm () {
  const [input, setInput] = useState('')
  const [state, setState] = useState(STATE.EMPTY)
  const [verify, setVerify] = useState(null)
  const [decoded, setDecoded] = useState(null)
  const [hash, setHash] = useState(null)
  const [size, setSize] = useState(null)
  const [rate, setRate] = useState({ data: null, loading: true, error: null })
  const [errorText, setErrorText] = useState(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    Api.getRate()
      .then((data) => setRate({ data, loading: false, error: null }))
      .catch((error) => setRate({ data: null, loading: false, error }))
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  const reset = () => {
    setVerify(null)
    setDecoded(null)
    setHash(null)
    setSize(null)
    setErrorText(null)
    setState(STATE.EMPTY)
  }

  const handleInputChange = (value) => {
    setInput(value)
    if (verify || decoded || errorText) reset()
  }

  const handleVerify = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setState(STATE.VERIFYING)
    setErrorText(null)

    try {
      const base64 = toBase64(trimmed)
      const payload = isHex(trimmed) ? { hex: trimmed } : { base64: trimmed }

      const [decodedResult, verifyResult, computedHash] = await Promise.all([
        Api.decodeTx(base64).catch((e) => { console.warn('decode failed:', e); return null }),
        Api.verifyTransaction(payload),
        computeHashFromWasm(trimmed)
      ])

      setDecoded(decodedResult)
      setVerify(verifyResult)
      setHash(computedHash)
      setSize(computeSize(trimmed))
      setState(verifyResult.result === 'ok' ? STATE.VERIFIED_OK : STATE.VERIFIED_FAIL)
    } catch (e) {
      console.error(e)
      setErrorText(e?.message || 'Failed to parse or verify transaction')
      setState(STATE.ERROR)
    }
  }

  const handleSign = async () => {
    if (state !== STATE.VERIFIED_OK || !hash) return

    setState(STATE.BROADCASTING)
    setErrorText(null)

    try {
      const trimmed = input.trim()
      const payload = isHex(trimmed) ? { hex: trimmed } : { base64: trimmed }
      await Api.broadcastTransaction(payload)

      setState(STATE.WAITING)
      await Api.waitForStateTransitionResult(hash)
      setState(STATE.SUCCESS)
    } catch (e) {
      console.error(e)
      setErrorText(e?.message || 'Failed to broadcast transaction')
      setState(STATE.ERROR)
    }
  }

  const verifyDisabled = !input.trim() || state === STATE.VERIFYING || state === STATE.BROADCASTING
  const signDisabled = state !== STATE.VERIFIED_OK

  const verifyButtonLabel = state === STATE.VERIFYING ? 'Verifying…' : 'Verify'
  const signButtonLabel = state === STATE.BROADCASTING
    ? 'Broadcasting…'
    : state === STATE.WAITING
      ? 'Waiting…'
      : 'Sign'

  const statusValue = verify?.result === 'ok' ? 'SUCCESS' : 'FAIL'

  const showResults = !!verify

  return (
    <div className={'BroadcastForm'}>
      <div className={'BroadcastForm__Section'}>
        <div className={'BroadcastForm__SectionTitle'}>Details</div>

        <InfoLine
          className={'BroadcastForm__InputLine'}
          title={'Raw transaction data'}
          value={
            <div className={'BroadcastForm__Actions'}>
              <textarea
                ref={textareaRef}
                className={'BroadcastForm__Input'}
                placeholder={'(HEX, base64) Input Transaction Data...'}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                rows={3}
              />
              <button
                type='button'
                className={'BroadcastForm__Button BroadcastForm__Button--Primary'}
                onClick={handleVerify}
                disabled={verifyDisabled}
              >
                {verifyButtonLabel}
              </button>
              <button
                type='button'
                className={'BroadcastForm__Button BroadcastForm__Button--Secondary'}
                onClick={handleSign}
                disabled={signDisabled}
              >
                {signButtonLabel}
              </button>
            </div>
          }
        />

        {!showResults && !errorText && (
          <div className={'BroadcastForm__Helper'}>
            Paste a signed state transition above and click <strong>Verify</strong> to preview metadata and fee before broadcasting.
          </div>
        )}

        {showResults && (
          <>
            <InfoLine
              title={'Status'}
              value={<TransactionStatusBadge status={statusValue}/>}
            />
            <InfoLine
              title={'Size'}
              value={
                <span className={'BroadcastForm__Size'}>
                  <span>{size} </span>
                  <span className={'BroadcastForm__SizeUnit'}>bytes</span>
                </span>
              }
            />
            <InfoLine
              title={'Type'}
              value={<TypeBadge type={decoded?.typeString}/>}
            />
            <InfoLine
              title={'Fee'}
              value={<CreditsBlock credits={verify?.gasWanted} rate={rate}/>}
            />

            {verify?.result === 'error' && (
              <div className={'BroadcastForm__ErrorMessage'}>
                {explainConsensusError(verify.error, verify.code)}
              </div>
            )}
          </>
        )}

        {errorText && (
          <div className={'BroadcastForm__ErrorMessage'}>{errorText}</div>
        )}

        {state === STATE.SUCCESS && hash && (
          <div className={'BroadcastForm__HashRow'}>
            Broadcasted! <Link href={`/transaction/${hash}`}>View transaction →</Link>
          </div>
        )}
      </div>

      {decoded && (
        <div className={'BroadcastForm__Section BroadcastForm__Section--Editor'}>
          <div className={'BroadcastForm__SectionTitle'}>Transaction Details</div>
          <InfoLine
            title={'Raw data'}
            value={
              <div className={'BroadcastForm__EditorWrapper'}>
                <CodeMirror
                  className={'BroadcastForm__Editor'}
                  value={JSON.stringify(decoded, null, 2)}
                  extensions={[json(), editorTheme, EditorView.editable.of(false)]}
                  theme={oneDark}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false,
                    bracketMatching: true,
                    autocompletion: false
                  }}
                  height='auto'
                  minHeight='100px'
                  maxHeight='500px'
                />
                <CopyButton text={JSON.stringify(decoded, null, 2)}/>
              </div>
            }
          />
        </div>
      )}
    </div>
  )
}

export default BroadcastForm
