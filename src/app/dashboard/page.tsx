import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign,
  BarChart3
} from 'lucide-react'

const dashboardData = {
  totalSales: 15420.50,
  totalCosts: 8750.30,
  stockItems: 45,
  expiringItems: 3,
  topProducts: [
    { name: 'Pão Francês', sales: 1250 },
    { name: 'Bolo de Chocolate', sales: 890 },
    { name: 'Croissant', sales: 650 },
    { name: 'Pão de Açúcar', sales: 420 },
    { name: 'Torta de Frango', sales: 380 }
  ]
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-text-secondary">Visão geral do seu negócio</p>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Vendas do Mês</p>
                <p className="text-2xl font-bold text-text">
                  R$ {dashboardData.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-900/20 rounded-full">
                <DollarSign className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Custos do Mês</p>
                <p className="text-2xl font-bold text-text">
                  R$ {dashboardData.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-red-900/20 rounded-full">
                <TrendingUp className="text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Itens em Estoque</p>
                <p className="text-2xl font-bold text-text">{dashboardData.stockItems}</p>
              </div>
              <div className="p-3 bg-blue-900/20 rounded-full">
                <Package className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Vencendo</p>
                <p className="text-2xl font-bold text-text">{dashboardData.expiringItems}</p>
              </div>
              <div className="p-3 bg-yellow-900/20 rounded-full">
                <AlertTriangle className="text-yellow-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico dos produtos mais vendidos */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-accent" size={24} />
            <h2 className="text-xl font-semibold text-text">Produtos Mais Vendidos</h2>
          </div>
          
          <div className="space-y-4">
            {dashboardData.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary text-sm w-6">#{index + 1}</span>
                  <span className="text-text">{product.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-border rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full" 
                      style={{ width: `${(product.sales / dashboardData.topProducts[0].sales) * 100}%` }}
                    />
                  </div>
                  <span className="text-text-secondary text-sm w-16 text-right">
                    {product.sales} un
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-4">Alertas</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-900/10 border border-yellow-900/20 rounded-md">
              <AlertTriangle className="text-yellow-400" size={20} />
              <div>
                <p className="text-text font-medium">3 insumos com validade próxima</p>
                <p className="text-text-secondary text-sm">Verifique o estoque para evitar perdas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
