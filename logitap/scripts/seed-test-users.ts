import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testUsers = [
  {
    email: 'admin@logitap.com',
    password: 'Admin123!',
    name: 'Administrador',
    role: 'ADMIN' as const,
  },
  {
    email: 'conductor1@logitap.com',
    password: 'Conductor123!',
    name: 'Juan Pérez',
    role: 'DRIVER' as const,
  },
  {
    email: 'conductor2@logitap.com',
    password: 'Conductor123!',
    name: 'María González',
    role: 'DRIVER' as const,
  },
];

async function seedTestUsers() {
  console.log('🌱 Iniciando seed de usuarios de prueba...\n');

  for (const userData of testUsers) {
    try {
      // Hash de contraseña con bcrypt cost 10
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Buscar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        // Actualizar usuario existente
        const updatedUser = await prisma.user.update({
          where: { email: userData.email },
          data: {
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
          },
        });
        console.log(`✅ Usuario actualizado: ${updatedUser.email} (${updatedUser.role})`);
      } else {
        // Crear nuevo usuario
        const newUser = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
          },
        });
        console.log(`✅ Usuario creado: ${newUser.email} (${newUser.role})`);
      }
    } catch (error: any) {
      console.error(`❌ Error con usuario ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Seed de usuarios de prueba completado!\n');
  console.log('📋 Credenciales de prueba:');
  console.log('');
  console.log('ADMIN:');
  console.log('  Email:    admin@logitap.com');
  console.log('  Password: Admin123!');
  console.log('');
  console.log('CONDUCTOR 1:');
  console.log('  Email:    conductor1@logitap.com');
  console.log('  Password: Conductor123!');
  console.log('');
  console.log('CONDUCTOR 2:');
  console.log('  Email:    conductor2@logitap.com');
  console.log('  Password: Conductor123!');
  console.log('');
}

seedTestUsers()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
