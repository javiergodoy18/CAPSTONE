import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('🔍 Consultando usuarios en la base de datos...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos\n');
    } else {
      console.log(`✅ Encontrados ${users.length} usuario(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Usuario:`);
        console.log(`   ID:    ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nombre: ${user.name}`);
        console.log(`   Rol:   ${user.role}`);
        console.log(`   Creado: ${user.createdAt.toLocaleString()}`);
        console.log('');
      });
    }
  } catch (error: any) {
    console.error('❌ Error al listar usuarios:', error.message);
    if (error.code === 'P1001') {
      console.error('\n⚠️  No se puede conectar a la base de datos.');
      console.error('   Verifica que la base de datos esté corriendo y que DATABASE_URL esté configurado correctamente.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
