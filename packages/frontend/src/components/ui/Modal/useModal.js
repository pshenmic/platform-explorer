import { useSyncExternalStore } from 'react'
import { useModalRef } from 'src/contexts/ModalContext'

export const useModal = () => {
  const { modalRef } = useModalRef()
  const handleClose = () => modalRef.current?.close()
  const handleOpen = () => modalRef.current?.showModal()

  const isOpen = useSyncExternalStore(
    (onStoreChange) => {
      const observer = new MutationObserver(onStoreChange)
      if (modalRef.current) {
        observer.observe(modalRef.current, { attributes: true, attributeFilter: ['open'] })
      }
      return () => observer.disconnect()
    },
    () => modalRef.current?.open ?? false
  )

  return {
    isOpen,
    handleClose,
    handleOpen
  }
}
