"use client";

import React, { useEffect, useRef } from "react";
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
}

interface MapboxMapaInteractivoProps {
  postLocations: PostLocation[];
}

const MapboxMapaInteractivo: React.FC<MapboxMapaInteractivoProps> = ({ postLocations }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    // Calcular el centro del mapa basado en las ubicaciones de los posts
    const defaultCenter: [number, number] = [-5.9823, 37.3886]; // Coordenadas predeterminadas (Sevilla)
    const mapCenter: [number, number] =
      postLocations.length > 0
        ? [
            postLocations.reduce((sum, post) => sum + post.longitude, 0) / postLocations.length,
            postLocations.reduce((sum, post) => sum + post.latitude, 0) / postLocations.length,
          ]
        : defaultCenter;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: mapCenter, // Usar el centro calculado
      zoom: 10,
    });

    // Agregar marcadores con popups
    postLocations.forEach((post) => {
      const marker = new mapboxgl.Marker({ color: "#3b82f6" }) // Azul
        .setLngLat([post.longitude, post.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="max-width: 200px; background-color: white; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
              <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: black;">Autor: ${post.authorBio || "Anónimo"}</h3>
              <p style="font-size: 12px; margin-bottom: 8px; color: black;">${post.address || "Sin descripción"}</p>
              ${
                post.imageThread
                  ? `<img src="${post.imageThread}" alt="Post Image" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 8px;" />`
                  : ""
              }
              <p style="font-size: 10px; color: black;">Autor: ${post.authorBio || "Anónimo"}</p>
            </div>
          `)
        )
        .addTo(mapRef.current!);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [postLocations]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "400px" }} />;
};

export default MapboxMapaInteractivo;
