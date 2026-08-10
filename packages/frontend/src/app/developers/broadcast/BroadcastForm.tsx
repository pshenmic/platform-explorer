'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, Collapse, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import * as Api from '../../../util/Api'
import { useSigner, SignerMethod } from 'src/hooks/useSigner'
import { MethodSelect, PrivateKeyForm } from 'src/components/signing'
import { InfoLine, CreditsBlock, JsonViewer, NotActive, Identifier } from '../../../components/data'
import { ValueCard } from '../../../components/cards'
import { CopyButton } from '../../../components/ui/Buttons'
import TransactionStatusBadge from '../../../components/transactions/TransactionStatusBadge'
import TypeBadge from '../../../components/transactions/TypeBadge'
import FeeMultiplier from '../../../components/transactions/FeeMultiplier'
import { TransactionType } from '../../transaction/[hash]/components/TransactionType'
import { explainConsensusError } from '../../../enums/consensusErrors'
import type { ChangeEvent, RefObject } from 'react'
import type { Rate } from '../../../types'
import './BroadcastForm.scss'

type FormState = typeof STATE[keyof typeof STATE]

interface VerifyResult {
  result?: 'ok' | 'error' | string
  error?: string
  code?: number | string
  gasWanted?: number
}

interface DecodedTx {
  typeString?: string
  ownerId?: string
  userFeeIncrease?: number | string
  identityNonce?: number | string
  signaturePublicKeyId?: number | string
  signature?: string
  [key: string]: unknown
}

interface SignedHexViewProps {
  unsignedHex: string
  signedHex: string
  onEdit: () => void
}


const STATE = {
  EMPTY: 'EMPTY',
  VERIFYING: 'VERIFYING',
  VERIFIED_OK: 'VERIFIED_OK',
  VERIFIED_FAIL: 'VERIFIED_FAIL',
  UNSIGNED: 'UNSIGNED',
  SIGNING: 'SIGNING',
  SIGNED: 'SIGNED',
  BROADCASTING: 'BROADCASTING',
  WAITING: 'WAITING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
}

// Signature-related errors only: signing fixes these. Nonce/schema/state errors are not in this set.
const SIGN_FIXABLE_ERRORS = new Set([
  'InvalidStateTransitionSignatureError', // 20002
  'MissingPublicKeyError', // 20003
  'InvalidSignaturePublicKeySecurityLevelError', // 20004
  'WrongPublicKeyPurposeError', // 20005
  'PublicKeyIsDisabledError', // 20006
  'PublicKeySecurityLevelNotMetError', // 20007
  'InvalidSignaturePublicKeyPurposeError' // 20011
])

const isHex = (input: string) => /^[0-9a-fA-F]+$/.test(input.trim())

const computeSize = (trimmed: string) => {
  if (isHex(trimmed)) return Math.floor(trimmed.length / 2)
  try {
    return atob(trimmed).length
  } catch {
    return 0
  }
}

const parseStateTransition = async (trimmed: string) => {
  const { StateTransitionWASM } = await import('dash-platform-sdk/types')
  const tx = isHex(trimmed)
    ? StateTransitionWASM.fromHex(trimmed)
    : StateTransitionWASM.fromBase64(trimmed)
  const sig = tx.signature
  const isSigned = sig != null && sig.length > 0
  let ownerId = null
  try {
    ownerId = tx.getOwnerId?.()?.base58?.() ?? null
  } catch {
    ownerId = null
  }
  return { tx, hash: tx.hash(false), isSigned, ownerId }
}

const toBase64 = (trimmed: string) => {
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

function SignedHexView ({ unsignedHex, signedHex, onEdit }: SignedHexViewProps) {
  const bodyRef = useRef<HTMLDivElement | null>(null)
  let diffStart = 0
  const min = Math.min(unsignedHex.length, signedHex.length)
  while (diffStart < min && unsignedHex[diffStart] === signedHex[diffStart]) diffStart++
  const unchanged = signedHex.slice(0, diffStart)
  const appended = signedHex.slice(diffStart)
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [signedHex])
  return (
    <div className={'BroadcastForm__SignedHexView'}>
      <div className={'BroadcastForm__SignedHexHeader'}>
        <span>Signed locally — {appended.length} new hex chars appended</span>
        <div className={'BroadcastForm__SignedHexActions'}>
          <CopyButton text={signedHex}/>
          <Button variant={'gray'} size={'xs'} onClick={onEdit}>Edit</Button>
        </div>
      </div>
      <div ref={bodyRef} className={'BroadcastForm__SignedHexBody'}>
        <span>{unchanged}</span>
        <span className={'BroadcastForm__SignedHexAppended'}>{appended}</span>
      </div>
    </div>
  )
}

