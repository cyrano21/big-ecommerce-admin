import { getTotalRevenue } from '@/actions/get-total-revenue'
import { getSalesCount } from '@/actions/get-sales-count'
import { getStockCount } from '@/actions/get-stock-count'
import { getProductsInStock } from '@/actions/get-products-in-stock'
import DashboardClient from './DashboardClient'
import { getGraphRevenue } from '../../../../actions/get-graph-tevenue'

interface DashboardServerProps {
  params: {
    storeId: string
  }
}

const DashboardServer = async ({ params }: DashboardServerProps) => {
  const totalRevenue = await getTotalRevenue(params.storeId)
  const salesCount = await getSalesCount(params.storeId)
  const stockCount = await getStockCount(params.storeId)
  const graphRevenue = await getGraphRevenue(params.storeId)
  const productsInStock = await getProductsInStock(params.storeId) // Ajouté

  return (
    <DashboardClient
      totalRevenue={totalRevenue}
      salesCount={salesCount}
      stockCount={stockCount}
      graphRevenue={graphRevenue}
      productsInStock={productsInStock} // Ajouté
    />
  )
}

export default DashboardServer
