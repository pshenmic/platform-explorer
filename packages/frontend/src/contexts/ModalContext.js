import { createContext, useContext, useRef } from 'react'

const ModalContext = createContext({})
export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
  const modalRef = useRef(null)

  return (
    <ModalContext.Provider value={{ modalRef }}>
      {children}
      <dialog
        role='dialog'
        aria-labelledby='modal-title'
        aria-modal='true'
        style={{ 'background-color': 'transparent' }}
        ref={modalRef}
      ></dialog>
    </ModalContext.Provider>
  )
}
