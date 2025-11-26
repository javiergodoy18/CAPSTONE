import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@logitap.com';
  const password = 'admin123';

  console.log('🔐 Creando usuario admin...');

  // Hash de contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Hash generado:', hashedPassword.substring(0, 20) + '...');

  // Eliminar usuario existente si existe
  const deleted = await prisma.user.deleteMany({
    where: { email }
  });

  console.log('🗑️ Usuarios eliminados:', deleted.count);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('\n✅ Usuario creado exitosamente:');
  console.log('─────────────────────────────────────');
  console.log('   Email:', user.email);
  console.log('   Password: admin123');
  console.log('   ID:', user.id);
  console.log('   Rol:', user.role);
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    console.error('Stack:', e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
