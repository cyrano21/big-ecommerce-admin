'use client'

import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface StockManagerProps {
  productId: string
  initialStock: number
}

const StockManager: React.FC<StockManagerProps> = ({
  productId,
  initialStock,
}) => {
  const [stock, setStock] = useState(initialStock)

  const handleIncreaseStock = async () => {
    try {
      await axios.post(`/api/products/${productId}/increase-stock`)
      setStock(stock + 1)
      toast.success('Stock increased successfully')
    } catch (error) {
      toast.error('Failed to increase stock')
      console.error(error)
    }
  }

  const handleDecreaseStock = async () => {
    try {
      await axios.post(`/api/products/${productId}/decrease-stock`)
      setStock(stock - 1)
      toast.success('Stock decreased successfully')
    } catch (error) {
      toast.error('Failed to decrease stock')
      console.error(error)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-lg">Stock: {stock}</span>
      <button
        onClick={handleIncreaseStock}
        className="bg-green-500 text-white px-2 py-1 rounded"
      >
        Augmenter
      </button>
      <button
        onClick={handleDecreaseStock}
        className="bg-red-500 text-white px-2 py-1 rounded"
      >
        Diminuer
      </button>
    </div>
  )
}

export default StockManager
