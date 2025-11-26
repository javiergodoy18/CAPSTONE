"use client";

import { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  defaultValue?: string;
  placeholder?: string;
  country?: string;
}

export default function AddressAutocomplete({
  onAddressSelect,
  defaultValue = "",
  placeholder = "Escribe una dirección...",
  country = "ve",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargar script de Google Maps
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return;

    try {
      // Inicializar autocomplete con la API actual
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country },
        fields: ["formatted_address", "geometry", "name", "address_components"],
        types: ["address"], // Restringir a direcciones
      });

      // Listener para cuando se selecciona un lugar
      const listener = autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();

        if (place && place.geometry && place.geometry.location) {
          const address = place.formatted_address || place.name || "";
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          setInputValue(address);
          onAddressSelect(address, { lat, lng });
        }
      });

      return () => {
        if (listener) {
          google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }
  }, [isLoaded, country, onAddressSelect]);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={isLoaded ? placeholder : "Cargando Google Maps..."}
        disabled={!isLoaded}
        className="form-input"
        style={{ margin: 0, width: "100%" }}
      />
      {!isLoaded && (
        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
          Cargando autocompletado de Google Maps...
        </div>
      )}
    </div>
  );
}
