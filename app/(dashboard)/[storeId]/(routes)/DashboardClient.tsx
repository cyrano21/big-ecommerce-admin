'use client'

import React from 'react'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaEuroSign } from 'react-icons/fa'
import { formatter } from '@/lib/utils'
import { CreditCard, Package } from 'lucide-react'
import Overview from '@/components/overview'
import axios from 'axios'
import toast from 'react-hot-toast'

interface DashboardClientProps {
  totalRevenue: number
  salesCount: number
  stockCount: number
  graphRevenue: any // Remplacez par le type approprié
  productsInStock: { name: string; stock: number; id: string }[] // Ajouté
}

const DashboardClient: React.FC<DashboardClientProps> = ({
  totalRevenue,
  salesCount,
  stockCount,
  graphRevenue,
  productsInStock, // Ajouté
}) => {
  const handleIncreaseStock = async (productId: string) => {
    try {
      await axios.post(`/api/products/${productId}/increase-stock`)
      toast.success('Stock augmenté avec succès')
    } catch (error) {
      toast.error("Erreur lors de l'augmentation du stock")
    }
  }

  const handleDecreaseStock = async (productId: string) => {
    try {
      await axios.post(`/api/products/${productId}/decrease-stock`)
      toast.success('Stock diminué avec succès')
    } catch (error) {
      toast.error('Erreur lors de la diminution du stock')
    }
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Tableau de bord"
          description="Aperçu de votre magasin"
        />
        <Separator />
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2">
              <CardTitle className="text-sm font-medium">
                Revenu total
              </CardTitle>
              <FaEuroSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatter.format(totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2">
              <CardTitle className="text-sm font-medium">Ventes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{salesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2">
              <CardTitle className="text-sm font-medium">
                Produits En Stock
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ul>
                {productsInStock.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {product.name}: {product.stock}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleIncreaseStock(product.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Augmenter
                      </button>
                      <button
                        onClick={() => handleDecreaseStock(product.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Diminuer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-4">
          <CardHeader className="">
            <CardTitle className="">Aperçu</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={graphRevenue} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardClient
