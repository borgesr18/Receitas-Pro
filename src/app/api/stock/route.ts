import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    if (type === 'ingredients') {
      const ingredients = await prisma.ingredient.findMany({
        where: { userId: user.id },
        include: {
          unit: true,
          category: true,
          stockMovements: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { name: 'asc' }
      })

      const ingredientsWithStock = ingredients.map(ingredient => {
        const totalIn = ingredient.stockMovements
          .filter(m => m.type === 'IN')
          .reduce((sum, m) => sum + m.quantity, 0)
        const totalOut = ingredient.stockMovements
          .filter(m => m.type === 'OUT')
          .reduce((sum, m) => sum + m.quantity, 0)
        
        return {
          ...ingredient,
          currentStock: totalIn - totalOut,
          isExpiring: ingredient.expiryDate && 
            new Date(ingredient.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      return NextResponse.json(ingredientsWithStock)
    }

    if (type === 'products') {
      const products = await prisma.product.findMany({
        where: { userId: user.id },
        include: {
          category: true,
          stockMovements: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { name: 'asc' }
      })

      const productsWithStock = products.map(product => {
        const totalIn = product.stockMovements
          .filter(m => m.type === 'IN')
          .reduce((sum, m) => sum + m.quantity, 0)
        const totalOut = product.stockMovements
          .filter(m => m.type === 'OUT')
          .reduce((sum, m) => sum + m.quantity, 0)
        
        return {
          ...product,
          currentStock: totalIn - totalOut
        }
      })

      return NextResponse.json(productsWithStock)
    }

    const [ingredientsStock, productsStock] = await Promise.all([
      prisma.ingredient.findMany({
        where: { userId: user.id },
        include: { stockMovements: true }
      }),
      prisma.product.findMany({
        where: { userId: user.id },
        include: { stockMovements: true }
      })
    ])

    return NextResponse.json({
      ingredients: ingredientsStock,
      products: productsStock
    })
  } catch (error) {
    console.error('Error fetching stock:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { itemId, itemType, type, quantity, reason, batchNumber } = body

    if (!itemId || !itemType || !type || !quantity) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: item, tipo, operação e quantidade' 
      }, { status: 400 })
    }

    const stockMovement = await prisma.stockMovement.create({
      data: {
        itemId,
        itemType: itemType.toUpperCase(),
        type: type.toUpperCase(),
        quantity: parseFloat(quantity),
        reason,
        batchNumber,
        userId: user.id
      }
    })

    return NextResponse.json(stockMovement)
  } catch (error) {
    console.error('Error creating stock movement:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
