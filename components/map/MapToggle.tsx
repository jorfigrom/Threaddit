"use client";

import React, { useCallback, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow, Autocomplete } from "@react-google-maps/api";
import Router from "next/router";

interface PostLocation {
  id: string;
  latitude: number;
  longitude: number;
  placeName?: string;
  address?: string;
}

interface MapaInteractivoProps {
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
    placeName?: string;
    address?: string;
  }) => void;
  postLocations?: PostLocation[]; // Lista de ubicaciones de los posts
}

const MapaInteractivo: React.FC<MapaInteractivoProps> = ({ onLocationChange, postLocations = [] }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostLocation | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();
      const address = place.formatted_address || "";
      const placeName = place.name || "";

      setMarkerPosition({ lat: latitude, lng: longitude });
      onLocationChange?.({ latitude, longitude, placeName, address });
    }
  };

  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const latitude = event.latLng.lat();
      const longitude = event.latLng.lng();

      setMarkerPosition({ lat: latitude, lng: longitude });

      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });

      const placeName = response.results[0]?.formatted_address || "Ubicación seleccionada";
      const address = response.results[0]?.formatted_address || "";

      onLocationChange?.({ latitude, longitude, placeName, address });
    },
    [onLocationChange]
  );

  if (!isLoaded) {
    return <p>Cargando mapa...</p>;
  }

  return (
    <div>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceSelect}
      >
        <input
          type="text"
          placeholder="Buscar un lugar"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={markerPosition || { lat: 37.3886, lng: -5.9823 }}
        zoom={10}
        onClick={handleMapClick}
      >
        {/* Marcador para la ubicación seleccionada */}
        {markerPosition && <Marker position={markerPosition} />}

        {/* Marcadores para los posts */}
        {postLocations.map((post) => (
          <Marker
            key={post.id}
            position={{ lat: post.latitude, lng: post.longitude }}
            onClick={() => setSelectedPost(post)}
          />
        ))}

        {/* InfoWindow para mostrar detalles del post */}
        {/* InfoWindow para mostrar detalles del post */}
{selectedPost && (
  <InfoWindow
    position={{ lat: selectedPost.latitude, lng: selectedPost.longitude }}
    onCloseClick={() => setSelectedPost(null)}
  >
    <div>
      <h4>{selectedPost.placeName || "Post sin título"}</h4>
      <p>{selectedPost.address}</p>
      <button
        className="text-blue-500 underline"
        onClick={() => Router.push(`/thread/${selectedPost.id}`)}
      >
        Ver post
      </button>
    </div>
  </InfoWindow>
)}
      </GoogleMap>
    </div>
  );
};

interface MapToggleProps {
  postLocations: {
    id: string;
    latitude: number;
    longitude: number;
    placeName?: string;
    address?: string;
  }[];
  posts: React.ReactNode; // JSX para la lista de posts
}

const MapToggle: React.FC<MapToggleProps> = ({ postLocations, posts }) => {
  const [showMap, setShowMap] = useState(false);

  
  


  return (
    <div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowMap(!showMap)}
      >
        {showMap ? "Ver lista" : "Ver publicaciones en el mapa"}
      </button>
      {showMap ? (
        <MapaInteractivo postLocations={postLocations} />
      ) : (
        <div>{posts}</div>
      )}
    </div>
  );
};

export default MapToggle;