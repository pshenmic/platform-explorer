import { Button, Tooltip } from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { copyToClipboard } from '../../../util'

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
      className={`CopyButton ${className}`}>
      <Tooltip
        label={messageState.text}
        aria-label={'A tooltip'}
        placement={'top'}
        hasArrow
        bg={'gray.700'}
        color={'white'}
        isDisabled={!messageState.active}
        isOpen={messageState.active}
      >
        <CopyIcon w={4} h={4} color={'gray.250'}/>
      </Tooltip>
    </Button>
  )
}

export default CopyButton
