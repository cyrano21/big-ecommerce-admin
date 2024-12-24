import React, { createContext, ReactNode, useContext, useState } from 'react'

interface RowSelectionContextProps {
  selectedItems: any[]
  setSelectedItems: (items: any[]) => void
}

const RowSelectionContext = createContext<RowSelectionContextProps | undefined>(
  undefined
)

export const RowSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedItems, setSelectedItems] = useState<any[]>([])

  return (
    <RowSelectionContext.Provider value={{ selectedItems, setSelectedItems }}>
      {children}
    </RowSelectionContext.Provider>
  )
}

export const useRowSelection = () => {
  const context = useContext(RowSelectionContext)
  if (!context) {
    throw new Error(
      'useRowSelection must be used within a RowSelectionProvider'
    )
  }
  return context
}
