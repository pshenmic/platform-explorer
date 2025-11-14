import { useSyncExternalStore } from 'react'
import { useModalRef } from 'src/contexts/ModalContext'

export const useModal = () => {
  const { modalRef } = useModalRef()
  const handleClose = () => modalRef.current?.close()
  const handleOpen = () => modalRef.current?.showModal()

  const isOpen = useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange()
      modalRef.current?.addEventListener('close', handler)
      return () => modalRef.current?.removeEventListener('close', handler)
    },
    () => modalRef.current?.open ?? false
  )

  return {
    isOpen,
    handleClose,
    handleOpen
  }
}
