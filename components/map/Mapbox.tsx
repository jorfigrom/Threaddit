"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface PostLocation {
  id: string;
  latitude: number;
  longitude: number;
  placeName?: string;
  address?: string;
  imageThread?: string;
  authorBio?: string;
  likes?: string[];
  createdAt?: string;
}

interface Props {
  postLocations: PostLocation[];
  userLocation: { latitude: number; longitude: number } | null;
}

const menuStyle = {
  background: "#fff",
  position: "absolute" as const,
  zIndex: 1,
  top: 10,
  right: 10,
  borderRadius: 4,
  width: "140px",
  border: "1px solid rgba(0, 0, 0, 0.4)",
  fontFamily: "sans-serif",
};

const buttonStyle = {
  fontSize: "13px",
  color: "#404040",
  display: "block",
  margin: "0",
  padding: "10px",
  textDecoration: "none",
  border: "none",
  textAlign: "center" as const,
  cursor: "pointer",
  width: "100%",
  backgroundColor: "transparent",
};

const activeButtonStyle = {
  backgroundColor: "#3887be",
  color: "#fff",
};

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
};

const MapboxMapaInteractivo: React.FC<Props> = ({ postLocations, userLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapMode, setMapMode] = useState("Explorar");

  const getHighlightedPosts = (): Set<string> => {
    switch (mapMode) {
      case "Popular":
        return new Set(
          [...postLocations]
            .filter((post) => (post.likes?.length ?? 0) > 0) // Filtrar posts con likes > 0
            .sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0))
            .slice(0, 3)
            .map((post) => post.id)
        );
      case "Reciente":
        return new Set(
          [...postLocations]
            .filter((post) => post.createdAt) // Filtrar posts con fecha válida
            .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
            .slice(0, 3)
            .map((post) => post.id)
        );
      case "Cerca de mí":
        if (!userLocation) return new Set();
        const nearbyPosts = [...postLocations]
          .map((post) => ({
            ...post,
            distance: haversineDistance(
              post.latitude,
              post.longitude,
              userLocation.latitude,
              userLocation.longitude
            ),
          }))
          .filter((post) => post.distance <= 2) // Filtrar posts dentro de 2 km
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)); // Ordenar por distancia

        console.log("Nearby posts:", nearbyPosts); // Depuración
        return new Set(nearbyPosts.map((post) => post.id));
      default:
        return new Set(); // No destacar ningún post en "Explorar"
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation
        ? [userLocation.longitude, userLocation.latitude]: [0, 0], // Centrar en la ubicación del usuario si está disponible
      zoom: 2,
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Eliminar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const highlightedPosts = getHighlightedPosts();

    postLocations.forEach((post) => {
      const isHighlighted = highlightedPosts.has(post.id);

      const marker = new mapboxgl.Marker({
        color: isHighlighted ? "#f97316" : "#3b82f6", // Naranja para destacados, azul para el resto
      })
        .setLngLat([post.longitude, post.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="max-width: 200px; background-color: white; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
              <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: black;">${post.authorBio || "Anónimo"}</h3>
              <p style="font-size: 12px; margin-bottom: 8px; color: black;">${post.address || "Sin dirección"}</p>
              ${
                post.imageThread
                  ? `<img src="${post.imageThread}" alt="Imagen" style="width: 100%; border-radius: 8px; margin-bottom: 8px;" />`
                  : ""
              }
              <p style="font-size: 12px; color: black;">Likes: ${post.likes?.length ?? 0}</p>
            </div>
          `)
        )
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    // Centrar mapa si hay posts
    if (postLocations.length > 0) {
      const avgLng = postLocations.reduce((sum, p) => sum + p.longitude, 0) / postLocations.length;
      const avgLat = postLocations.reduce((sum, p) => sum + p.latitude, 0) / postLocations.length;
      mapRef.current.flyTo({ center: [avgLng, avgLat], zoom: 11 });
    }
  }, [mapMode, postLocations, userLocation]);

  return (
    <div style={{ position: "relative", width: "100%", height: "500px" }}>
      <div style={menuStyle}>
        {["Explorar", "Reciente", "Popular", "Cerca de mí"].map((mode) => (
          <button
            key={mode}
            onClick={() => setMapMode(mode)}
            style={{
              ...buttonStyle,
              ...(mapMode === mode ? activeButtonStyle : {}),
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            {mode}
          </button>
        ))}
      </div>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapboxMapaInteractivo;
