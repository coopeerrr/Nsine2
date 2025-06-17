import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  Calendar,
  BarChart3
} from 'lucide-react'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueGrowth: number
  ordersGrowth: number
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>
  recentOrders: Array<{
    date: string
    count: number
    revenue: number
  }>
  ordersByStatus: Array<{
    status: string
    count: number
  }>
  lowStockProducts: Array<{
    name: string
    stock: number
  }>
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    topProducts: [],
    recentOrders: [],
    ordersByStatus: [],
    lowStockProducts: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        case '90d':
          startDate.setDate(now.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      // Fetch orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())

      // Fetch products data
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)

      // Fetch all orders for customer count
      const { data: allOrders } = await supabase
        .from('orders')
        .select('customer_email')

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
      const totalOrders = orders?.length || 0
      const totalProducts = products?.length || 0
      const uniqueCustomers = new Set(allOrders?.map(order => order.customer_email)).size

      // Calculate growth (mock data for demo)
      const revenueGrowth = Math.random() * 20 - 10 // -10% to +10%
      const ordersGrowth = Math.random() * 30 - 15 // -15% to +15%

      // Top products (mock data based on orders)
      const topProducts = [
        { name: 'Digital X-Ray System', sales: 12, revenue: 540000 },
        { name: 'Ultrasound Scanner Pro', sales: 18, revenue: 504000 },
        { name: 'Patient Monitor Elite', sales: 25, revenue: 300000 },
        { name: 'Surgical Microscope', sales: 8, revenue: 520000 },
        { name: 'Defibrillator AED', sales: 35, revenue: 122500 }
      ]

      // Recent orders by day
      const recentOrders = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayOrders = orders?.filter(order => 
          new Date(order.created_at).toDateString() === date.toDateString()
        ) || []
        
        recentOrders.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
        })
      }

      // Orders by status
      const statusCounts = orders?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }))

      // Low stock products
      const lowStockProducts = products
        ?.filter(product => product.stock <= 5)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5)
        .map(product => ({
          name: product.name,
          stock: product.stock
        })) || []

      setData({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers: uniqueCustomers,
        revenueGrowth,
        ordersGrowth,
        topProducts,
        recentOrders,
        ordersByStatus,
        lowStockProducts
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard: React.FC<{
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    growth?: number
  }> = ({ title, value, icon, color, growth }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {growth !== undefined && (
            <div className={`flex items-center mt-2 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-sm font-medium">
                {Math.abs(growth).toFixed(1)}% vs last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your business performance and insights</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
          growth={data.revenueGrowth}
        />
        
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
          growth={data.ordersGrowth}
        />
        
        <StatCard
          title="Active Products"
          value={data.totalProducts}
          icon={<Package className="h-6 w-6 text-purple-600" />}
          color="bg-purple-100"
        />
        
        <StatCard
          title="Total Customers"
          value={data.totalCustomers}
          icon={<Users className="h-6 w-6 text-orange-600" />}
          color="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Orders Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Orders</h2>
          <div className="space-y-4">
            {data.recentOrders.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">{day.count} orders</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (day.count / Math.max(...data.recentOrders.map(d => d.count))) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">${day.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Products</h2>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} sales</p>
                </div>
                <span className="font-semibold text-gray-900">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Orders by Status</h2>
          <div className="space-y-4">
            {data.ordersByStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{status.status}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(status.count / data.totalOrders) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                    {status.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Low Stock Alert</h2>
          {data.lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {data.lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>All products are well stocked!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}