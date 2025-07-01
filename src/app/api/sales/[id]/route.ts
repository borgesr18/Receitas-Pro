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

    const { productId, quantity, weight, unitPrice, totalPrice, costPrice, profit, channel, notes } = body

    if (!productId || !weight || !totalPrice) {
      return NextResponse.json({ error: 'Campos obrigatórios: produto, peso e preço total' }, { status: 400 })
    }

    const sale = await prisma.sale.update({
      where: { 
        id,
        userId: user.id
      },
      data: {
        productId,
        quantity: quantity || 1,
        weight: parseFloat(weight),
        unitPrice: parseFloat(unitPrice) || 0,
        totalPrice: parseFloat(totalPrice),
        costPrice: parseFloat(costPrice) || 0,
        profit: parseFloat(profit) || 0,
        profitPercentage: totalPrice > 0 ? ((parseFloat(profit) || 0) / parseFloat(totalPrice)) * 100 : 0,
        channel,
        notes
      },
      include: {
        product: {
          select: {
            name: true,
            averageWeight: true
          }
        }
      }
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Error updating sale:', error)
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

    await prisma.sale.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sale:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
