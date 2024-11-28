import { createContext, useContext, useState } from 'react'

const BreadcrumbsContext = createContext({})
export const useBreadcrumbs = () => useContext(BreadcrumbsContext)

export const BreadcrumbsProvider = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const contextValue = { breadcrumbs, setBreadcrumbs }

  return (
    <BreadcrumbsContext.Provider value={contextValue}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}
