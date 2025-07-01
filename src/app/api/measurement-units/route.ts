import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const units = await prisma.measurementUnit.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('Error fetching measurement units:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { name, type, factorToGram, factorToML } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 })
    }

    const unit = await prisma.measurementUnit.create({
      data: {
        name,
        type,
        factorToGram: factorToGram || null,
        factorToML: factorToML || null,
        userId: user.id
      }
    })

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error creating measurement unit:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
