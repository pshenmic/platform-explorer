'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryState } from 'nuqs'
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
import './BroadcastForm.scss'

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

const isHex = (input) => /^[0-9a-fA-F]+$/.test(input.trim())

const computeSize = (trimmed) => {
  if (isHex(trimmed)) return Math.floor(trimmed.length / 2)
  try {
    return atob(trimmed).length
  } catch {
    return 0
  }
}

const parseStateTransition = async (trimmed) => {
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

function SignedHexView ({ unsignedHex, signedHex, onEdit }) {
  const bodyRef = useRef(null)
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
  const [input, setInput] = useQueryState('tx', { defaultValue: '', clearOnDefault: true })
  const [state, setState] = useState(STATE.EMPTY)
  const [verify, setVerify] = useState(null)
  const [decoded, setDecoded] = useState(null)
  const [hash, setHash] = useState(null)
  const [size, setSize] = useState(null)
  const [rate, setRate] = useState({ data: null, loading: true, error: null })
  const [errorText, setErrorText] = useState(null)
  const [detectedOwnerId, setDetectedOwnerId] = useState(null)
  const [unsignedSnapshot, setUnsignedSnapshot] = useState(null)
  const textareaRef = useRef(null)

  const signerCtl = useSigner()
  const [wif, setWif] = useState('')
  const [identityIdInput, setIdentityIdInput] = useQueryState('identity', { defaultValue: '', clearOnDefault: true })
  const [methodParam, setMethodParam] = useQueryState('method', { defaultValue: '', clearOnDefault: true })

  useEffect(() => {
    if (methodParam && methodParam !== signerCtl.method) {
      signerCtl.setMethod(methodParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methodParam])

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

  const handleInputChange = (value) => {
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

  const verifyHex = async (rawHex) => {
    const trimmed = rawHex.trim()
    if (!trimmed) return

    setState(STATE.VERIFYING)
    setErrorText(null)

    try {
      const parsed = await parseStateTransition(trimmed)
      setHash(parsed.hash)
      setSize(computeSize(trimmed))

      const base64 = toBase64(trimmed)

      if (!parsed.isSigned) {
        setDetectedOwnerId(parsed.ownerId)
        const decodedResult = await Api.decodeTx(base64)
          .catch((e) => { console.warn('decode failed:', e); return null })
        setDecoded(decodedResult)
        setVerify(null)
        setState(STATE.UNSIGNED)
        return
      }

      const payload = isHex(trimmed) ? { hex: trimmed } : { base64: trimmed }
      const [decodedResult, verifyResult] = await Promise.all([
        Api.decodeTx(base64).catch((e) => { console.warn('decode failed:', e); return null }),
        Api.verifyTransaction(payload)
      ])

      setDecoded(decodedResult)
      setVerify(verifyResult)
      setState(verifyResult.result === 'ok' ? STATE.VERIFIED_OK : STATE.VERIFIED_FAIL)
    } catch (e) {
      console.error(e)
      setErrorText(e?.message || 'Failed to parse or verify transaction')
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
      setErrorText(e?.message || 'Failed to broadcast transaction')
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
      const signedTx = await activeSigner.sign(tx)
      const signedHex = signedTx.hex()
      setUnsignedSnapshot(trimmedInput)
      setInput(signedHex)
      setHash(signedTx.hash(false))
      setSize(computeSize(signedHex))
      setVerify(null)
      setState(STATE.SIGNED)
    } catch (e) {
      console.error(e)
      setErrorText(e?.message || 'Failed to sign transaction')
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
      const signedTx = await activeSigner.signAndBroadcast(tx)
      setInput(signedTx.hex())
      setHash(signedTx.hash(false))
      setVerify({ result: 'ok' })
      setState(STATE.SUCCESS)
    } catch (e) {
      console.error(e)
      const wasRejected = /reject/i.test(e?.message ?? '')
      setErrorText(wasRejected
        ? 'Extension cached an earlier rejection. Disable/re-enable the Dash Platform Extension in chrome://extensions/ to reset its state, then try again.'
        : (e?.message || 'Failed to sign & broadcast via extension'))
      setState(STATE.ERROR)
    }
  }

  const handlePrimarySign = () => {
    if (signerCtl.method === SignerMethod.PRIVATE_KEY) return handleSignPrivateKey()
    if (signerCtl.method === SignerMethod.EXTENSION) return handleSignAndBroadcastExtension()
  }

  const handleMethodChange = (newMethod) => {
    setErrorText(null)
    signerCtl.setMethod(newMethod)
    setMethodParam(newMethod)
  }

  const verifyDisabled = !input.trim() ||
    state === STATE.VERIFYING || state === STATE.BROADCASTING || state === STATE.SIGNING
  const broadcastDisabled = state !== STATE.VERIFIED_OK
  const broadcastLoading = state === STATE.BROADCASTING || state === STATE.WAITING
  const broadcastLoadingText = state === STATE.WAITING ? 'Waiting…' : 'Broadcasting…'

  const signLoading = state === STATE.SIGNING || signerCtl.isConnecting
  const signDisabled = signLoading ||
    (signerCtl.method === SignerMethod.PRIVATE_KEY && !wif.trim())
  const signButtonLabel = signerCtl.method === SignerMethod.EXTENSION
    ? 'Sign & Broadcast (Extension)'
    : 'Sign Transaction'
  const signLoadingText = signerCtl.method === SignerMethod.EXTENSION
    ? 'Awaiting popup…'
    : 'Signing…'

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
                  onChange={(e) => handleInputChange(e.target.value)}
                  rows={3}
                />
          }
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

            <div className={'BroadcastForm__SignPanelActions'}>
              <Button
                variant={'blue'}
                size={'sm'}
                minW={'200px'}
                onClick={handlePrimarySign}
                isLoading={signLoading}
                loadingText={signLoadingText}
                isDisabled={signDisabled}
              >
                {signButtonLabel}
              </Button>
            </div>

            {signerCtl.error && (
              <div className={'BroadcastForm__ErrorMessage'}>{signerCtl.error}</div>
            )}
          </div>
        </Collapse>
      </div>

      <div className={'BroadcastForm__Section'}>
        <div className={'BroadcastForm__SectionTitle'}>Details</div>

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
            ? <CreditsBlock credits={verify.gasWanted} rate={rate}/>
            : <NotActive>—</NotActive>}
        />
        <InfoLine
          title={'Fee Multiplier'}
          value={decoded?.userFeeIncrease != null
            ? <FeeMultiplier value={Number(decoded.userFeeIncrease)}/>
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

      <div className={'BroadcastForm__Section BroadcastForm__Section--Json'}>
        <Tabs variant={'line'} isLazy className={'BroadcastForm__Tabs'}>
          <TabList>
            <Tab>Decoded</Tab>
            <Tab>Raw</Tab>
          </TabList>
          <TabPanels className={'BroadcastForm__TabPanels'}>
            <TabPanel className={'BroadcastForm__TabPanel BroadcastForm__TabPanel--Variant TransactionPage'}>
              {decoded
                ? <TransactionType rate={rate} {...decoded}/>
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
