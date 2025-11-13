import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useModal } from 'src/contexts/ModalContext'

import styles from './Modal.module.scss'

const ModalLayout = ({ children }) => <>{children}</>

export const Modal = ({ children, isOpen, ...props }) => {
  const { modalRef } = useModal()

  useEffect(() => {
    if (!modalRef.current) {
      return
    }

    if (isOpen) {
      modalRef.current.showModal()

      return
    }

    modalRef.current.close()
  }, [isOpen, modalRef])

  if (!modalRef.current) {
    return null
  }

  return createPortal(
    <ModalLayout {...props}>{children}</ModalLayout>,
    modalRef.current
  )
}
