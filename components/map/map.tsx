import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Define una interfaz para las coordenadas
interface Location {
  lat: number;
  lng: number;
}

const MapaInteractivo: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Estilo del mapa
  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  };

  // Ubicación inicial (ejemplo: Madrid, España)
  const defaultCenter: Location = {
    lat: 40.4168,
    lng: -3.7038,
  };

  // Función que se ejecuta cuando el usuario hace click en el mapa
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedLocation({ lat, lng });

      // Redirigir a la página de creación de post con la ubicación seleccionada
      window.location.href = `/crear-post?lat=${lat}&lng=${lng}`;
    }
  };

  return (
    <LoadScript googleMapsApiKey="TU_API_KEY">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={5}
        onClick={handleMapClick} // Evento de clic en el mapa
      >
        {/* Si el usuario ha seleccionado una ubicación, mostrar un marcador */}
        {selectedLocation && <Marker position={selectedLocation} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapaInteractivo;
