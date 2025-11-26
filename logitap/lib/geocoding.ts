export async function geocodeAddress(address: string, city?: string, country: string = "Venezuela"): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API Key no encontrada");
      return null;
    }

    // Construir query completo
    const fullAddress = city
      ? `${address}, ${city}, ${country}`
      : `${address}, ${country}`;

    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    console.error("Geocoding failed:", data.status);
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

// Función para geocodificar en el cliente
export async function geocodeAddressClient(address: string, city?: string, country: string = "Venezuela"): Promise<{ lat: number; lng: number } | null> {
  try {
    const fullAddress = city
      ? `${address}, ${city}, ${country}`
      : `${address}, ${country}`;

    const encodedAddress = encodeURIComponent(fullAddress);

    const response = await fetch(`/api/geocode?address=${encodedAddress}`);

    if (!response.ok) {
      throw new Error("Error en geocodificación");
    }

    const data = await response.json();

    if (data.lat && data.lng) {
      return { lat: data.lat, lng: data.lng };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}
