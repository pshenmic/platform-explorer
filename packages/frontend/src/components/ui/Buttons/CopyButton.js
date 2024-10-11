'use client'

import { Button } from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { copyToClipboard } from '../../../util'
import { Tooltip } from '../../ui/Tooltips'

const copyMessageSuccess = 'Copied'
const copyMessageError = 'Copy Failed'

function CopyButton ({ text, className }) {
  const [messageState, setMessageState] = useState({
    active: false,
    text: copyMessageSuccess
  })

  const showMessage = (result) => {
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
    <Button
      bg={'transparent'}
      size={'sm'}
      onClick={event => {
        event.stopPropagation()
        event.preventDefault()
        copyToClipboard(text, showMessage)
      }}
      px={2}
      className={`CopyButton ${className}`}
    >
      <Tooltip
        label={messageState.text}
        aria-label={'A tooltip'}
        placement={'top'}
        bg={'gray.700'}
        color={'white'}
        isDisabled={!messageState.active}
        isOpen={messageState.active}
        p={3}
      >
        <CopyIcon w={4} h={4} color={'gray.250'}/>
      </Tooltip>
    </Button>
  )
}

export default CopyButton
