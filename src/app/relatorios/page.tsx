'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { BarChart3, TrendingUp, FileText, Download, Calendar } from 'lucide-react'

interface ReportData {
  totalSales: number
  totalCosts: number
  totalProfit: number
  profitMargin: number
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>
  monthlySales: Array<{
    month: string
    sales: number
    costs: number
    profit: number
  }>
  ingredientConsumption: Array<{
    name: string
    consumed: number
    cost: number
  }>
}

export default function RelatoriosPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30') // dias
  const [reportType, setReportType] = useState('vendas')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod, reportType])

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports?period=${selectedPeriod}&type=${reportType}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}&period=${selectedPeriod}&type=${reportType}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-${reportType}-${selectedPeriod}dias.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      alert('Erro ao exportar relatório')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando relatórios...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Relatórios</h1>
            <p className="text-text-secondary">Análise detalhada do seu negócio</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportReport('excel')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="btn-primary flex items-center gap-2"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Último ano</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input-field"
              >
                <option value="vendas">Vendas</option>
                <option value="custos">Custos</option>
                <option value="producao">Produção</option>
                <option value="insumos">Consumo de Insumos</option>
              </select>
            </div>
          </div>
        </div>

        {reportData && (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Total de Vendas</p>
                    <p className="text-2xl font-bold text-text">
                      R$ {reportData.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 bg-green-900/20 rounded-full">
                    <TrendingUp className="text-green-400" size={24} />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Total de Custos</p>
                    <p className="text-2xl font-bold text-text">
                      R$ {reportData.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    <p className="text-text-secondary text-sm">Lucro Total</p>
                    <p className="text-2xl font-bold text-text">
                      R$ {reportData.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-900/20 rounded-full">
                    <BarChart3 className="text-blue-400" size={24} />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Margem de Lucro</p>
                    <p className="text-2xl font-bold text-text">
                      {reportData.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-900/20 rounded-full">
                    <TrendingUp className="text-purple-400" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de vendas mensais */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-accent" size={24} />
                <h2 className="text-xl font-semibold text-text">Evolução Mensal</h2>
              </div>
              
              <div className="space-y-4">
                {reportData.monthlySales.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary text-sm w-20">{month.month}</span>
                    </div>
                    <div className="flex items-center gap-8 flex-1 max-w-md">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text">Vendas</span>
                          <span className="text-text">R$ {month.sales.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full" 
                            style={{ width: `${(month.sales / Math.max(...reportData.monthlySales.map(m => m.sales))) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text">Lucro</span>
                          <span className="text-text">R$ {month.profit.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full" 
                            style={{ width: `${(month.profit / Math.max(...reportData.monthlySales.map(m => m.profit))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Produtos mais vendidos */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-accent" size={24} />
                <h2 className="text-xl font-semibold text-text">Produtos Mais Vendidos</h2>
              </div>
              
              <div className="space-y-4">
                {reportData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary text-sm w-6">#{index + 1}</span>
                      <span className="text-text">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-text font-medium">R$ {product.revenue.toFixed(2)}</div>
                        <div className="text-text-secondary text-sm">{product.sales} vendas</div>
                      </div>
                      <div className="w-32 bg-border rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full" 
                          style={{ width: `${(product.revenue / reportData.topProducts[0].revenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consumo de insumos */}
            {reportType === 'insumos' && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="text-accent" size={24} />
                  <h2 className="text-xl font-semibold text-text">Consumo de Insumos</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Insumo</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantidade Consumida</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Custo Total</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">% do Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.ingredientConsumption.map((ingredient) => (
                        <tr key={ingredient.name} className="border-b border-border hover:bg-hover">
                          <td className="py-3 px-4 text-text font-medium">{ingredient.name}</td>
                          <td className="py-3 px-4 text-text">{ingredient.consumed}g</td>
                          <td className="py-3 px-4 text-text">R$ {ingredient.cost.toFixed(2)}</td>
                          <td className="py-3 px-4 text-text-secondary">
                            {((ingredient.cost / reportData.totalCosts) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
