import { createContext, useContext, useRef } from 'react'

const ModalContext = createContext({})
export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
  const modalRef = useRef(null)

  return (
    <ModalContext.Provider value={{ modalRef }}>
      {children}
      <div ref={modalRef}></div>
    </ModalContext.Provider>
  )
}