function BroadcastForm () {
  const [input, setInput] = useState('')
  const [state, setState] = useState<FormState>(STATE.EMPTY)
  const [verify, setVerify] = useState<VerifyResult | null>(null)
  const [decoded, setDecoded] = useState<DecodedTx | null>(null)
  const [hash, setHash] = useState<string | null>(null)
  const [size, setSize] = useState<number | null>(null)
  const [rate, setRate] = useState<{ data: Rate | null, loading: boolean, error: unknown }>({ data: null, loading: true, error: null })
  const [errorText, setErrorText] = useState<string | null>(null)
  const [detectedOwnerId, setDetectedOwnerId] = useState<string | null>(null)
  const [unsignedSnapshot, setUnsignedSnapshot] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const signerCtl = useSigner()
  const [wif, setWif] = useState('')
  const [identityIdInput, setIdentityIdInput] = useState('')

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
    setDetectedOwnerId(null)
    setErrorText(null)
    setUnsignedSnapshot(null)
    setState(STATE.EMPTY)
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    if (
      verify || decoded || errorText ||
      state === STATE.UNSIGNED || state === STATE.SUCCESS
    ) reset()
  }

  useEffect(() => {
    if (detectedOwnerId && !identityIdInput) {
      setIdentityIdInput(detectedOwnerId)
    }
  }, [detectedOwnerId, identityIdInput])

  const verifyHex = async (rawHex: string) => {
    const trimmed = rawHex.trim()
    if (!trimmed) return

    setState(STATE.VERIFYING)
    setErrorText(null)

    try {
      const parsed = await parseStateTransition(trimmed)
      setHash(parsed.hash)
      setSize(computeSize(trimmed))
      if (!parsed.isSigned) setDetectedOwnerId(parsed.ownerId)

      const base64 = toBase64(trimmed)
      const payload = isHex(trimmed) ? { hex: trimmed } : { base64: trimmed }
      const [decodedResult, verifyResult] = await Promise.all([
        Api.decodeTx(base64).catch((e) => { console.warn('decode failed:', e); return null }),
        Api.verifyTransaction(payload).catch((e) => { console.warn('verify failed:', e); return null })
      ])

      setDecoded(decodedResult as DecodedTx | null)
      setVerify(verifyResult as VerifyResult | null)

      if (!parsed.isSigned) {
        if ((verifyResult as VerifyResult | null)?.result === 'error') {
          const fixableBySigning = SIGN_FIXABLE_ERRORS.has(String((verifyResult as VerifyResult).error))
          setState(fixableBySigning ? STATE.UNSIGNED : STATE.VERIFIED_FAIL)
        } else {
          setState(STATE.UNSIGNED)
        }
      } else {
        setState((verifyResult as VerifyResult | null)?.result === 'ok' ? STATE.VERIFIED_OK : STATE.VERIFIED_FAIL)
      }
    } catch (e) {
      console.error(e)
      setErrorText((e as Error)?.message || 'Failed to parse or verify transaction')
      setState(STATE.ERROR)
    }
  }

  const handleVerify = () => verifyHex(input)

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
      setErrorText((e as Error)?.message || 'Failed to broadcast transaction')
      setState(STATE.ERROR)
    }
  }

  const handleSignPrivateKey = async () => {
    setState(STATE.SIGNING)
    setErrorText(null)

    const activeSigner = signerCtl.isConnected
      ? signerCtl.signer
      : await signerCtl.connect({ wif, identityId: identityIdInput })

    if (!activeSigner) {
      setErrorText(signerCtl.error || 'Signer is not connected')
      setState(STATE.UNSIGNED)
      return
    }

    try {
      const trimmedInput = input.trim()
      const { tx } = await parseStateTransition(trimmedInput)
      const signedTx = await activeSigner.sign(tx) as { hex: () => string, hash: (b: boolean) => string }
      const signedHex = signedTx.hex()
      setUnsignedSnapshot(trimmedInput)
      setInput(signedHex)
      setHash(signedTx.hash(false))
      setSize(computeSize(signedHex))
      setVerify(null)
      setState(STATE.SIGNED)
    } catch (e) {
      console.error(e)
      setErrorText((e as Error)?.message || 'Failed to sign transaction')
      setState(STATE.ERROR)
    }
  }

  const handleSignAndBroadcastExtension = async () => {
    setState(STATE.SIGNING)
    setErrorText(null)

    const activeSigner = signerCtl.isConnected
      ? signerCtl.signer
      : await signerCtl.connect()

    if (!activeSigner) {
      setErrorText(signerCtl.error || 'Extension is not connected')
      setState(STATE.UNSIGNED)
      return
    }

    try {
      const { tx } = await parseStateTransition(input.trim())
      const signedTx = await activeSigner.signAndBroadcast(tx) as { hex: () => string, hash: (b: boolean) => string }
      setInput(signedTx.hex())
      setHash(signedTx.hash(false))
      setVerify({ result: 'ok' })
      setState(STATE.SUCCESS)
    } catch (e) {
      console.error(e)
      const wasRejected = /reject/i.test((e as Error)?.message ?? '')
      setErrorText(wasRejected
        ? 'Extension cached an earlier rejection. Disable/re-enable the Dash Platform Extension in chrome://extensions/ to reset its state, then try again.'
        : ((e as Error)?.message || 'Failed to sign & broadcast via extension'))
      setState(STATE.ERROR)
    }
  }

  const handleMethodChange = (newMethod: typeof signerCtl.method) => {
    setErrorText(null)
    signerCtl.setMethod(newMethod)
  }

  const getPrimaryAction = () => {
    if (state === STATE.BROADCASTING || state === STATE.WAITING) {
      return { label: 'Broadcast', isLoading: true, loadingText: state === STATE.WAITING ? 'Waiting…' : 'Broadcasting…', isDisabled: true }
    }
    if (state === STATE.VERIFIED_OK) {
      return { label: 'Broadcast', onClick: handleBroadcast, isDisabled: !hash }
    }
    if (state === STATE.UNSIGNED || state === STATE.SIGNING) {
      if (signerCtl.method === SignerMethod.EXTENSION) {
        if (!signerCtl.isConnected) {
          return { label: 'Connect Wallet', onClick: () => signerCtl.connect(), isLoading: signerCtl.isConnecting, loadingText: 'Connecting…' }
        }
        return { label: 'Sign & Broadcast', onClick: handleSignAndBroadcastExtension, isLoading: state === STATE.SIGNING, loadingText: 'Awaiting popup…' }
      }
      return { label: 'Sign', onClick: handleSignPrivateKey, isLoading: state === STATE.SIGNING || signerCtl.isConnecting, loadingText: 'Signing…', isDisabled: !wif.trim() }
    }
    if (state === STATE.VERIFYING) {
      return { label: 'Verify', isLoading: true, loadingText: 'Verifying…', isDisabled: true }
    }
    return { label: 'Verify', onClick: handleVerify, isDisabled: !input.trim() }
  }

  const primaryAction = getPrimaryAction()

  const statusValue = state === STATE.SUCCESS
    ? 'SUCCESS'
    : state === STATE.UNSIGNED
      ? 'UNSIGNED'
      : verify?.result === 'ok' ? 'SUCCESS' : 'FAIL'
  const hasStatus = verify || state === STATE.UNSIGNED || state === STATE.SUCCESS

  return (
    <div className={'BroadcastForm'}>
      <div className={'BroadcastForm__Section'}>
        <div className={'BroadcastForm__SectionTitle'}>Input</div>

        <InfoLine
          className={'BroadcastForm__InputLine'}
          title={'Raw transaction data'}
          value={
            unsignedSnapshot
              ? <SignedHexView
                  unsignedHex={unsignedSnapshot}
                  signedHex={input}
                  onEdit={() => {
                    setInput(unsignedSnapshot)
                    setUnsignedSnapshot(null)
                    setVerify(null)
                    setHash(null)
                    setSize(null)
                    setState(STATE.EMPTY)
                  }}
                />
              : <textarea
                  ref={textareaRef}
                  className={'BroadcastForm__Input'}
                  placeholder={'(HEX, base64) Input Transaction Data...'}
                  value={input}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e.target.value)}
                  rows={3}
                />
          }
        />

        <Collapse in={state === STATE.UNSIGNED || state === STATE.SIGNING} animateOpacity unmountOnExit={false}>
          <div className={'BroadcastForm__SignPanel'}>
            <div className={'BroadcastForm__SignPanelHeader'}>
              Transaction is not signed. Sign it to continue.
            </div>

            <div className={'BroadcastForm__SignPanelMethod'}>
              <MethodSelect
                value={signerCtl.method}
                onChange={handleMethodChange}
                isDisabled={signerCtl.isConnecting || state === STATE.SIGNING}
              />
              <div className={'BroadcastForm__SignPanelHint'}>
                {signerCtl.method === SignerMethod.EXTENSION
                  ? 'Extension signs and broadcasts in one step (via popup).'
                  : 'Private Key signs locally — you can verify and broadcast separately.'}
              </div>
            </div>

            {signerCtl.method === SignerMethod.PRIVATE_KEY && (
              <PrivateKeyForm
                wif={wif}
                setWif={setWif}
                identityId={identityIdInput}
                setIdentityId={setIdentityIdInput}
                isInactive={signerCtl.isConnecting || state === STATE.SIGNING}
                identityIdPlaceholder={detectedOwnerId ? 'Identity ID (detected from tx)' : 'Identity ID (optional)'}
              />
            )}

            {signerCtl.error && (
              <div className={'BroadcastForm__ErrorMessage'}>{signerCtl.error}</div>
            )}
          </div>
        </Collapse>

        <div className={'BroadcastForm__ButtonsRow'}>
          <Button
            variant={'blue'}
            size={'sm'}
            minW={'200px'}
            onClick={primaryAction.onClick}
            isLoading={primaryAction.isLoading}
            loadingText={primaryAction.loadingText}
            isDisabled={primaryAction.isDisabled}
          >
            {primaryAction.label}
          </Button>

          <div className={'BroadcastForm__ButtonMessage'}>
            {verify?.result === 'error' && state !== STATE.UNSIGNED && (
              <span className={'BroadcastForm__ButtonMessage--error'}>
                {explainConsensusError(verify.error, typeof verify.code === 'number' ? verify.code : Number(verify.code))}
              </span>
            )}
            {errorText && (
              <span className={'BroadcastForm__ButtonMessage--error'}>{errorText}</span>
            )}
            {state === STATE.SUCCESS && hash && (
              <span className={'BroadcastForm__ButtonMessage--success'}>
                Broadcasted! <Link href={`/transaction/${hash}`}>View transaction →</Link>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={'BroadcastForm__Section BroadcastForm__Section--Json'}>
        <Tabs variant={'line'} isLazy className={'BroadcastForm__Tabs'}>
          <TabList>
            <Tab>Decoded</Tab>
            <Tab>Raw</Tab>
          </TabList>
          <TabPanels className={'BroadcastForm__TabPanels'}>
            <TabPanel className={'BroadcastForm__TabPanel BroadcastForm__TabPanel--Variant TransactionPage'}>
              <div className={'BroadcastForm__DecodedMeta'}>
                <InfoLine
                  title={'Hash'}
                  value={hash
                    ? <Identifier copyButton={true} ellipsis={false} styles={['highlight-both']}>{hash}</Identifier>
                    : <NotActive>—</NotActive>}
                />
                <InfoLine
                  title={'Type'}
                  value={decoded?.typeString ? <TypeBadge type={decoded.typeString}/> : <NotActive>—</NotActive>}
                />
                <InfoLine
                  title={'Status'}
                  value={hasStatus ? <TransactionStatusBadge status={statusValue}/> : <NotActive>—</NotActive>}
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
                  title={'Owner'}
                  value={(decoded?.ownerId || detectedOwnerId)
                    ? (
                      <ValueCard link={`/identity/${decoded?.ownerId ?? detectedOwnerId}`}>
                        <Identifier avatar={true} copyButton={true} ellipsis={false} styles={['highlight-both']}>
                          {decoded?.ownerId ?? detectedOwnerId}
                        </Identifier>
                      </ValueCard>
                      )
                    : <NotActive>—</NotActive>}
                />
                <InfoLine
                  title={'Fee'}
                  value={verify?.gasWanted != null
                    ? <CreditsBlock credits={verify.gasWanted} rate={rate as never}/>
                    : <NotActive>—</NotActive>}
                />
                <InfoLine
                  title={'Fee Multiplier'}
                  value={decoded?.userFeeIncrease != null
                    ? <FeeMultiplier value={Number(decoded.userFeeIncrease) as number}/>
                    : <NotActive>—</NotActive>}
                />
                <InfoLine
                  title={'Identity Nonce'}
                  value={decoded?.identityNonce != null ? decoded.identityNonce : <NotActive>—</NotActive>}
                />
                <InfoLine
                  title={'Signature Public Key Id'}
                  value={decoded?.signaturePublicKeyId != null ? decoded.signaturePublicKeyId : <NotActive>—</NotActive>}
                />
                <InfoLine
                  title={'Signature'}
                  value={decoded?.signature
                    ? (
                      <ValueCard className={'BroadcastForm__Signature'}>
                        {decoded.signature}
                        <CopyButton text={decoded.signature}/>
                      </ValueCard>
                      )
                    : <NotActive>—</NotActive>}
                />
              </div>
              <div className={'BroadcastForm__DecodedDivider'}/>
              {decoded
                ? (() => {
                    const txProps = { rate, ...decoded } as Parameters<typeof TransactionType>[0]
                    return <TransactionType {...txProps}/>
                  })()
                : (
                  <div className={'BroadcastForm__EmptyVariant'}>
                    Paste a signed transaction above and click Verify to decode it here.
                  </div>
                  )}
            </TabPanel>
            <TabPanel className={'BroadcastForm__TabPanel'}>
              <JsonViewer
                value={decoded}
                fill
                placeholder={'Paste a signed transaction above and click Verify to decode it here.'}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  )
}

export default BroadcastForm
