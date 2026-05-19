'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@chakra-ui/react'
import * as Api from '../../../util/Api'
import { InfoLine, CreditsBlock, JsonViewer, NotActive } from '../../../components/data'
import { CopyButton } from '../../../components/ui/Buttons'
import TransactionStatusBadge from '../../../components/transactions/TransactionStatusBadge'
import TypeBadge from '../../../components/transactions/TypeBadge'
import { explainConsensusError } from '../../../enums/consensusErrors'
import './BroadcastForm.scss'

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
  // /transaction/decode accepts base64 only — re-encode hex first
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

  const handleBroadcast = async () => {
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
  const broadcastDisabled = state !== STATE.VERIFIED_OK
  const broadcastLoading = state === STATE.BROADCASTING || state === STATE.WAITING
  const broadcastLoadingText = state === STATE.WAITING ? 'Waiting…' : 'Broadcasting…'

  const statusValue = verify?.result === 'ok' ? 'SUCCESS' : 'FAIL'
  const hasSchema = decoded?.schema && (decoded.typeString === 'DATA_CONTRACT_CREATE' || decoded.typeString === 'DATA_CONTRACT_UPDATE')

  return (
    <div className={'BroadcastForm'}>
      <div className={'BroadcastForm__Section'}>
        <div className={'BroadcastForm__SectionTitle'}>Details</div>

        <div className={'BroadcastForm__DetailsRow'}>
          <div className={'BroadcastForm__DetailsForm'}>
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
                  <div className={'BroadcastForm__ButtonsRow'}>
                    <Button
                      variant={'blue'}
                      size={'sm'}
                      minW={'160px'}
                      onClick={handleVerify}
                      isLoading={state === STATE.VERIFYING}
                      loadingText={'Verifying…'}
                      isDisabled={verifyDisabled}
                    >
                      Verify
                    </Button>
                    <Button
                      variant={'gray'}
                      size={'sm'}
                      minW={'160px'}
                      onClick={handleBroadcast}
                      isLoading={broadcastLoading}
                      loadingText={broadcastLoadingText}
                      isDisabled={broadcastDisabled}
                    >
                      Broadcast
                    </Button>
                  </div>
                </div>
              }
            />

            {verify?.result === 'error' && (
              <div className={'BroadcastForm__ErrorMessage'}>
                {explainConsensusError(verify.error, verify.code)}
              </div>
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

          <div className={'BroadcastForm__DetailsMetadata'}>
            <InfoLine
              title={'Status'}
              value={verify ? <TransactionStatusBadge status={statusValue}/> : <NotActive>—</NotActive>}
            />
            <InfoLine
              title={'Size'}
              value={size != null
                ? (
                  <span className={'BroadcastForm__Size'}>
                    <span>{size} </span>
                    <span className={'BroadcastForm__SizeUnit'}>bytes</span>
                  </span>
                  )
                : <NotActive>—</NotActive>}
            />
            <InfoLine
              title={'Type'}
              value={decoded?.typeString ? <TypeBadge type={decoded.typeString}/> : <NotActive>—</NotActive>}
            />
            <InfoLine
              title={'Fee'}
              value={verify?.gasWanted != null
                ? <CreditsBlock credits={verify.gasWanted} rate={rate}/>
                : <NotActive>—</NotActive>}
            />
          </div>
        </div>
      </div>

      <div className={'BroadcastForm__Columns'}>
        <div className={'BroadcastForm__Section'}>
          <div className={'BroadcastForm__SectionHeader'}>
            <div className={'BroadcastForm__SectionTitle'}>Decoded — Schema</div>
            {hasSchema && <CopyButton text={JSON.stringify(decoded.schema, null, 2)}/>}
          </div>
          <JsonViewer
            value={hasSchema ? decoded.schema : null}
            fill
            showCopy={false}
            placeholder={decoded
              ? (hasSchema ? undefined : 'This transaction type has no schema preview.')
              : 'Verify a Data Contract transaction to preview its schema here.'}
          />
        </div>
        <div className={'BroadcastForm__Section'}>
          <div className={'BroadcastForm__SectionHeader'}>
            <div className={'BroadcastForm__SectionTitle'}>Transaction Details</div>
            {decoded && <CopyButton text={JSON.stringify(decoded, null, 2)}/>}
          </div>
          <JsonViewer
            value={decoded}
            fill
            showCopy={false}
            placeholder={'Paste a signed transaction above and click Verify to decode it here.'}
          />
        </div>
      </div>
    </div>
  )
}

export default BroadcastForm
