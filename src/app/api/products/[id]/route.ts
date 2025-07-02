import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { id } = await context.params

    const { name, averageWeight, categoryId, salesChannels, prices } = body

    if (!name || !averageWeight) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome e peso médio' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { 
        id,
        userId: user.id
      },
      data: {
        name,
        averageWeight: parseFloat(averageWeight),
        categoryId: categoryId || 'default-category-id'
      }
    })

    await prisma.productPrice.deleteMany({
      where: { productId: id, userId: user.id }
    })

    if (prices && prices.length > 0) {
      await prisma.productPrice.createMany({
        data: prices.map((price: any) => ({
          productId: id,
          channel: price.channel,
          price: parseFloat(price.price),
          userId: user.id
        }))
      })
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        prices: true
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params

    await prisma.productPrice.deleteMany({
      where: { productId: id, userId: user.id }
    })

    await prisma.product.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
