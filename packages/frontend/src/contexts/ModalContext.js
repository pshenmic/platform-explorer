'use client'

import { createContext, useContext, useRef } from 'react'

const ModalContext = createContext({})
export const useModalRef = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
  const modalRef = useRef(null)

  return (
    <ModalContext.Provider value={{ modalRef }}>
      {children}
    </ModalContext.Provider>
  )
}
