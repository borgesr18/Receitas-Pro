'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react'

interface StockItem {
  id: string
  name: string
  currentStock: number
  unit: {
    name: string
  }
  category?: {
    name: string
  }
  expiryDate?: string
  isExpiring?: boolean
  stockMovements: Array<{
    type: string
    quantity: number
    reason: string
    createdAt: string
    batchNumber?: string
  }>
}

export default function EstoquePage() {
  const [ingredients, setIngredients] = useState<StockItem[]>([])
  const [products, setProducts] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ingredients' | 'products'>('ingredients')
  const [searchTerm, setSearchTerm] = useState('')
  const [showExpiring, setShowExpiring] = useState(false)

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      const [ingredientsRes, productsRes] = await Promise.all([
        fetch('/api/stock?type=ingredients'),
        fetch('/api/stock?type=products')
      ])

      if (ingredientsRes.ok) {
        const ingredientsData = await ingredientsRes.json()
        setIngredients(ingredientsData)
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Erro ao carregar estoque:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockMovement = async (itemId: string, itemType: string, type: 'IN' | 'OUT', quantity: number, reason: string) => {
    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType,
          type,
          quantity,
          reason,
          batchNumber: `${type}-${Date.now()}`
        })
      })

      if (response.ok) {
        await fetchStock()
        alert('Movimentação registrada com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao registrar movimentação')
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      alert('Erro ao registrar movimentação')
    }
  }

  const filteredItems = (activeTab === 'ingredients' ? ingredients : products).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesExpiring = !showExpiring || item.isExpiring
    return matchesSearch && matchesExpiring
  })

  const expiringCount = ingredients.filter(item => item.isExpiring).length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando estoque...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Controle de Estoque</h1>
            <p className="text-text-secondary">Gerencie insumos e produtos em estoque</p>
          </div>
        </div>

        {expiringCount > 0 && (
          <div className="card bg-yellow-900/10 border-yellow-900/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-400" size={24} />
              <div>
                <h3 className="text-text font-semibold">Atenção: Itens com validade próxima</h3>
                <p className="text-text-secondary">{expiringCount} insumos vencem em até 7 dias</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'ingredients'
                ? 'bg-accent text-background'
                : 'bg-card-background text-text-secondary hover:text-text'
            }`}
          >
            Insumos ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'products'
                ? 'bg-accent text-background'
                : 'bg-card-background text-text-secondary hover:text-text'
            }`}
          >
            Produtos ({products.length})
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          {activeTab === 'ingredients' && (
            <button
              onClick={() => setShowExpiring(!showExpiring)}
              className={`px-4 py-2 rounded-md border transition-colors ${
                showExpiring
                  ? 'bg-yellow-900/20 border-yellow-900/30 text-yellow-400'
                  : 'border-border text-text-secondary hover:text-text'
              }`}
            >
              <Filter size={16} className="inline mr-2" />
              Vencendo
            </button>
          )}
        </div>

        <div className="grid gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="text-accent" size={20} />
                    <h3 className="text-lg font-semibold text-text">{item.name}</h3>
                    {item.isExpiring && (
                      <span className="px-2 py-1 bg-yellow-900/20 text-yellow-400 text-xs rounded-full">
                        Vencendo
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Estoque Atual:</span>
                      <p className="text-text font-medium">
                        {item.currentStock.toFixed(2)} {item.unit.name}
                      </p>
                    </div>
                    {item.category && (
                      <div>
                        <span className="text-text-secondary">Categoria:</span>
                        <p className="text-text">{item.category.name}</p>
                      </div>
                    )}
                    {item.expiryDate && (
                      <div>
                        <span className="text-text-secondary">Validade:</span>
                        <p className="text-text">
                          {new Date(item.expiryDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-text-secondary">Movimentações:</span>
                      <p className="text-text">{item.stockMovements.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {item.stockMovements.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium text-text mb-3">Últimas Movimentações</h4>
                  <div className="space-y-2">
                    {item.stockMovements.slice(0, 3).map((movement, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {movement.type === 'IN' ? (
                            <TrendingUp className="text-green-400" size={16} />
                          ) : (
                            <TrendingDown className="text-red-400" size={16} />
                          )}
                          <span className="text-text-secondary">{movement.reason}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={movement.type === 'IN' ? 'text-green-400' : 'text-red-400'}>
                            {movement.type === 'IN' ? '+' : '-'}{movement.quantity.toFixed(2)} {item.unit.name}
                          </span>
                          <span className="text-text-secondary text-xs">
                            {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-text-secondary mb-4" size={48} />
            <h3 className="text-lg font-medium text-text mb-2">Nenhum item encontrado</h3>
            <p className="text-text-secondary">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Não há itens em estoque no momento'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
