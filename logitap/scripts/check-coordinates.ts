import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCoordinates() {
  console.log('Verificando coordenadas en la base de datos...\n');

  // Verificar farmacias
  const pharmacies = await prisma.pharmacy.findMany({
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
    },
  });

  console.log('=== FARMACIAS ===');
  console.log(`Total: ${pharmacies.length}`);
  const pharmaciesWithCoords = pharmacies.filter(p => p.latitude && p.longitude);
  console.log(`Con coordenadas: ${pharmaciesWithCoords.length}`);
  console.log(`Sin coordenadas: ${pharmacies.length - pharmaciesWithCoords.length}\n`);

  if (pharmaciesWithCoords.length > 0) {
    console.log('Farmacias con coordenadas:');
    pharmaciesWithCoords.forEach(p => {
      console.log(`  - ${p.name}: (${p.latitude}, ${p.longitude})`);
    });
  }

  console.log('\n=== LABORATORIOS ===');
  const laboratories = await prisma.laboratory.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  console.log(`Total: ${laboratories.length}`);
  console.log('Nota: Los laboratorios no tienen campos de coordenadas en el schema actual.');
  console.log('Las coordenadas de pickup vienen de pickup.pickupAddress (dirección de texto).\n');

  await prisma.$disconnect();
}

checkCoordinates()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
