import { forwardRef } from 'react'
import { CloseButton } from '@chakra-ui/react'
import { cva } from 'class-variance-authority'

import styles from './Modal.module.scss'

const modalStyles = cva([styles.dialog, 'InfoBlock', 'InfoBlock--Gradient'])

export const ModalLayout = forwardRef(({ children, title, onClose }, ref) => (
  <dialog
    role='dialog'
    aria-labelledby='modal-title'
    aria-modal='true'
    className={modalStyles()}
    ref={ref}
  >
    <div className={styles.header}>
        <h2 id="modal-title" className={styles.title} >{title}</h2>
        <CloseButton onClick={onClose} />
    </div>
    <div className={styles.content}>
        {children}
    </div>
  </dialog>
))

ModalLayout.displayName = 'ModalLayout'
