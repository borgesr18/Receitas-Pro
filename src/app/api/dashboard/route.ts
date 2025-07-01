import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await requireAuth()
    
    const currentMonth = new Date()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    
    const totalSalesMonth = await prisma.sale.aggregate({
      where: {
        userId: user.id,
        saleDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      },
      _sum: {
        totalPrice: true
      }
    })

    const totalCostsMonth = await prisma.ingredient.aggregate({
      where: {
        userId: user.id,
        purchaseDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      },
      _sum: {
        pricePerUnit: true
      }
    })

    const productsInStock = await prisma.product.count({
      where: {
        userId: user.id
      }
    })

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const expiringIngredients = await prisma.ingredient.count({
      where: {
        userId: user.id,
        expiryDate: {
          lte: thirtyDaysFromNow
        }
      }
    })

    const topProductsData = await prisma.sale.groupBy({
      by: ['productId'],
      where: {
        userId: user.id,
        saleDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      },
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    })

    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })
        return {
          name: product?.name || 'Produto não encontrado',
          sales: item._sum.quantity || 0
        }
      })
    )

    return NextResponse.json({
      totalSalesMonth: totalSalesMonth._sum.totalPrice || 0,
      totalCostsMonth: totalCostsMonth._sum.pricePerUnit || 0,
      productsInStock,
      expiringIngredients,
      topProducts
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
