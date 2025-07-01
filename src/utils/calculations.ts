export interface Ingredient {
  id: string
  name: string
  quantity: number
  percentage: number
  pricePerUnit: number
  unit: {
    name: string
    factorToGram?: number
  }
}

export interface BakerCalculationResult {
  ingredient: Ingredient
  recalculatedQuantity: number
  cost: number
}

export const calculateBakerPercentage = (
  flourWeight: number, 
  ingredients: Ingredient[]
): BakerCalculationResult[] => {
  return ingredients.map(ingredient => {
    const recalculatedQuantity = (ingredient.percentage / 100) * flourWeight
    const pricePerGram = ingredient.pricePerUnit / (ingredient.unit.factorToGram || 1)
    const cost = recalculatedQuantity * pricePerGram
    
    return {
      ingredient,
      recalculatedQuantity,
      cost
    }
  })
}

export const calculateTotalCost = (ingredients: BakerCalculationResult[]): number => {
  return ingredients.reduce((total, item) => total + item.cost, 0)
}

export const calculateCostPerGram = (totalCost: number, finalWeight: number): number => {
  return finalWeight > 0 ? totalCost / finalWeight : 0
}

export const calculateSuggestedPrice = (
  costPerGram: number, 
  finalWeight: number, 
  desiredProfit: number, 
  packagingCost: number = 0
): number => {
  const baseCost = costPerGram * finalWeight
  const totalCost = baseCost + packagingCost
  return totalCost * (1 + desiredProfit / 100)
}

export const calculateMarkup = (sellingPrice: number, cost: number): number => {
  return cost > 0 ? ((sellingPrice - cost) / cost) * 100 : 0
}

export const calculateProfitMargin = (sellingPrice: number, cost: number): number => {
  return sellingPrice > 0 ? ((sellingPrice - cost) / sellingPrice) * 100 : 0
}

export const convertToGrams = (quantity: number, unit: { factorToGram?: number }): number => {
  return quantity * (unit.factorToGram || 1)
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}kg`
  }
  return `${grams.toFixed(0)}g`
}
