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

    const { technicalSheetId, quantity, actualWeight, losses, notes } = body

    if (!technicalSheetId || !quantity || !actualWeight) {
      return NextResponse.json({ error: 'Campos obrigatórios: ficha técnica, quantidade e peso real' }, { status: 400 })
    }

    const technicalSheet = await prisma.technicalSheet.findFirst({
      where: { 
        id: technicalSheetId,
        userId: user.id
      }
    })

    if (!technicalSheet) {
      return NextResponse.json({ error: 'Ficha técnica não encontrada' }, { status: 404 })
    }

    const expectedWeight = technicalSheet.finalWeight * quantity
    const actualLosses = losses || (expectedWeight - actualWeight)
    const lossPercentage = (actualLosses / expectedWeight) * 100

    const production = await prisma.production.update({
      where: { 
        id,
        userId: user.id
      },
      data: {
        quantity,
        actualWeight,
        losses: actualLosses,
        lossPercentage,
        notes
      },
      include: {
        technicalSheet: {
          select: {
            name: true,
            finalWeight: true,
            totalCost: true
          }
        }
      }
    })

    return NextResponse.json(production)
  } catch (error) {
    console.error('Error updating production:', error)
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

    await prisma.production.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting production:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
