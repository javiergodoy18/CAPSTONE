import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de usuarios...');

  // Hash para contraseñas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const driverPassword = await bcrypt.hash('driver123', 10);

  // Crear usuario admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@logitap.com' },
    update: {},
    create: {
      email: 'admin@logitap.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);

  // Obtener todos los conductores sin usuario
  const driversWithoutUser = await prisma.driver.findMany({
    where: {
      user: null,
    },
    take: 5, // Crear usuarios para los primeros 5 conductores
  });

  // Crear usuarios para conductores
  for (const driver of driversWithoutUser) {
    const driverUser = await prisma.user.create({
      data: {
        email: driver.email || `${driver.name.toLowerCase().replace(/\s+/g, '.')}@logitap.com`,
        password: driverPassword,
        name: driver.name,
        role: 'DRIVER',
        driverId: driver.id,
      },
    });

    console.log(`✅ Usuario conductor creado: ${driverUser.email} (${driver.name})`);
  }

  console.log('\n📋 CREDENCIALES DE ACCESO:');
  console.log('─────────────────────────────────────');
  console.log('👤 ADMIN:');
  console.log('   Email: admin@logitap.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('🚗 CONDUCTORES:');
  console.log('   Email: [email del conductor]');
  console.log('   Password: driver123');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
