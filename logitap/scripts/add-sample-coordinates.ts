import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleCoordinates() {
  console.log('Agregando coordenadas de ejemplo a farmacias y laboratorios...\n');

  // Coordenadas de ejemplo en La Serena, Chile
  const laSerenaCoords = {
    pharmacy1: { lat: -29.9027, lng: -71.2519 }, // Centro de La Serena
    pharmacy2: { lat: -29.9084, lng: -71.2456 }, // Zona este
    pharmacy3: { lat: -29.8972, lng: -71.2578 }, // Zona oeste
    laboratory1: { lat: -29.9050, lng: -71.2490 }, // Zona central
    laboratory2: { lat: -29.9100, lng: -71.2400 }, // Zona norte
  };

  // Actualizar farmacias
  const pharmacies = await prisma.pharmacy.findMany();
  console.log(`Encontradas ${pharmacies.length} farmacias`);

  for (let i = 0; i < pharmacies.length; i++) {
    const pharmacy = pharmacies[i];
    // Generar coordenadas ligeramente variadas para cada farmacia
    const coords = {
      latitude: laSerenaCoords.pharmacy1.lat + (Math.random() * 0.02 - 0.01),
      longitude: laSerenaCoords.pharmacy1.lng + (Math.random() * 0.02 - 0.01),
    };

    await prisma.pharmacy.update({
      where: { id: pharmacy.id },
      data: coords,
    });

    console.log(`  ✓ ${pharmacy.name}: (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`);
  }

  // Actualizar laboratorios
  const laboratories = await prisma.laboratory.findMany();
  console.log(`\nEncontrados ${laboratories.length} laboratorios`);

  for (let i = 0; i < laboratories.length; i++) {
    const laboratory = laboratories[i];
    // Generar coordenadas ligeramente variadas para cada laboratorio
    const coords = {
      latitude: laSerenaCoords.laboratory1.lat + (Math.random() * 0.02 - 0.01),
      longitude: laSerenaCoords.laboratory1.lng + (Math.random() * 0.02 - 0.01),
    };

    await prisma.laboratory.update({
      where: { id: laboratory.id },
      data: coords,
    });

    console.log(`  ✓ ${laboratory.name}: (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`);
  }

  console.log('\n¡Coordenadas agregadas exitosamente!');
  await prisma.$disconnect();
}

addSampleCoordinates()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
