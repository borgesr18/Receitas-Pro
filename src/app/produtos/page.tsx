'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Search, Edit, Trash2, ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  averageWeight: number
  salesChannels: string[]
  prices: {
    id: string
    channel: string
    price: number
  }[]
  category: {
    name: string
  }
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    averageWeight: '',
    categoryId: '',
    salesChannels: [] as string[],
    prices: [{ channel: 'varejo', price: '' }]
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          averageWeight: parseFloat(formData.averageWeight),
          prices: formData.prices.map(p => ({
            channel: p.channel,
            price: parseFloat(p.price)
          }))
        })
      })

      if (response.ok) {
        await fetchProducts()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar produto')
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto')
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      averageWeight: product.averageWeight.toString(),
      categoryId: '',
      salesChannels: product.salesChannels,
      prices: product.prices.map(p => ({ channel: p.channel, price: p.price.toString() }))
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchProducts()
      } else {
        alert('Erro ao excluir produto')
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto')
    }
  }

  const addPriceRow = () => {
    setFormData({
      ...formData,
      prices: [...formData.prices, { channel: 'atacado', price: '' }]
    })
  }

  const removePriceRow = (index: number) => {
    setFormData({
      ...formData,
      prices: formData.prices.filter((_, i) => i !== index)
    })
  }

  const updatePrice = (index: number, field: string, value: string) => {
    const newPrices = [...formData.prices]
    newPrices[index] = { ...newPrices[index], [field]: value }
    setFormData({ ...formData, prices: newPrices })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      averageWeight: '',
      categoryId: '',
      salesChannels: [],
      prices: [{ channel: 'varejo', price: '' }]
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando produtos...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Produtos</h1>
            <p className="text-text-secondary">Gerencie seus produtos finais e preços de venda</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>

        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        <div className="card">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-medium text-text mb-2">Nenhum produto encontrado</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece adicionando seu primeiro produto'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Adicionar Produto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Nome</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Categoria</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Peso Médio</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Canais</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Preços</th>
                    <th className="text-right py-3 px-4 text-text-secondary font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-hover">
                      <td className="py-3 px-4 text-text font-medium">{product.name}</td>
                      <td className="py-3 px-4 text-text-secondary">{product.category.name}</td>
                      <td className="py-3 px-4 text-text">{product.averageWeight}g</td>
                      <td className="py-3 px-4 text-text-secondary">
                        {product.salesChannels.join(', ')}
                      </td>
                      <td className="py-3 px-4 text-text">
                        {product.prices.map(p => (
                          <div key={p.id} className="text-sm">
                            {p.channel}: R$ {p.price.toFixed(2)}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-text-secondary hover:text-accent hover:bg-hover rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-text-secondary hover:text-red-400 hover:bg-hover rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
                <h2 className="text-xl font-semibold text-text">
                  {editingId ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-text-secondary hover:text-text"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Peso Médio Final (g) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.averageWeight}
                      onChange={(e) => setFormData({ ...formData, averageWeight: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Tabela de Preços por Canal
                  </label>
                  {formData.prices.map((price, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        value={price.channel}
                        onChange={(e) => updatePrice(index, 'channel', e.target.value)}
                        className="input-field flex-1"
                      >
                        <option value="varejo">Varejo</option>
                        <option value="atacado">Atacado</option>
                        <option value="delivery">Delivery</option>
                        <option value="eventos">Eventos</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço"
                        value={price.price}
                        onChange={(e) => updatePrice(index, 'price', e.target.value)}
                        className="input-field flex-1"
                        required
                      />
                      {formData.prices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePriceRow(index)}
                          className="px-3 py-2 text-red-400 hover:bg-hover rounded"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPriceRow}
                    className="text-accent hover:text-text text-sm"
                  >
                    + Adicionar Canal de Venda
                  </button>
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
                    {editingId ? 'Atualizar' : 'Salvar'}
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
