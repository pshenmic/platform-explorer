import { useState } from 'react'
import { FORM_MODE_ENUM } from './constants'
import { NameForm } from './NameScreen'
import { InitialScreen } from './InitialScreen'
import { KeywordsScreen } from './KeywordsScreen'
import { Modal } from '@components/ui/Modal'

const MODE_PROPS = {
  [FORM_MODE_ENUM.INITIAL]: {
    title: 'Edit Data Contract Information',
    Content: InitialScreen
  },
  [FORM_MODE_ENUM.NAME_EDIT]: {
    title: 'Edit Data Contract Name',
    Content: NameForm
  },
  [FORM_MODE_ENUM.KEYWORDS_EDIT]: {
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
    <Modal isOpen={isOpen}>
      <div className='InfoBlock InfoBlock--Gradient'>
        <Content />
      </div>
    </Modal>
  )
}
