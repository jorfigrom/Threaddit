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
  const [userLocationState, setUserLocation] = useState(userLocation);
  const [similarPosts, setSimilarPosts] = useState<PostLocation[] | null>(null);

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
            .sort(
              (a, b) =>
                new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime()
            ) // Ordenar por fecha descendente
            .slice(0, 3) // Seleccionar los 3 más recientes
            .map((post) => post.id)
        );
      case "Cerca de mí":
        if (!userLocationState) return new Set();
        const nearbyPosts = [...postLocations]
          .map((post) => ({
            ...post,
            distance: haversineDistance(
              post.latitude,
              post.longitude,
              userLocationState.latitude,
              userLocationState.longitude
            ),
          }))
          .filter((post) => post.distance <= 10) // Cambiar el radio a 10 km
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)); // Ordenar por distancia

        console.log("Nearby posts:", nearbyPosts); // Depuración
        return new Set(nearbyPosts.map((post) => post.id));
      default:
        return new Set(); // No destacar ningún post en "Explorar"
    }
  };

  const findSimilarPosts = (post: PostLocation) => {
    if (!post || !post.address) return [];

    // Convertir la dirección del post actual a minúsculas y eliminar caracteres especiales
    const normalizedAddress = post.address
      .toLowerCase()
      .replace(/[^\w\s]/g, ""); // Eliminar caracteres especiales

    // Buscar posts que contengan palabras clave de la dirección en su texto completo
    return postLocations.filter((p) => {
      if (!p.address || p.id === post.id) return false; // Excluir el post actual y posts sin dirección

      // Normalizar la dirección del post a comparar
      const normalizedOtherAddress = p.address
        .toLowerCase()
        .replace(/[^\w\s]/g, ""); // Eliminar caracteres especiales

      // Verificar si alguna palabra de la dirección del post actual está en la dirección del otro post
      return normalizedAddress.split(" ").some((keyword) =>
        normalizedOtherAddress.includes(keyword)
      );
    });
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocationState
        ? [userLocationState.longitude, userLocationState.latitude] : [0, 0], // Centrar en la ubicación del usuario si está disponible
      zoom: 2,
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User location:", position.coords);
          const userCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(userCoords);

          // Agregar marcador morado para la ubicación del usuario
          if (mapRef.current) {
            new mapboxgl.Marker({ color: "#800080" }) // Morado
              .setLngLat([userCoords.longitude, userCoords.latitude])
              .setPopup(
                new mapboxgl.Popup().setHTML(`
                  <div style="font-size: 12px; color: black;">
                    <strong>Tu ubicación</strong>
                  </div>
                `)
              )
              .addTo(mapRef.current);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not available in this browser.");
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Eliminar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const highlightedPosts = getHighlightedPosts();

    postLocations.forEach((post) => {
      const isHighlighted = highlightedPosts.has(post.id);

      console.log("-----------------------------------", post.address)

      const marker = new mapboxgl.Marker({
        color: isHighlighted ? "#f97316" : "#3b82f6", // Naranja para destacados, azul para el resto
      })
        .setLngLat([post.longitude, post.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="max-width: 200px; background-color: white; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
              <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: black;">${post.authorBio || "Anónimo"}</h3>
              <p style="font-size: 12px; margin-bottom: 8px; color: black;">${post.address || "Sin dirección"}</p>
              ${post.imageThread
              ? `<img src="${post.imageThread}" alt="Imagen" style="width: 100%; border-radius: 8px; margin-bottom: 8px;" />`
              : ""
            }
              <p style="font-size: 12px; color: black;">Likes: ${post.likes?.length ?? 0}</p>
              <button 
                style="margin-top: 8px; padding: 5px 10px; font-size: 12px; background-color: #3887be; color: white; border: none; border-radius: 4px; cursor: pointer;"
                onclick="window.showSimilarPosts('${post.id}')"
              >
                Ver similares
              </button>
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
      mapRef.current.flyTo({ center: [avgLng, avgLat], zoom: 9 });
    }
  }, [mapMode, postLocations, userLocationState]);

  // Exponer la función para mostrar posts similares
  useEffect(() => {
    (window as any).showSimilarPosts = (postId: string) => {
      const post = postLocations.find((p) => p.id === postId);
      if (post) {
        const similar = findSimilarPosts(post);
        setSimilarPosts(similar);
      }
    };
  }, [postLocations]);

  console.log("-------------", postLocations, "--------------------", userLocationState); // Depuración

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
      {similarPosts && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "300px",
            height: "100%",
            backgroundColor: "#fff",
            zIndex: 2,
            overflowY: "auto",
            borderRight: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <button
            onClick={() => setSimilarPosts(null)}
            style={{
              display: "block",
              marginBottom: "10px",
              padding: "5px 10px",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
          <h3>Posts similares</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {similarPosts.map((post) => (
              <li
                key={post.id}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9",
                  color: "#333", // Color de texto oscuro
                }}
              >
                <h4 style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#222" }}>
                  {post.authorBio || "Anónimo"}
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>
                  {post.address || "Sin dirección"}
                </p>
              </li>
            ))}
          </ul>

        </div>
      )}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapboxMapaInteractivo;
