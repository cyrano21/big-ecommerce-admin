import axios from 'axios'

export const increaseStock = async (productId: string, amount: number) => {
  const response = await axios.post(
    `/api/products/${productId}/increase-stock`,
    { amount }
  )
  return response.data
}

export const decreaseStock = async (productId: string, amount: number) => {
  const response = await axios.post(
    `/api/products/${productId}/decrease-stock`,
    { amount }
  )
  return response.data
}
