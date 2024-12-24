export interface OrderColumn {
  id: string
  phone: string
  address: string
  products: string
  totalPrice: string
  photo: string
  isPaid: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  // Ajoutez d'autres propriétés si nécessaire
}
