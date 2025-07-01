import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@receitaspro.com' },
    update: {},
    create: {
      email: 'admin@receitaspro.com',
      name: 'Administrador',
      role: 'ADMIN'
    }
  })

  console.log('✅ Usuário admin criado:', adminUser.email)

  const measurementUnits = [
    { name: 'Grama (g)', type: 'peso', factorToGram: 1.0, factorToML: null },
    { name: 'Quilograma (kg)', type: 'peso', factorToGram: 1000.0, factorToML: null },
    { name: 'Litro (L)', type: 'volume', factorToGram: null, factorToML: 1000.0 },
    { name: 'Mililitro (ml)', type: 'volume', factorToGram: null, factorToML: 1.0 },
    { name: 'Unidade (un)', type: 'unidade', factorToGram: 1.0, factorToML: null },
    { name: 'Lata 250g', type: 'peso', factorToGram: 250.0, factorToML: null },
    { name: 'Pacote 1kg', type: 'peso', factorToGram: 1000.0, factorToML: null },
    { name: 'Saco 25kg', type: 'peso', factorToGram: 25000.0, factorToML: null }
  ]

  for (const unit of measurementUnits) {
    await prisma.measurementUnit.upsert({
      where: { name: unit.name },
      update: {},
      create: {
        ...unit,
        userId: adminUser.id
      }
    })
  }

  console.log('✅ Unidades de medida criadas')

  const ingredientCategories = [
    { name: 'Farináceos', description: 'Farinhas, féculas e similares' },
    { name: 'Gorduras', description: 'Óleos, manteigas, margarinas' },
    { name: 'Líquidos', description: 'Leite, água, sucos' },
    { name: 'Fermentos', description: 'Fermento biológico, químico' },
    { name: 'Açúcares', description: 'Açúcar cristal, refinado, mel' },
    { name: 'Ovos', description: 'Ovos e derivados' },
    { name: 'Temperos', description: 'Sal, especiarias, essências' },
    { name: 'Frutas', description: 'Frutas frescas e secas' },
    { name: 'Chocolates', description: 'Cacau, chocolate em pó, gotas' },
    { name: 'Conservantes', description: 'Aditivos e conservantes' }
  ]

  for (const category of ingredientCategories) {
    await prisma.ingredientCategory.upsert({
      where: { name: category.name },
      update: {},
      create: {
        ...category,
        userId: adminUser.id
      }
    })
  }

  console.log('✅ Categorias de insumos criadas')

  const productCategories = [
    { name: 'Pães', description: 'Pães doces e salgados' },
    { name: 'Bolos', description: 'Bolos e tortas' },
    { name: 'Biscoitos', description: 'Biscoitos e cookies' },
    { name: 'Salgados', description: 'Salgados assados e fritos' },
    { name: 'Doces', description: 'Doces e sobremesas' }
  ]

  for (const category of productCategories) {
    await prisma.productCategory.upsert({
      where: { name: category.name },
      update: {},
      create: {
        ...category,
        userId: adminUser.id
      }
    })
  }

  console.log('✅ Categorias de produtos criadas')

  const salesChannels = [
    { name: 'Varejo', description: 'Venda direta ao consumidor' },
    { name: 'Atacado', description: 'Venda para revendedores' },
    { name: 'Delivery', description: 'Entrega em domicílio' },
    { name: 'Eventos', description: 'Vendas para eventos' }
  ]

  for (const channel of salesChannels) {
    await prisma.salesChannel.upsert({
      where: { name: channel.name },
      update: {},
      create: {
        ...channel,
        userId: adminUser.id
      }
    })
  }

  console.log('✅ Canais de venda criados')

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
