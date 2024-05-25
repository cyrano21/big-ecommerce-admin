import React, { createContext, ReactNode, useContext, useState } from 'react'

interface RowSelectionContextProps {
  selectedOrders: any[]
  setSelectedOrders: (orders: any[]) => void
}

const RowSelectionContext = createContext<RowSelectionContextProps | undefined>(
  undefined
)

export const RowSelectionProviderOrders = ({
  children,
}: {
  children: ReactNode
}) => {
  const [selectedOrders, setSelectedOrders] = useState<any[]>([])

  return (
    <RowSelectionContext.Provider value={{ selectedOrders, setSelectedOrders }}>
      {children}
    </RowSelectionContext.Provider>
  )
}

export const useRowSelectionOrders = () => {
  const context = useContext(RowSelectionContext)
  if (!context) {
    throw new Error(
      'useRowSelectionOrders must be used within a RowSelectionProviderOrders'
    )
  }
  return context
}
