'use client'

import { useState } from 'react'
import { copyToClipboard } from '../../../util'
import { Tooltip } from '../../ui/Tooltips'
import './CopyButton.css'

const copyMessageSuccess = 'Copied'
const copyMessageError = 'Copy Failed'

interface CopyButtonProps {
  text?: string
  className?: string
}

function CopyIcon() {
  return (
    <svg
      className={'CopyButton__Icon'}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
  )
}

function CopyButton({ text, className }: CopyButtonProps) {
  const [messageState, setMessageState] = useState({
    active: false,
    text: copyMessageSuccess
  })

  const showMessage = (result: { status: boolean }) => {
    setMessageState(messageState => ({
      ...messageState,
      text: result.status ? copyMessageSuccess : copyMessageError,
      active: true
    }))

    setTimeout(() => {
      setMessageState(messageState => ({
        ...messageState,
        active: false
      }))
    }, 2000)
  }

  return (
    <button
      type={'button'}
      onClick={event => {
        event.stopPropagation()
        event.preventDefault()
        copyToClipboard(text, showMessage)
      }}
      className={`CopyButton ${className || ''}`}
    >
      <Tooltip
        className={''}
        label={messageState.text}
        aria-label={'A tooltip'}
        placement={'top'}
        isDisabled={!messageState.active}
        isOpen={messageState.active}
      >
        <CopyIcon />
      </Tooltip>
    </button>
  )
}

export default CopyButton
