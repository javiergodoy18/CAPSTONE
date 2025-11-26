import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Dirección requerida" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key no configurada" },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address,
      });
    }

    return NextResponse.json(
      { error: "No se pudo geocodificar la dirección" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in geocode API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
