import { forwardRef } from 'react'
import type { ReactNode, Ref } from 'react'
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
        <button type={'button'} className={styles.close} onClick={onClose} aria-label={'Close'}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 1L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className={styles.content}>{children}</div>
    </dialog>
  )
})

ModalLayout.displayName = 'ModalLayout'
