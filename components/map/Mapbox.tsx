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
  likes?: number;
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

const MapboxMapaInteractivo: React.FC<Props> = ({ postLocations, userLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapMode, setMapMode] = useState("Reciente");

  const filteredLocations = (): PostLocation[] => {
    switch (mapMode) {
      case "Popular":
        return [...postLocations].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
      case "Reciente":
        return [...postLocations].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      case "Explorar":
        return [...postLocations].sort(() => Math.random() - 0.5).slice(0, 10);
      case "Cerca de mí":
        if (!userLocation) return [];
        return [...postLocations]
          .map((post) => ({
            ...post,
            distance: Math.sqrt(
              Math.pow(post.latitude - userLocation.latitude, 2) +
              Math.pow(post.longitude - userLocation.longitude, 2)
            ),
          }))
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
          .slice(0, 10);
      default:
        return postLocations;
    }
  };

  // Inicializar mapa una vez
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-5.9823, 37.3886],
      zoom: 10,
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  // Actualizar marcadores cuando cambia el modo
  useEffect(() => {
    if (!mapRef.current) return;

    // Eliminar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const postsToShow = filteredLocations();

    postsToShow.forEach((post) => {
      const marker = new mapboxgl.Marker({ color: "#3b82f6" })
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
            </div>
          `)
        )
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    // Centrar mapa si hay posts
    if (postsToShow.length > 0) {
      const avgLng = postsToShow.reduce((sum, p) => sum + p.longitude, 0) / postsToShow.length;
      const avgLat = postsToShow.reduce((sum, p) => sum + p.latitude, 0) / postsToShow.length;
      mapRef.current.flyTo({ center: [avgLng, avgLat], zoom: 11 });
    }
  }, [mapMode, postLocations, userLocation]);

  return (
    <div style={{ position: "relative", width: "100%", height: "500px" }}>
      <div style={menuStyle}>
        {["Reciente", "Popular", "Explorar", "Cerca de mí"].map((mode) => (
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
