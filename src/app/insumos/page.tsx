'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'

interface Ingredient {
  id: string
  name: string
  purchaseQuantity: number
  pricePerUnit: number
  supplier?: string
  purchaseDate?: string
  expiryDate?: string
  storageLocation?: string
  unit: {
    id: string
    name: string
    factorToGram?: number
  }
  category: {
    id: string
    name: string
  }
}

interface MeasurementUnit {
  id: string
  name: string
  type: string
  factorToGram?: number
  factorToML?: number
}

interface IngredientCategory {
  id: string
  name: string
  description?: string
}

export default function InsumosPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [units, setUnits] = useState<MeasurementUnit[]>([])
  const [categories, setCategories] = useState<IngredientCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    purchaseQuantity: '',
    pricePerUnit: '',
    supplier: '',
    purchaseDate: '',
    expiryDate: '',
    storageLocation: 'seca',
    unitId: '',
    categoryId: ''
  })

  useEffect(() => {
    fetchIngredients()
    fetchUnits()
    fetchCategories()
  }, [])

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/measurement-units')
      if (response.ok) {
        const data = await response.json()
        setUnits(data)
      }
    } catch (error) {
      console.error('Erro ao carregar unidades:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.ingredientCategories || [])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')
      if (response.ok) {
        const data = await response.json()
        setIngredients(data)
      }
    } catch (error) {
      console.error('Erro ao carregar insumos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/ingredients/${editingId}` : '/api/ingredients'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          purchaseQuantity: parseFloat(formData.purchaseQuantity),
          pricePerUnit: parseFloat(formData.pricePerUnit)
        })
      })

      if (response.ok) {
        await fetchIngredients()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar insumo')
      }
    } catch (error) {
      console.error('Erro ao salvar insumo:', error)
      alert('Erro ao salvar insumo')
    }
  }

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      purchaseQuantity: ingredient.purchaseQuantity.toString(),
      pricePerUnit: ingredient.pricePerUnit.toString(),
      supplier: ingredient.supplier || '',
      purchaseDate: ingredient.purchaseDate ? ingredient.purchaseDate.split('T')[0] : '',
      expiryDate: ingredient.expiryDate ? ingredient.expiryDate.split('T')[0] : '',
      storageLocation: ingredient.storageLocation || 'seca',
      unitId: ingredient.unit.id,
      categoryId: ingredient.category.id
    })
    setEditingId(ingredient.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) return

    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchIngredients()
      } else {
        alert('Erro ao excluir insumo')
      }
    } catch (error) {
      console.error('Erro ao excluir insumo:', error)
      alert('Erro ao excluir insumo')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      purchaseQuantity: '',
      pricePerUnit: '',
      supplier: '',
      purchaseDate: '',
      expiryDate: '',
      storageLocation: 'seca',
      unitId: '',
      categoryId: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando insumos...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Insumos</h1>
            <p className="text-text-secondary">Gerencie seus ingredientes e matérias-primas</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Insumo
          </button>
        </div>

        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Pesquisar insumos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        <div className="card">
          {filteredIngredients.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-medium text-text mb-2">Nenhum insumo encontrado</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece adicionando seu primeiro insumo'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Adicionar Insumo
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Nome</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Categoria</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantidade</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Preço/Un</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Fornecedor</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Validade</th>
                    <th className="text-right py-3 px-4 text-text-secondary font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map((ingredient) => (
                    <tr key={ingredient.id} className="border-b border-border hover:bg-hover">
                      <td className="py-3 px-4 text-text font-medium">{ingredient.name}</td>
                      <td className="py-3 px-4 text-text-secondary">{ingredient.category.name}</td>
                      <td className="py-3 px-4 text-text">
                        {ingredient.purchaseQuantity} {ingredient.unit.name}
                      </td>
                      <td className="py-3 px-4 text-text">
                        R$ {ingredient.pricePerUnit.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{ingredient.supplier || '-'}</td>
                      <td className="py-3 px-4 text-text-secondary">
                        {ingredient.expiryDate ? new Date(ingredient.expiryDate).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(ingredient)}
                            className="p-2 text-text-secondary hover:text-accent hover:bg-hover rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(ingredient.id)}
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
                  {editingId ? 'Editar Insumo' : 'Novo Insumo'}
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
                      Nome do Insumo *
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
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Quantidade de Compra *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchaseQuantity}
                      onChange={(e) => setFormData({ ...formData, purchaseQuantity: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Preço por Unidade *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Data de Compra
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Data de Validade
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Unidade de Medida *
                    </label>
                    <select
                      value={formData.unitId}
                      onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                      className="input-field w-full"
                      required
                    >
                      <option value="">Selecione uma unidade</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Categoria *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="input-field w-full"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Local de Armazenamento
                    </label>
                    <select
                      value={formData.storageLocation}
                      onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="seca">Seca</option>
                      <option value="refrigerada">Refrigerada</option>
                      <option value="congelada">Congelada</option>
                    </select>
                  </div>
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
