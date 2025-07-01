import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const ingredients = await prisma.ingredient.findMany({
      where: { userId: user.id },
      include: {
        unit: true,
        category: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(ingredients)
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { name, purchaseQuantity, pricePerUnit, supplier, purchaseDate, expiryDate, storageLocation, unitId, categoryId } = body

    if (!name || !purchaseQuantity || !pricePerUnit) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, quantidade e preço' }, { status: 400 })
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        purchaseQuantity: parseFloat(purchaseQuantity),
        pricePerUnit: parseFloat(pricePerUnit),
        supplier,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        storageLocation,
        unitId: unitId || 'default-unit-id', // Will need proper unit selection
        categoryId: categoryId || 'default-category-id', // Will need proper category selection
        userId: user.id
      },
      include: {
        unit: true,
        category: true
      }
    })

    return NextResponse.json(ingredient)
  } catch (error) {
    console.error('Error creating ingredient:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
