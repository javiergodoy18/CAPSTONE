import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const fullAddress = `${address}, ${city}, Venezuela`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    return null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function main() {
  console.log('🗺️  Geocodificando direcciones de Venezuela...\n');

  // Geocodificar farmacias
  const pharmacies = await prisma.pharmacy.findMany();
  let pharmacyCount = 0;

  console.log(`=== FARMACIAS (${pharmacies.length}) ===`);
  for (const pharmacy of pharmacies) {
    if (pharmacy.address && pharmacy.city) {
      console.log(`Geocodificando: ${pharmacy.name}...`);
      const coords = await geocodeAddress(pharmacy.address, pharmacy.city);

      if (coords) {
        await prisma.pharmacy.update({
          where: { id: pharmacy.id },
          data: {
            latitude: coords.lat,
            longitude: coords.lng,
          },
        });
        console.log(`✅ ${pharmacy.name}: ${coords.lat}, ${coords.lng}`);
        pharmacyCount++;
      } else {
        console.log(`❌ ${pharmacy.name}: No se pudo geocodificar`);
      }

      // Esperar un poco para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Geocodificar laboratorios
  console.log(`\n=== LABORATORIOS (${await prisma.laboratory.count()}) ===`);
  const laboratories = await prisma.laboratory.findMany();
  let labCount = 0;

  for (const lab of laboratories) {
    if (lab.address && lab.city) {
      console.log(`Geocodificando: ${lab.name}...`);
      const coords = await geocodeAddress(lab.address, lab.city);

      if (coords) {
        await prisma.laboratory.update({
          where: { id: lab.id },
          data: {
            latitude: coords.lat,
            longitude: coords.lng,
          },
        });
        console.log(`✅ ${lab.name}: ${coords.lat}, ${coords.lng}`);
        labCount++;
      } else {
        console.log(`❌ ${lab.name}: No se pudo geocodificar`);
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`\n✅ Geocodificación completa:`);
  console.log(`   - ${pharmacyCount} farmacias geocodificadas`);
  console.log(`   - ${labCount} laboratorios geocodificados`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
