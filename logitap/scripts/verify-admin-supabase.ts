import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando conexión a Supabase...');

  try {
    // Test de conexión
    await prisma.$connect();
    console.log('✅ Conectado a Supabase exitosamente');

    // Contar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    ` as any[];

    console.log(`📊 Tablas encontradas: ${tables.length}`);
    console.log('📋 Lista de tablas:');
    tables.forEach((t: any, i: number) => console.log(`   ${i + 1}. ${t.table_name}`));

    // Verificar usuario admin
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@logitap.com' }
    });

    if (admin) {
      console.log('\n✅ Usuario admin existe:');
      console.log('   📧 Email:', admin.email);
      console.log('   👤 Nombre:', admin.name);
      console.log('   🎭 Rol:', admin.role);
    } else {
      console.log('\n⚠️ Usuario admin NO existe. Creando...');

      const hashedPassword = await bcrypt.hash('Admin123', 10);

      admin = await prisma.user.create({
        data: {
          email: 'admin@logitap.com',
          password: hashedPassword,
          name: 'Administrador Sistema',
          role: 'ADMIN',
        },
      });

      console.log('✅ Admin creado exitosamente');
    }

    console.log('\n🔑 CREDENCIALES DE LOGIN:');
    console.log('   Email: admin@logitap.com');
    console.log('   Password: Admin123');

    // Contar registros
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.laboratory.count(),
      prisma.pharmacy.count(),
      prisma.dispatch.count(),
      prisma.pickup.count(),
      prisma.delivery.count(),
    ]);

    console.log('\n📊 REGISTROS EN BASE DE DATOS:');
    console.log(`   👥 Usuarios: ${counts[0]}`);
    console.log(`   🚗 Vehículos: ${counts[1]}`);
    console.log(`   👨‍✈️ Conductores: ${counts[2]}`);
    console.log(`   🏢 Laboratorios: ${counts[3]}`);
    console.log(`   💊 Farmacias: ${counts[4]}`);
    console.log(`   📦 Despachos: ${counts[5]}`);
    console.log(`   📥 Pickups: ${counts[6]}`);
    console.log(`   📤 Deliveries: ${counts[7]}`);

    console.log('\n✅ VERIFICACIÓN COMPLETA');
    console.log('🚀 Ahora puedes ejecutar: npm run dev');
    console.log('🌐 Y entrar en: http://localhost:3000/login');

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    if (error.message.includes('Can\'t reach database')) {
      console.error('🚨 No se puede conectar a Supabase.');
      console.error('   Verifica que el proyecto esté activo en:');
      console.error('   https://supabase.com/dashboard/project/tyvzxtrctlujmifhukea');
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
