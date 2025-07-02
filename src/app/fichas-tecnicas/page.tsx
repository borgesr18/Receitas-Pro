'use client'

export const dynamic = 'force-dynamic'

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
    
    const flourIngredient = formData.ingredients.find(ing => {
      const ingredient = availableIngredients.find((i: any) => i.id === ing.ingredientId)
      return ingredient?.category?.name?.toLowerCase().includes('fariná')
    })

    if (!flourIngredient) {
      alert('Adicione um ingrediente da categoria "Farináceos" primeiro para usar como base (100%)')
      return
    }

    const updatedIngredients = formData.ingredients.map(ing => {
      if (ing.ingredientId === flourIngredient.ingredientId) {
        return { 
          ...ing, 
          quantity: flourWeightNum,
          percentage: 100
        }
      } else if (ing.percentage && ing.percentage > 0) {
        const newQuantity = (flourWeightNum * ing.percentage) / 100
        return { ...ing, quantity: newQuantity }
      }
      return ing
    })

    const totalCost = updatedIngredients.reduce((sum, ing) => {
      const ingredient = availableIngredients.find((i: any) => i.id === ing.ingredientId)
      if (ingredient && ing.quantity) {
        const unit = ingredient.unit
        let quantityInGrams = ing.quantity
        
        if (unit?.factorToGram) {
          quantityInGrams = ing.quantity * unit.factorToGram
        }
        
        const costPerGram = ingredient.pricePerUnit / (ingredient.purchaseQuantity * (unit?.factorToGram || 1))
        return sum + (quantityInGrams * costPerGram)
      }
      return sum
    }, 0)

    const totalWeight = updatedIngredients.reduce((sum, ing) => sum + (ing.quantity || 0), 0)

    setFormData({
      ...formData,
      ingredients: updatedIngredients
    })

    setShowBakerCalculator(false)
    alert(`Ingredientes recalculados! Base: ${flourWeightNum}g de farinha (100%). Custo total: R$ ${totalCost.toFixed(2)}`)
  }

  const handlePrint = (sheet: TechnicalSheet) => {
    const printStyles = `
      <style>
        @page { 
          size: A4; 
          margin: 2cm; 
        }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 12pt; 
          line-height: 1.4; 
          margin: 0; 
          color: #000; 
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #000; 
          padding-bottom: 10px; 
          margin-bottom: 20px; 
        }
        .recipe-title { 
          font-size: 18pt; 
          font-weight: bold; 
          margin-bottom: 5px; 
        }
        .recipe-subtitle {
          font-size: 12pt;
          color: #666;
          margin-bottom: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-section {
          border: 1px solid #ccc;
          padding: 10px;
          background: #f9f9f9;
        }
        .info-section h4 {
          margin: 0 0 10px 0;
          font-size: 14pt;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0; 
        }
        th, td { 
          border: 1px solid #000; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f0f0f0; 
          font-weight: bold; 
          text-align: center;
        }
        .quantity-col, .percentage-col, .unit-col {
          text-align: center;
        }
        .cost-info { 
          background: #f5f5f5; 
          padding: 15px; 
          margin: 20px 0; 
          border: 1px solid #ccc; 
        }
        .cost-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .instructions { 
          margin-top: 20px; 
          page-break-inside: avoid; 
        }
        .instructions h3, .observations h3 {
          font-size: 14pt;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .instructions-content, .observations-content {
          white-space: pre-line;
          line-height: 1.6;
          padding: 10px;
          background: #fafafa;
          border: 1px solid #eee;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10pt;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        @media print { 
          body { margin: 0; } 
          .no-print { display: none !important; }
        }
      </style>
    `

    const totalIngredientWeight = sheet.ingredients?.reduce((sum, ing) => sum + ing.quantity, 0) || 0
    const yieldPercentage = sheet.finalWeight > 0 ? ((sheet.finalWeight / totalIngredientWeight) * 100).toFixed(1) : '0'

    const printContent = `
      <div class="header">
        <h1 style="margin: 0; font-size: 20pt; font-weight: bold;">RECEITAS PRO</h1>
        <p style="margin: 5px 0; font-size: 10pt; color: #666;">Sistema de Fichas para Panificação</p>
        <div class="recipe-title">${sheet.name}</div>
        <div class="recipe-subtitle">Ficha Técnica - Versão 1</div>
      </div>

      <div class="info-grid">
        <div class="info-section">
          <h4>Informações da Receita</h4>
          <p><strong>Peso Final:</strong> ${sheet.finalWeight}g</p>
          <p><strong>Rendimento:</strong> ${yieldPercentage}%</p>
          <p><strong>Tempo de Preparo:</strong> ${sheet.preparationTime || 'N/A'} minutos</p>
          <p><strong>Temperatura do Forno:</strong> ${sheet.ovenTemperature || 'N/A'}°C</p>
        </div>
        <div class="info-section">
          <h4>Análise de Custos</h4>
          <p><strong>Custo Total:</strong> R$ ${sheet.totalCost?.toFixed(2) || '0.00'}</p>
          <p><strong>Custo por Grama:</strong> R$ ${sheet.costPerGram?.toFixed(4) || '0.0000'}</p>
          <p><strong>Custo por 100g:</strong> R$ ${((sheet.costPerGram || 0) * 100).toFixed(2)}</p>
          <p><strong>Peso dos Ingredientes:</strong> ${totalIngredientWeight.toFixed(0)}g</p>
        </div>
      </div>

      <div>
        <h3 style="margin-bottom: 10px; font-size: 16pt; border-bottom: 1px solid #000; padding-bottom: 5px;">INGREDIENTES E PORCENTAGENS</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Ingrediente</th>
              <th style="width: 20%;">Quantidade (g)</th>
              <th style="width: 15%;">Porcentagem (%)</th>
              <th style="width: 25%;">Unidade de Compra</th>
            </tr>
          </thead>
          <tbody>
            ${sheet.ingredients?.map(ing => `
              <tr>
                <td>${ing.ingredient?.name || 'N/A'}</td>
                <td class="quantity-col">${ing.quantity?.toFixed(1) || '0.0'}g</td>
                <td class="percentage-col">${ing.percentage?.toFixed(1) || '0.0'}%</td>
                <td class="unit-col">${ing.ingredient?.unit?.name || 'N/A'}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
      </div>

      ${sheet.instructions ? `
        <div class="instructions">
          <h3>MODO DE PREPARO</h3>
          <div class="instructions-content">${sheet.instructions}</div>
        </div>
      ` : ''}

      ${sheet.observations ? `
        <div class="observations">
          <h3>OBSERVAÇÕES TÉCNICAS</h3>
          <div class="observations-content">${sheet.observations}</div>
        </div>
      ` : ''}

      <div class="footer">
        <p><strong>Receitas Pro - Sistema Profissional de Fichas Técnicas</strong></p>
        <p>Impresso em: ${new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ficha Técnica - ${sheet.name}</title>
          <meta charset="UTF-8">
          ${printStyles}
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
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

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-text">
                      Ingredientes
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          ingredients: [...formData.ingredients, {
                            ingredientId: '',
                            quantity: '',
                            percentage: ''
                          }]
                        })
                      }}
                      className="btn-secondary text-sm"
                    >
                      + Adicionar Ingrediente
                    </button>
                  </div>
                  
                  {formData.ingredients.length > 0 && (
                    <div className="space-y-3">
                      {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-border rounded">
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                              Ingrediente
                            </label>
                            <select
                              value={ingredient.ingredientId}
                              onChange={(e) => {
                                const updatedIngredients = [...formData.ingredients]
                                updatedIngredients[index].ingredientId = e.target.value
                                setFormData({ ...formData, ingredients: updatedIngredients })
                              }}
                              className="input-field w-full text-sm"
                              required
                            >
                              <option value="">Selecione...</option>
                              {availableIngredients.map((ing) => (
                                <option key={ing.id} value={ing.id}>
                                  {ing.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                              Quantidade (g/ml)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={ingredient.quantity}
                              onChange={(e) => {
                                const updatedIngredients = [...formData.ingredients]
                                updatedIngredients[index].quantity = e.target.value
                                setFormData({ ...formData, ingredients: updatedIngredients })
                              }}
                              className="input-field w-full text-sm"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                              Porcentagem (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={ingredient.percentage}
                              onChange={(e) => {
                                const updatedIngredients = [...formData.ingredients]
                                updatedIngredients[index].percentage = e.target.value
                                setFormData({ ...formData, ingredients: updatedIngredients })
                              }}
                              className="input-field w-full text-sm"
                              placeholder="Auto-calculado"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedIngredients = formData.ingredients.filter((_, i) => i !== index)
                                setFormData({ ...formData, ingredients: updatedIngredients })
                              }}
                              className="btn-secondary text-sm text-red-400 hover:text-red-300"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.ingredients.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-border rounded">
                      <p className="text-text-secondary text-sm">
                        Nenhum ingrediente adicionado. Clique em "Adicionar Ingrediente" para começar.
                      </p>
                    </div>
                  )}
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
