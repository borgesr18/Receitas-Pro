import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const productions = await prisma.production.findMany({
      where: { userId: user.id },
      include: {
        technicalSheet: {
          select: {
            name: true,
            finalWeight: true,
            totalCost: true
          }
        }
      },
      orderBy: { productionDate: 'desc' }
    })

    return NextResponse.json(productions)
  } catch (error) {
    console.error('Error fetching productions:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

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

    const today = new Date()
    const batchNumber = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`

    const production = await prisma.production.create({
      data: {
        quantity,
        actualWeight,
        losses: actualLosses,
        lossPercentage,
        batchNumber,
        notes,
        productionDate: new Date(),
        technicalSheetId,
        userId: user.id
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
    console.error('Error creating production:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
