'use client'

import { useEffect, useRef } from 'react'
import { useTokenWizard } from '../TokenWizardContext'
import { buildSummary } from '../buildSummary'
import './ReviewModal.css'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeploying: boolean
  signerIdentityId?: string
}

function ReviewModal({
  isOpen,
  onClose,
  onConfirm,
  isDeploying,
  signerIdentityId
}: ReviewModalProps) {
  const { form } = useTokenWizard()
  const bullets = buildSummary(form)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isOpen) {
      if (!el.open) el.showModal()
    } else if (el.open) {
      el.close()
    }
  }, [isOpen])

  return (
    <dialog
      ref={ref}
      className="ReviewModal InfoBlock InfoBlock--Gradient"
      onClose={onClose}
      onCancel={e => {
        if (isDeploying) e.preventDefault()
      }}
    >
      <div className="ReviewModal__Header">
        <h2 className="ReviewModal__Title">Review token deploy</h2>
        <button
          type="button"
          className="ReviewModal__Close"
          onClick={onClose}
          disabled={isDeploying}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <p className="ReviewModal__Intro">
        Deploying creates a permanent on-chain artifact. Token configuration is mostly immutable.
        Make sure the details below are correct.
      </p>
      <ul className="ReviewModal__List">
        {bullets.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <p className="ReviewModal__Owner">
        Owner: <span className="ReviewModal__OwnerId">{signerIdentityId || '—'}</span>
      </p>
      <div className="ReviewModal__Tip">
        Tip: try on testnet first. Once deployed, supply and rule changes are restricted by the
        configured authorization. Peer-to-peer marketplace is not supported by the protocol yet —
        only direct purchase from the issuer (set later).
      </div>
      <div className="ReviewModal__Footer">
        <button
          type="button"
          className="ReviewModal__Btn ReviewModal__BtnGhost"
          onClick={onClose}
          disabled={isDeploying}
        >
          Cancel
        </button>
        <button
          type="button"
          className="ReviewModal__Btn ReviewModal__BtnPrimary"
          onClick={onConfirm}
          disabled={isDeploying}
          aria-busy={isDeploying}
        >
          {isDeploying ? 'Deploying…' : 'Deploy'}
        </button>
      </div>
    </dialog>
  )
}

export default ReviewModal
