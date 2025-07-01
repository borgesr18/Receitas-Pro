'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Search, Edit, Trash2, FileText, Calculator, Printer } from 'lucide-react'
import { 
  calculateBakerPercentage, 
  calculateTotalCost, 
  calculateCostPerGram,
  formatCurrency,
  formatWeight
} from '@/utils/calculations'

interface TechnicalSheet {
  id: string
  name: string
  description?: string
  preparationTime?: number
  ovenTemperature?: number
  instructions?: string
  observations?: string
  totalCost: number
  costPerGram: number
  finalWeight: number
  ingredients: {
    id: string
    quantity: number
    percentage: number
    ingredient: {
      name: string
      pricePerUnit: number
      unit: {
        name: string
        factorToGram?: number
      }
    }
  }[]
}

export default function FichasTecnicasPage() {
  const [sheets, setSheets] = useState<TechnicalSheet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    preparationTime: '',
    ovenTemperature: '',
    instructions: '',
    observations: '',
    finalWeight: '',
    ingredients: [] as any[]
  })

  const [showBakerCalculator, setShowBakerCalculator] = useState(false)
  const [flourWeight, setFlourWeight] = useState('')
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([])

  useEffect(() => {
    fetchSheets()
    fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')
      if (response.ok) {
        const data = await response.json()
        setAvailableIngredients(data)
      }
    } catch (error) {
      console.error('Erro ao carregar ingredientes:', error)
    }
  }

  const fetchSheets = async () => {
    try {
      const response = await fetch('/api/technical-sheets')
      if (response.ok) {
        const data = await response.json()
        setSheets(data)
      }
    } catch (error) {
      console.error('Erro ao carregar fichas técnicas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/technical-sheets/${editingId}` : '/api/technical-sheets'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
          ovenTemperature: formData.ovenTemperature ? parseInt(formData.ovenTemperature) : null,
          finalWeight: formData.finalWeight ? parseFloat(formData.finalWeight) : 0
        })
      })

      if (response.ok) {
        await fetchSheets()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar ficha técnica')
      }
    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error)
      alert('Erro ao salvar ficha técnica')
    }
  }

  const handleEdit = (sheet: TechnicalSheet) => {
    setFormData({
      name: sheet.name,
      description: sheet.description || '',
      preparationTime: sheet.preparationTime?.toString() || '',
      ovenTemperature: sheet.ovenTemperature?.toString() || '',
      instructions: sheet.instructions || '',
      observations: sheet.observations || '',
      finalWeight: sheet.finalWeight.toString(),
      ingredients: sheet.ingredients || []
    })
    setEditingId(sheet.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ficha técnica?')) return

    try {
      const response = await fetch(`/api/technical-sheets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchSheets()
      } else {
        alert('Erro ao excluir ficha técnica')
      }
    } catch (error) {
      console.error('Erro ao excluir ficha técnica:', error)
      alert('Erro ao excluir ficha técnica')
    }
  }

  const handleBakerCalculation = () => {
    if (!flourWeight || !formData.ingredients.length) {
      alert('Informe o peso da farinha e adicione ingredientes')
      return
    }

    const flourWeightNum = parseFloat(flourWeight)
    const calculatedIngredients = calculateBakerPercentage(flourWeightNum, formData.ingredients)
    const totalCost = calculateTotalCost(calculatedIngredients)
    const costPerGram = calculateCostPerGram(totalCost, parseFloat(formData.finalWeight))

    setFormData({
      ...formData,
      ingredients: calculatedIngredients.map(calc => ({
        ...calc.ingredient,
        quantity: calc.recalculatedQuantity
      }))
    })

    setShowBakerCalculator(false)
    alert(`Receita recalculada! Custo total: ${formatCurrency(totalCost)}`)
  }

  const handlePrint = (sheet: TechnicalSheet) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ficha Técnica - ${sheet.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .ingredients-table { width: 100%; border-collapse: collapse; }
            .ingredients-table th, .ingredients-table td { 
              border: 1px solid #ccc; padding: 8px; text-align: left; 
            }
            .cost-info { background: #f5f5f5; padding: 15px; margin: 20px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${sheet.name}</h1>
            <p>${sheet.description || ''}</p>
          </div>
          
          <div class="section">
            <h3>Ingredientes</h3>
            <table class="ingredients-table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Quantidade</th>
                  <th>Porcentagem</th>
                  <th>Custo</th>
                </tr>
              </thead>
              <tbody>
                ${sheet.ingredients.map(ing => `
                  <tr>
                    <td>${ing.ingredient.name}</td>
                    <td>${ing.quantity}${ing.ingredient.unit.name}</td>
                    <td>${ing.percentage.toFixed(1)}%</td>
                    <td>R$ ${((ing.quantity * ing.ingredient.pricePerUnit) / 100).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="cost-info">
            <p><strong>Custo Total:</strong> R$ ${sheet.totalCost.toFixed(2)}</p>
            <p><strong>Peso Final:</strong> ${sheet.finalWeight}g</p>
            <p><strong>Custo por Grama:</strong> R$ ${sheet.costPerGram.toFixed(4)}</p>
          </div>

          ${sheet.instructions ? `
            <div class="section">
              <h3>Modo de Preparo</h3>
              <p>${sheet.instructions}</p>
            </div>
          ` : ''}

          ${sheet.observations ? `
            <div class="section">
              <h3>Observações</h3>
              <p>${sheet.observations}</p>
            </div>
          ` : ''}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      preparationTime: '',
      ovenTemperature: '',
      instructions: '',
      observations: '',
      finalWeight: '',
      ingredients: []
    })
    setEditingId(null)
    setShowForm(false)
    setShowBakerCalculator(false)
    setFlourWeight('')
  }

  const filteredSheets = sheets.filter(sheet =>
    sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sheet.description && sheet.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando fichas técnicas...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Fichas Técnicas</h1>
            <p className="text-text-secondary">Gerencie suas receitas e cálculos de custo</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Ficha Técnica
          </button>
        </div>

        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Pesquisar fichas técnicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        <div className="card">
          {filteredSheets.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-text-secondary mb-4" size={48} />
              <h3 className="text-lg font-medium text-text mb-2">Nenhuma ficha técnica encontrada</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece criando sua primeira ficha técnica'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Criar Ficha Técnica
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Nome</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Custo Total</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Peso Final</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Custo/g</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Ingredientes</th>
                    <th className="text-right py-3 px-4 text-text-secondary font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSheets.map((sheet) => (
                    <tr key={sheet.id} className="border-b border-border hover:bg-hover">
                      <td className="py-3 px-4 text-text font-medium">{sheet.name}</td>
                      <td className="py-3 px-4 text-text">R$ {sheet.totalCost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-text">{sheet.finalWeight}g</td>
                      <td className="py-3 px-4 text-text">R$ {sheet.costPerGram.toFixed(4)}</td>
                      <td className="py-3 px-4 text-text-secondary">{sheet.ingredients.length} itens</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePrint(sheet)}
                            className="p-2 text-text-secondary hover:text-accent hover:bg-hover rounded"
                            title="Imprimir"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(sheet)}
                            className="p-2 text-text-secondary hover:text-accent hover:bg-hover rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(sheet.id)}
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
            <div className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">
                  {editingId ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-text-secondary hover:text-text"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Nome da Receita *
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
                      Peso Final (g) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.finalWeight}
                      onChange={(e) => setFormData({ ...formData, finalWeight: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Tempo de Preparo (min)
                    </label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Temperatura do Forno (°C)
                    </label>
                    <input
                      type="number"
                      value={formData.ovenTemperature}
                      onChange={(e) => setFormData({ ...formData, ovenTemperature: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full h-20"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Modo de Preparo
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="input-field w-full h-32"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Observações Técnicas
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="input-field w-full h-20"
                    rows={3}
                  />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBakerCalculator(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Calculator size={16} />
                    Calcular % Padeiro
                  </button>
                  <div className="flex gap-3">
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
                </div>
              </form>
            </div>
          </div>
        )}

        {showBakerCalculator && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">Cálculo % de Padeiro</h2>
                <button
                  onClick={() => setShowBakerCalculator(false)}
                  className="text-text-secondary hover:text-text"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Peso da Farinha (g) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={flourWeight}
                    onChange={(e) => setFlourWeight(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ex: 1000g"
                    required
                  />
                  <p className="text-text-secondary text-sm mt-1">
                    A farinha será considerada 100% e todos os outros ingredientes serão recalculados proporcionalmente.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBakerCalculator(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleBakerCalculation}
                    className="btn-primary"
                  >
                    Recalcular Receita
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
