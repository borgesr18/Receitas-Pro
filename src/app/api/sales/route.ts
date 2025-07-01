import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const sales = await prisma.sale.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            name: true,
            averageWeight: true
          }
        }
      },
      orderBy: { saleDate: 'desc' }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { productId, quantity, weight, unitPrice, channel, notes } = body

    if (!productId || !quantity || !weight || !unitPrice) {
      return NextResponse.json({ error: 'Campos obrigatórios: produto, quantidade, peso e preço' }, { status: 400 })
    }

    const totalPrice = unitPrice * quantity
    
    const estimatedCost = totalPrice * 0.7
    const profit = totalPrice - estimatedCost
    const profitPercentage = (profit / totalPrice) * 100

    const sale = await prisma.sale.create({
      data: {
        quantity,
        weight,
        unitPrice,
        totalPrice,
        profit,
        profitPercentage,
        channel,
        notes,
        saleDate: new Date(),
        productId,
        userId: user.id
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
    console.error('Error creating sale:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
