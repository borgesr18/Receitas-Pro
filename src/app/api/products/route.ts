import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      include: {
        category: true,
        prices: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { name, averageWeight, categoryId, salesChannels, prices } = body

    if (!name || !averageWeight) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome e peso médio' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        averageWeight: parseFloat(averageWeight),
        salesChannels: salesChannels || ['varejo'],
        categoryId: categoryId || 'default-category-id',
        userId: user.id
      },
      include: {
        category: true,
        prices: true
      }
    })

    if (prices && prices.length > 0) {
      await prisma.productPrice.createMany({
        data: prices.map((price: any) => ({
          productId: product.id,
          channel: price.channel,
          price: parseFloat(price.price),
          userId: user.id
        }))
      })
    }

    const productWithPrices = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        prices: true
      }
    })

    return NextResponse.json(productWithPrices)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
