import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando usuario administrador...\n');

  const hashedPassword = await bcrypt.hash('Admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@logitap.com' },
    update: {
      password: hashedPassword,
      name: 'Administrador Sistema',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@logitap.com',
      password: hashedPassword,
      name: 'Administrador Sistema',
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuario administrador creado/actualizado:');
  console.log('   📧 Email:', admin.email);
  console.log('   👤 Nombre:', admin.name);
  console.log('   🔑 Password: Admin123');
  console.log('   🎭 Rol:', admin.role);
  console.log('\n🎉 Ahora puedes hacer login en http://localhost:3002/login');
}

main()
  .catch((e) => {
    console.error('❌ Error creando admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
