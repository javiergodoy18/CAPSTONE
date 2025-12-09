const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...')

    const users = await prisma.user.count()
    console.log('✅ Usuarios en DB:', users)

    const vehicles = await prisma.vehicle.count()
    console.log('✅ Vehículos en DB:', vehicles)

    const drivers = await prisma.driver.count()
    console.log('✅ Conductores en DB:', drivers)

    const dispatches = await prisma.dispatch.count()
    console.log('✅ Despachos en DB:', dispatches)

    console.log('\n✅ CONEXIÓN A BASE DE DATOS FUNCIONA CORRECTAMENTE')
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    console.error('Código de error:', error.code)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
