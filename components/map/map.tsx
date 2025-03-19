import React, { useCallback, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface MapaInteractivoProps {
  onLocationChange: (location: {
    latitude: number;
    longitude: number;
    placeName?: string;
    address?: string;
  }) => void;
}

const MapaInteractivo: React.FC<MapaInteractivoProps> = ({ onLocationChange }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Asegúrate de configurar esta variable en tu archivo .env
    libraries: ["places"],
  });

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const latitude = event.latLng.lat();
      const longitude = event.latLng.lng();

      setMarkerPosition({ lat: latitude, lng: longitude });

      // Opcional: Obtener el nombre del lugar y la dirección usando el servicio Geocoder
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });

      const placeName = response.results[0]?.formatted_address || "Ubicación seleccionada";
      const address = response.results[0]?.formatted_address || "";

      onLocationChange({ latitude, longitude, placeName, address });
    },
    [onLocationChange]
  );

  if (!isLoaded) {
    return <p>Cargando mapa...</p>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "400px" }}
      center={markerPosition || { lat: 40.7128, lng: -74.006 }} // Coordenadas iniciales (por defecto: Nueva York)
      zoom={10}
      onClick={handleMapClick}
    >
      {markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  );
};

export default MapaInteractivo;
