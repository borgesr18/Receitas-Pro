import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const sheets = await prisma.technicalSheet.findMany({
      where: { userId: user.id },
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                unit: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(sheets)
  } catch (error) {
    console.error('Error fetching technical sheets:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { name, description, preparationTime, ovenTemperature, instructions, observations, finalWeight } = body

    if (!name || !finalWeight) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome e peso final' }, { status: 400 })
    }

    const sheet = await prisma.technicalSheet.create({
      data: {
        name,
        description,
        preparationTime: preparationTime || null,
        ovenTemperature: ovenTemperature || null,
        instructions,
        observations,
        finalWeight: parseFloat(finalWeight),
        totalCost: 0,
        costPerGram: 0,
        userId: user.id
      },
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                unit: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(sheet)
  } catch (error) {
    console.error('Error creating technical sheet:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
