'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Settings, Plus, Edit, Trash2, Users, Package, Scale } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: 'ingredient' | 'product'
}

interface MeasurementUnit {
  id: string
  name: string
  type: string
  factorToGram?: number
  factorToML?: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<MeasurementUnit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'ingredient',
    factorToGram: '',
    factorToML: '',
    role: 'EDITOR'
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      if (activeTab === 'categories') {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.ingredientCategories || [])
        }
      } else if (activeTab === 'units') {
        const response = await fetch('/api/measurement-units')
        if (response.ok) {
          const data = await response.json()
          setUnits(data)
        }
      } else if (activeTab === 'users') {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let url = ''
      let data = {}

      if (activeTab === 'categories') {
        url = editingId ? `/api/categories/${editingId}` : '/api/categories'
        data = { name: formData.name, type: formData.type }
      } else if (activeTab === 'units') {
        url = editingId ? `/api/measurement-units/${editingId}` : '/api/measurement-units'
        data = {
          name: formData.name,
          type: formData.type,
          factorToGram: formData.factorToGram ? parseFloat(formData.factorToGram) : null,
          factorToML: formData.factorToML ? parseFloat(formData.factorToML) : null
        }
      }

      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchData()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar')
    }
  }

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      type: item.type || 'ingredient',
      factorToGram: item.factorToGram?.toString() || '',
      factorToML: item.factorToML?.toString() || '',
      role: item.role || 'EDITOR'
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      let url = ''
      if (activeTab === 'categories') url = `/api/categories/${id}`
      else if (activeTab === 'units') url = `/api/measurement-units/${id}`

      const response = await fetch(url, { method: 'DELETE' })

      if (response.ok) {
        await fetchData()
      } else {
        alert('Erro ao excluir item')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir item')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'ingredient',
      factorToGram: '',
      factorToML: '',
      role: 'EDITOR'
    })
    setEditingId(null)
    setShowForm(false)
  }

  const tabs = [
    { id: 'categories', label: 'Categorias', icon: Package },
    { id: 'units', label: 'Unidades de Medida', icon: Scale },
    { id: 'users', label: 'Usuários', icon: Users }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando configurações...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Configurações</h1>
            <p className="text-text-secondary">Gerencie as configurações do sistema</p>
          </div>
          {activeTab !== 'users' && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Novo {activeTab === 'categories' ? 'Categoria' : 'Unidade'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Conteúdo das tabs */}
        <div className="card">
          {activeTab === 'categories' && (
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Categorias de Insumos e Produtos</h2>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto text-text-secondary mb-4" size={48} />
                  <p className="text-text-secondary">Nenhuma categoria cadastrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Nome</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Tipo</th>
                        <th className="text-right py-3 px-4 text-text-secondary font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id} className="border-b border-border hover:bg-hover">
                          <td className="py-3 px-4 text-text font-medium">{category.name}</td>
                          <td className="py-3 px-4 text-text-secondary capitalize">{category.type}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(category)}
                                className="p-2 text-text-secondary hover:text-accent hover:bg-hover rounded"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
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
          )}

          {activeTab === 'units' && (
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Unidades de Medida</h2>
              {units.length === 0 ? (
                <div className="text-center py-8">
                  <Scale className="mx-auto text-text-secondary mb-4" size={48} />
                  <p className="text-text-secondary">Nenhuma unidade cadastrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Nome</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Tipo</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Fator para Grama</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Fator para ML</th>
                        <th className="text-right py-3 px-4 text-text-secondary font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((unit) => (
                        <tr key={unit.id} className="border-b border-border hover:bg-hover">
                          <td className="py-3 px-4 text-text font-medium">{unit.name}</td>
                          <td className="py-3 px-4 text-text-secondary capitalize">{unit.type}</td>
                          <td className="py-3 px-4 text-text">{unit.factorToGram || '-'}</td>
                          <td className="py-3 px-4 text-text">{unit.factorToML || '-'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(unit)}
                                className="p-2 text-text-secondary hover:text-accent hover:bg-hover rounded"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(unit.id)}
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
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Usuários do Sistema</h2>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto text-text-secondary mb-4" size={48} />
                  <p className="text-text-secondary">Nenhum usuário encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Nome</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Função</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-hover">
                          <td className="py-3 px-4 text-text font-medium">{user.name}</td>
                          <td className="py-3 px-4 text-text-secondary">{user.email}</td>
                          <td className="py-3 px-4 text-text-secondary">{user.role}</td>
                          <td className="py-3 px-4 text-text-secondary">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">
                  {editingId ? 'Editar' : 'Novo'} {activeTab === 'categories' ? 'Categoria' : 'Unidade'}
                </h2>
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
                    Nome *
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
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    {activeTab === 'categories' ? (
                      <>
                        <option value="ingredient">Insumo</option>
                        <option value="product">Produto</option>
                      </>
                    ) : (
                      <>
                        <option value="peso">Peso</option>
                        <option value="volume">Volume</option>
                        <option value="unidade">Unidade</option>
                      </>
                    )}
                  </select>
                </div>

                {activeTab === 'units' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Fator para Grama
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.factorToGram}
                        onChange={(e) => setFormData({ ...formData, factorToGram: e.target.value })}
                        className="input-field w-full"
                        placeholder="Ex: 1000 para kg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Fator para ML
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.factorToML}
                        onChange={(e) => setFormData({ ...formData, factorToML: e.target.value })}
                        className="input-field w-full"
                        placeholder="Ex: 1000 para L"
                      />
                    </div>
                  </>
                )}

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
