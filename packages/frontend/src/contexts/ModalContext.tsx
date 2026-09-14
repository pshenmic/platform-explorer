'use client'

import { createContext, useContext, useRef } from 'react'
import type { MutableRefObject, ReactNode } from 'react'

interface ModalContextValue {
  modalRef: MutableRefObject<HTMLDialogElement | null>
}

const ModalContext = createContext<ModalContextValue>({
  modalRef: { current: null }
})

export const useModalRef = (): ModalContextValue => useContext(ModalContext)

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const modalRef = useRef<HTMLDialogElement | null>(null)

  return <ModalContext.Provider value={{ modalRef }}>{children}</ModalContext.Provider>
}
