import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { FORM_MODE_ENUM } from './constants'
import type { FormMode } from './constants'
import { NameScreen } from './NameScreen'
import { InitialScreen } from './InitialScreen'
import { KeywordsScreen } from './KeywordsScreen'
import { Modal } from '@components/ui/Modal'

interface DataContractModalContentProps {
  setMode: (mode: FormMode) => void
  defaultName?: string | null
  defaultDescription?: string | null
  defaultKeywords?: string[] | null
  onChangeName?: (payload: { name: string }) => void
  onChangeDescription?: (payload: { description: string; keywords: string[] }) => void
}

interface ModeProps {
  title: string
  Content: ComponentType<DataContractModalContentProps>
}

const MODE_PROPS: Record<FormMode, ModeProps> = {
  [FORM_MODE_ENUM.INITIAL]: {
    title: 'Edit Data Contract Information',
    Content: InitialScreen
  },
  [FORM_MODE_ENUM.NAME_EDIT]: {
    title: 'Edit Data Contract Name',
    Content: NameScreen as ComponentType<DataContractModalContentProps>
  },
  [FORM_MODE_ENUM.KEYWORDS_EDIT]: {
    title: 'Edit Data Contract Description and Keywords',
    Content: KeywordsScreen as ComponentType<DataContractModalContentProps>
  }
}

interface DataContractModalProps extends Omit<DataContractModalContentProps, 'setMode'> {
  isOpen: boolean
}

export const DataContractModal = ({ isOpen, ...props }: DataContractModalProps) => {
  const [mode, setMode] = useState<FormMode>(FORM_MODE_ENUM.INITIAL)
  const { title, Content } = MODE_PROPS[mode]

  useEffect(() => {
    setMode(FORM_MODE_ENUM.INITIAL)
  }, [isOpen])

  return (
    <Modal title={title}>
      <Content setMode={setMode} {...props} />
    </Modal>
  )
}
