const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔵 Probando conexión a base de datos...\n');

  try {
    console.log('1️⃣ Intentando conectar...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa!\n');

    console.log('2️⃣ Intentando consultar usuarios...');
    const userCount = await prisma.user.count();
    console.log(`✅ Usuarios en BD: ${userCount}\n`);

    console.log('3️⃣ Intentando listar usuarios (máximo 5)...');
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log('✅ Usuarios encontrados:');
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.role}) - ${user.name}`);
    });

    console.log('\n✅ TODAS LAS PRUEBAS PASARON - BASE DE DATOS FUNCIONANDO');

  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN:', error.message);
    console.error('\n🔧 SOLUCIONES POSIBLES:');
    console.error('   1. Verifica que tu proyecto Supabase esté activo (no pausado)');
    console.error('   2. Verifica las credenciales en .env');
    console.error('   3. Verifica tu conexión a internet');
    console.error('   4. Ve a https://supabase.com/dashboard y reactiva el proyecto');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
