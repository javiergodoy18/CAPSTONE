const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n📊 VERIFICACIÓN DE DATOS EN LA BASE DE DATOS\n');

    const [users, vehicles, drivers, laboratories, pharmacies, dispatches, pickups, deliveries] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.laboratory.count(),
      prisma.pharmacy.count(),
      prisma.dispatch.count(),
      prisma.pickup.count(),
      prisma.delivery.count(),
    ]);

    console.log('┌─────────────────────┬─────────┐');
    console.log('│ Tabla               │ Cantidad│');
    console.log('├─────────────────────┼─────────┤');
    console.log(`│ Users               │ ${users.toString().padStart(7)} │`);
    console.log(`│ Vehicles            │ ${vehicles.toString().padStart(7)} │`);
    console.log(`│ Drivers             │ ${drivers.toString().padStart(7)} │`);
    console.log(`│ Laboratories        │ ${laboratories.toString().padStart(7)} │`);
    console.log(`│ Pharmacies          │ ${pharmacies.toString().padStart(7)} │`);
    console.log(`│ Dispatches          │ ${dispatches.toString().padStart(7)} │`);
    console.log(`│ Pickups             │ ${pickups.toString().padStart(7)} │`);
    console.log(`│ Deliveries          │ ${deliveries.toString().padStart(7)} │`);
    console.log('└─────────────────────┴─────────┘\n');

    // Verificar si existe el usuario admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@logitap.com' },
      select: { email: true, name: true, role: true }
    });

    if (adminUser) {
      console.log('✅ Usuario admin encontrado:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Nombre: ${adminUser.name}`);
      console.log(`   Rol: ${adminUser.role}\n`);
    } else {
      console.log('❌ Usuario admin@logitap.com NO encontrado\n');
    }

    // Listar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('📋 Tablas en la base de datos:');
    tables.forEach((t, i) => console.log(`   ${i + 1}. ${t.table_name}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
