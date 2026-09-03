import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ModalLayout } from './ModalLayout'
import { useModalRef } from 'src/contexts/ModalContext'
import { useModal } from './useModal'

interface ModalProps {
  children?: ReactNode
  title?: ReactNode
}

export const Modal = ({ children, ...props }: ModalProps) => {
  const { modalRef } = useModalRef()
  const { handleClose } = useModal()

  return createPortal(
    <ModalLayout ref={modalRef} onClose={handleClose} {...props}>
      {children}
    </ModalLayout>,
    document.body
  )
}
