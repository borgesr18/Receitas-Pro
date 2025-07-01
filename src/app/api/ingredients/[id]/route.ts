import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { id } = params

    const { name, purchaseQuantity, pricePerUnit, supplier, purchaseDate, expiryDate, storageLocation, unitId, categoryId } = body

    if (!name || !purchaseQuantity || !pricePerUnit) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, quantidade e preço' }, { status: 400 })
    }

    const ingredient = await prisma.ingredient.update({
      where: { 
        id,
        userId: user.id
      },
      data: {
        name,
        purchaseQuantity: parseFloat(purchaseQuantity),
        pricePerUnit: parseFloat(pricePerUnit),
        supplier,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        storageLocation,
        unitId: unitId || 'default-unit-id',
        categoryId: categoryId || 'default-category-id'
      },
      include: {
        unit: true,
        category: true
      }
    })

    return NextResponse.json(ingredient)
  } catch (error) {
    console.error('Error updating ingredient:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { id } = params

    await prisma.ingredient.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
