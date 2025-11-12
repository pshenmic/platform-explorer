import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'
import { useState } from 'react'
import { NameForm } from './NameScreen'
import { NameScreen } from './InitialScreen'
import { FORM_MODE_ENUM } from './constants'
import { KeywordsScreen } from './KeywordsScreen'
import { InfoContainer } from '@components/ui/containers'

const MODE_PROPS = {
  [FORM_MODE_ENUM.INITIAL]: {
    title: 'Edit Data Contract Information',
    Content: NameScreen
  },
  [FORM_MODE_ENUM.NAME_EDIT]: {
    title: 'Edit Data Contract Name',
    Content: NameForm
  },
  [FORM_MODE_ENUM.INITIAL]: {
    title: 'Edit Data Contract Description and Keywords',
    Content: KeywordsScreen
  }
}

export const DataContractModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState(FORM_MODE_ENUM.INITIAL)

  const handleClose = () => {
    onClose()
    setMode(FORM_MODE_ENUM.INITIAL)
  }

  const { title, Content } = MODE_PROPS[mode]

  return (

    <Modal
      isOpen={isOpen}
      onClose={handleClose}
    >
    <InfoContainer>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Content />
        </ModalBody>
      </ModalContent>
    </InfoContainer>
    </Modal>
  )
}
