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

    const { name, description, preparationTime, ovenTemperature, instructions, observations, finalWeight, ingredients } = body

    if (!name || !finalWeight) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome e peso final' }, { status: 400 })
    }

    await prisma.technicalSheetIngredient.deleteMany({
      where: { technicalSheetId: id, userId: user.id }
    })

    const sheet = await prisma.technicalSheet.update({
      where: { 
        id,
        userId: user.id
      },
      data: {
        name,
        description,
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        ovenTemperature: ovenTemperature ? parseInt(ovenTemperature) : null,
        instructions,
        observations,
        finalWeight: parseFloat(finalWeight)
      }
    })

    if (ingredients && ingredients.length > 0) {
      await prisma.technicalSheetIngredient.createMany({
        data: ingredients.map((ing: any) => ({
          technicalSheetId: sheet.id,
          ingredientId: ing.ingredientId,
          quantity: parseFloat(ing.quantity),
          percentage: parseFloat(ing.percentage),
          userId: user.id
        }))
      })
    }

    const updatedSheet = await prisma.technicalSheet.findUnique({
      where: { id: sheet.id },
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

    return NextResponse.json(updatedSheet)
  } catch (error) {
    console.error('Error updating technical sheet:', error)
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

    await prisma.technicalSheetIngredient.deleteMany({
      where: { technicalSheetId: id, userId: user.id }
    })

    await prisma.technicalSheet.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting technical sheet:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
