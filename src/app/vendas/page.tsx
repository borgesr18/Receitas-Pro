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
    channel: 'varejo',
    unitPrice: '',
    totalPrice: '',
    costPrice: '',
    profit: '',
    notes: ''
  })

  const [editingId, setEditingId] = useState<string | null>(null)

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

  const calculatePricing = (productId: string, weight: string, channel: string) => {
    const product = products.find(p => p.id === productId)
    if (!product || !weight) return

    const weightNum = parseFloat(weight)
    const productPrice = product.prices?.find((p: any) => p.channel === channel)
    
    if (productPrice) {
      const unitPrice = productPrice.price
      const totalPrice = (unitPrice / product.averageWeight) * weightNum
      const costPrice = product.costPerGram ? product.costPerGram * weightNum : 0
      const profit = totalPrice - costPrice

      setFormData(prev => ({
        ...prev,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        costPrice: costPrice.toFixed(2),
        profit: profit.toFixed(2)
      }))
    }
  }

  const handleProductChange = (productId: string) => {
    setFormData(prev => ({ ...prev, productId }))
    if (formData.weight && formData.channel) {
      calculatePricing(productId, formData.weight, formData.channel)
    }
  }

  const handleWeightChange = (weight: string) => {
    setFormData(prev => ({ ...prev, weight }))
    if (formData.productId && formData.channel) {
      calculatePricing(formData.productId, weight, formData.channel)
    }
  }

  const handleChannelChange = (channel: string) => {
    setFormData(prev => ({ ...prev, channel }))
    if (formData.productId && formData.weight) {
      calculatePricing(formData.productId, formData.weight, channel)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productId || !formData.weight || !formData.totalPrice) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const saleData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 1,
        weight: parseFloat(formData.weight),
        unitPrice: parseFloat(formData.unitPrice),
        totalPrice: parseFloat(formData.totalPrice),
        costPrice: parseFloat(formData.costPrice) || 0,
        profit: parseFloat(formData.profit) || 0
      }

      const url = editingId ? `/api/sales/${editingId}` : '/api/sales'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      })

      if (response.ok) {
        const sale = await response.json()
        
        await fetch('/api/stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: formData.productId,
            itemType: 'PRODUCT',
            type: 'OUT',
            quantity: parseFloat(formData.weight),
            reason: `Venda - ${formData.channel}`,
            batchNumber: `SALE-${Date.now()}`
          })
        })

        await fetchSales()
        resetForm()
        alert('Venda registrada com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar venda')
      }
    } catch (error) {
      console.error('Erro ao salvar venda:', error)
      alert('Erro ao salvar venda')
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      weight: '',
      channel: 'varejo',
      unitPrice: '',
      totalPrice: '',
      costPrice: '',
      profit: '',
      notes: ''
    })
    setEditingId(null)
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
                    onChange={(e) => handleProductChange(e.target.value)}
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
                      onChange={(e) => handleWeightChange(e.target.value)}
                      className="input-field w-full"
                      placeholder="Peso total vendido"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Preço Total *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalPrice}
                      onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                      className="input-field w-full"
                      placeholder="Valor total da venda"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Lucro Calculado
                    </label>
                    <input
                      type="text"
                      value={formData.profit ? `R$ ${formData.profit}` : ''}
                      className="input-field w-full bg-card-background"
                      placeholder="Calculado automaticamente"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Canal de Venda *
                    </label>
                    <select
                      value={formData.channel}
                      onChange={(e) => handleChannelChange(e.target.value)}
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
