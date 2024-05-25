import React, { createContext, ReactNode, useContext, useState } from 'react'

interface RowSelectionContextProps {
  selectedProducts: any[]
  setSelectedProducts: (products: any[]) => void
}

const RowSelectionContext = createContext<RowSelectionContextProps | undefined>(
  undefined
)

export const RowSelectionProviderProducts = ({
  children,
}: {
  children: ReactNode
}) => {
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])

  return (
    <RowSelectionContext.Provider
      value={{ selectedProducts, setSelectedProducts }}
    >
      {children}
    </RowSelectionContext.Provider>
  )
}

export const useRowSelectionProducts = () => {
  const context = useContext(RowSelectionContext)
  if (!context) {
    throw new Error(
      'useRowSelectionProducts must be used within a RowSelectionProviderProducts'
    )
  }
  return context
}
