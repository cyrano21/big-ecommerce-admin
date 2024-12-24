import React from 'react'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaEuroSign } from 'react-icons/fa'
import { formatter } from '@/lib/utils'
import { CreditCard, Package } from 'lucide-react'
import { getTotalRevenue } from '@/actions/get-total-revenue'
import { getSalesCount } from '@/actions/get-sales-count'
import { getStockCount } from '@/actions/get-stock-count'
import Overview from '@/components/overview'
import { getGraphRevenue } from '@/actions/get-graph-tevenue'

interface DashboardPageProps {
  params: {
    storeId: string
  }
}

const defaultImageUrl = '/images/default_image.png' // Assurez-vous d'avoir une image par défaut dans le dossier public/images

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const totalRevenue = await getTotalRevenue(params.storeId)
  const salesCount = await getSalesCount(params.storeId)
  const stockCount = await getStockCount(params.storeId)
  const graphRevenue = await getGraphRevenue(params.storeId)

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <Heading
          title="Admin Dashboard"
          description="Gérez votre magasin efficacement"
        />
        <nav className="mt-8">
          <ul className="space-y-4">
            <li>
              <a
                href={`/${params.storeId}/overview`}
                className="block p-2 hover:bg-gray-700 rounded"
              >
                Aperçu
              </a>
            </li>
            <li>
              <a
                href={`/${params.storeId}/sales`}
                className="block p-2 hover:bg-gray-700 rounded"
              >
                Ventes
              </a>
            </li>
            <li>
              <a
                href={`/${params.storeId}/products`}
                className="block p-2 hover:bg-gray-700 rounded"
              >
                Produits
              </a>
            </li>
            <li>
              <a
                href={`/${params.storeId}/settings`}
                className="block p-2 hover:bg-gray-700 rounded"
              >
                Paramètres
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100">
        <Heading
          title="Tableau de bord"
          description="Aperçu de votre magasin"
        />
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
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
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Ventes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{salesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Produits En Stock
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockCount}</div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Overview data={graphRevenue} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
