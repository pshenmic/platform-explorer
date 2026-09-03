import { forwardRef } from 'react'
import type { ReactNode, Ref } from 'react'
import { CloseButton } from '@chakra-ui/react'
import { cva } from 'class-variance-authority'

import styles from './Modal.module.css'

const modalStyles = cva([styles.dialog, 'InfoBlock', 'InfoBlock--Gradient'])

interface ModalLayoutProps {
  children?: ReactNode
  title?: ReactNode
  onClose?: () => void
}

export const ModalLayout = forwardRef(function ModalLayout(
  { children, title, onClose }: ModalLayoutProps,
  ref: Ref<HTMLDialogElement>
) {
  return (
    <dialog aria-labelledby="modal-title" aria-modal="true" className={modalStyles()} ref={ref}>
      <div className={styles.header}>
        <h2 id="modal-title" className={styles.title}>
          {title}
        </h2>
        <CloseButton onClick={onClose} />
      </div>
      <div className={styles.content}>{children}</div>
    </dialog>
  )
})

ModalLayout.displayName = 'ModalLayout'
