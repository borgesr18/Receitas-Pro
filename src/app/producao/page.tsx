'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Search, Factory, Package, AlertTriangle } from 'lucide-react'

interface Production {
  id: string
  quantity: number
  actualWeight: number
  losses: number
  lossPercentage: number
  productionDate: string
  batchNumber: string
  notes?: string
  technicalSheet: {
    name: string
    finalWeight: number
    totalCost: number
  }
}

export default function ProducaoPage() {
  const [productions, setProductions] = useState<Production[]>([])
  const [technicalSheets, setTechnicalSheets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    technicalSheetId: '',
    quantity: '',
    actualWeight: '',
    losses: '',
    notes: ''
  })

  useEffect(() => {
    fetchProductions()
    fetchTechnicalSheets()
  }, [])

  const fetchProductions = async () => {
    try {
      const response = await fetch('/api/production')
      if (response.ok) {
        const data = await response.json()
        setProductions(data)
      }
    } catch (error) {
      console.error('Erro ao carregar produções:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicalSheets = async () => {
    try {
      const response = await fetch('/api/technical-sheets')
      if (response.ok) {
        const data = await response.json()
        setTechnicalSheets(data)
      }
    } catch (error) {
      console.error('Erro ao carregar fichas técnicas:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          actualWeight: parseFloat(formData.actualWeight),
          losses: parseFloat(formData.losses) || 0
        })
      })

      if (response.ok) {
        await fetchProductions()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao registrar produção')
      }
    } catch (error) {
      console.error('Erro ao registrar produção:', error)
      alert('Erro ao registrar produção')
    }
  }

  const resetForm = () => {
    setFormData({
      technicalSheetId: '',
      quantity: '',
      actualWeight: '',
      losses: '',
      notes: ''
    })
    setShowForm(false)
  }

  const filteredProductions = productions.filter(production =>
    production.technicalSheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    production.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando produções...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Produção</h1>
            <p className="text-text-secondary">Registre e acompanhe sua produção diária</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Produção
          </button>
        </div>

        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Pesquisar produções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        <div className="card">
          {filteredProductions.length === 0 ? (
            <div className="text-center py-12">
              <Factory className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-medium text-text mb-2">Nenhuma produção encontrada</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece registrando sua primeira produção'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Registrar Produção
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Lote</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Receita</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantidade</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Peso Real</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Perdas</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Data</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Custo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductions.map((production) => (
                    <tr key={production.id} className="border-b border-border hover:bg-hover">
                      <td className="py-3 px-4 text-text font-medium">{production.batchNumber}</td>
                      <td className="py-3 px-4 text-text">{production.technicalSheet.name}</td>
                      <td className="py-3 px-4 text-text">{production.quantity} un</td>
                      <td className="py-3 px-4 text-text">{production.actualWeight}g</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-text">{production.losses}g</span>
                          {production.lossPercentage > 5 && (
                            <AlertTriangle className="text-yellow-400" size={16} />
                          )}
                          <span className="text-text-secondary text-sm">
                            ({production.lossPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {new Date(production.productionDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-text">
                        R$ {(production.technicalSheet.totalCost * production.quantity).toFixed(2)}
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
                <h2 className="text-xl font-semibold text-text">Nova Produção</h2>
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
                    Ficha Técnica *
                  </label>
                  <select
                    value={formData.technicalSheetId}
                    onChange={(e) => setFormData({ ...formData, technicalSheetId: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Selecione uma ficha técnica</option>
                    {technicalSheets.map((sheet) => (
                      <option key={sheet.id} value={sheet.id}>
                        {sheet.name} - {sheet.finalWeight}g - R$ {sheet.totalCost.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Quantidade Produzida *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="input-field w-full"
                      placeholder="Ex: 10 unidades"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Peso Real Total (g) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.actualWeight}
                      onChange={(e) => setFormData({ ...formData, actualWeight: e.target.value })}
                      className="input-field w-full"
                      placeholder="Peso após produção"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Perdas (g)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.losses}
                      onChange={(e) => setFormData({ ...formData, losses: e.target.value })}
                      className="input-field w-full"
                      placeholder="Peso perdido"
                    />
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
                    placeholder="Anotações sobre a produção..."
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
                    Registrar Produção
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
