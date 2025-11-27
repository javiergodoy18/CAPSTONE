import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetUserPassword() {
  try {
    // Obtener argumentos de línea de comandos
    const args = process.argv.slice(2);

    if (args.length !== 2) {
      console.log('\n❌ Uso incorrecto\n');
      console.log('Uso: npx tsx scripts/reset-user-password.ts <email> <nuevaContraseña>\n');
      console.log('Ejemplo:');
      console.log('  npx tsx scripts/reset-user-password.ts admin@logitap.com NuevaPass123!\n');
      process.exit(1);
    }

    const [email, newPassword] = args;

    console.log('\n🔐 RESET MANUAL DE CONTRASEÑA');
    console.log('================================\n');
    console.log(`Email: ${email}`);
    console.log('');

    // Buscar usuario
    console.log('🔍 Buscando usuario...');
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      console.log(`\n❌ Usuario no encontrado: ${email}\n`);
      process.exit(1);
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Rol: ${user.role}`);
    console.log('');

    // Validar fortaleza de contraseña
    if (newPassword.length < 8) {
      console.log('❌ La contraseña debe tener al menos 8 caracteres\n');
      process.exit(1);
    }

    if (!/[A-Z]/.test(newPassword)) {
      console.log('❌ La contraseña debe contener al menos una letra mayúscula\n');
      process.exit(1);
    }

    if (!/[0-9]/.test(newPassword)) {
      console.log('❌ La contraseña debe contener al menos un número\n');
      process.exit(1);
    }

    // Hashear contraseña
    console.log('🔒 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    console.log('💾 Actualizando contraseña en la base de datos...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    console.log('');
    console.log('✅ ¡Contraseña actualizada exitosamente!');
    console.log('');
    console.log('📋 Puedes iniciar sesión con:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('\n⚠️  No se puede conectar a la base de datos.');
      console.error('   Verifica que DATABASE_URL esté configurado correctamente.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetUserPassword();
