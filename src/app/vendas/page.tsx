'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Search, TrendingUp, DollarSign } from 'lucide-react'

interface Sale {
  id: string
  quantity: number
  weight: number
  unitPrice: number
  totalPrice: number
  profit: number
  profitPercentage: number
  saleDate: string
  channel: string
  notes?: string
  product: {
    name: string
    averageWeight: number
  }
}

export default function VendasPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    weight: '',
    unitPrice: '',
    channel: 'varejo',
    notes: ''
  })

  useEffect(() => {
    fetchSales()
    fetchProducts()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales')
      if (response.ok) {
        const data = await response.json()
        setSales(data)
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          weight: parseFloat(formData.weight),
          unitPrice: parseFloat(formData.unitPrice)
        })
      })

      if (response.ok) {
        await fetchSales()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao registrar venda')
      }
    } catch (error) {
      console.error('Erro ao registrar venda:', error)
      alert('Erro ao registrar venda')
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      weight: '',
      unitPrice: '',
      channel: 'varejo',
      notes: ''
    })
    setShowForm(false)
  }

  const filteredSales = sales.filter(sale =>
    sale.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.channel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0)
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando vendas...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Vendas</h1>
            <p className="text-text-secondary">Registre e acompanhe suas vendas</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Venda
          </button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total de Vendas</p>
                <p className="text-2xl font-bold text-text">
                  R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <p className="text-text-secondary text-sm">Lucro Total</p>
                <p className="text-2xl font-bold text-text">
                  R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-blue-900/20 rounded-full">
                <TrendingUp className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Margem Média</p>
                <p className="text-2xl font-bold text-text">
                  {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-900/20 rounded-full">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Pesquisar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        <div className="card">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-medium text-text mb-2">Nenhuma venda encontrada</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece registrando sua primeira venda'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Registrar Venda
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Produto</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantidade</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Peso</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Preço Unit.</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Total</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Lucro</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Canal</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border hover:bg-hover">
                      <td className="py-3 px-4 text-text font-medium">{sale.product.name}</td>
                      <td className="py-3 px-4 text-text">{sale.quantity} un</td>
                      <td className="py-3 px-4 text-text">{sale.weight}g</td>
                      <td className="py-3 px-4 text-text">R$ {sale.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-text font-medium">R$ {sale.totalPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-green-400 font-medium">R$ {sale.profit.toFixed(2)}</span>
                          <span className="text-text-secondary text-sm">
                            ({sale.profitPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary capitalize">{sale.channel}</td>
                      <td className="py-3 px-4 text-text-secondary">
                        {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">Nova Venda</h2>
                <button
                  onClick={resetForm}
                  className="text-text-secondary hover:text-text"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Produto *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.averageWeight}g
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="input-field w-full"
                      placeholder="Ex: 5 unidades"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Peso Vendido (g) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="input-field w-full"
                      placeholder="Peso total vendido"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Preço Unitário *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      className="input-field w-full"
                      placeholder="Preço por unidade"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Canal de Venda *
                    </label>
                    <select
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      className="input-field w-full"
                      required
                    >
                      <option value="varejo">Varejo</option>
                      <option value="atacado">Atacado</option>
                      <option value="delivery">Delivery</option>
                      <option value="eventos">Eventos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field w-full h-20"
                    rows={3}
                    placeholder="Anotações sobre a venda..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Registrar Venda
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
