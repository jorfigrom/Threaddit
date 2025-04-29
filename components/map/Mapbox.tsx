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
  const markersRef = useRef<{ marker: mapboxgl.Marker; postId: string }[]>([]);
  const [mapMode, setMapMode] = useState("Explorar");
  const [userLocationState, setUserLocation] = useState(userLocation);
  const [similarPosts, setSimilarPosts] = useState<PostLocation[] | null>(null);

  // Filtrar los posts según el modo seleccionado
  const getFilteredPosts = () => {
    switch (mapMode) {
      case "Reciente":
        return [...postLocations].sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      case "Popular":
        return [...postLocations].sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0));
      default:
        return postLocations; // "Explorar" y "Cerca de mí" muestran todos los posts
    }
  };

  const findSimilarPosts = (post: PostLocation) => {
    if (!post || !post.address) return [];

    const normalizedAddress = post.address
      .toLowerCase()
      .replace(/[^\w\s]/g, ""); // Eliminar caracteres especiales

    return postLocations.filter((p) => {
      if (!p.address || p.id === post.id) return false;

      const normalizedOtherAddress = p.address
        .toLowerCase()
        .replace(/[^\w\s]/g, "");

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
        ? [userLocationState.longitude, userLocationState.latitude]
        : [0, 0],
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

          if (mapRef.current) {
            new mapboxgl.Marker({ color: "#800080" })
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

    // Eliminar marcadores existentes
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    // Obtener los posts filtrados
    const filteredPosts = getFilteredPosts();

    // Determinar los posts destacados según el filtro
    const highlightedPosts = new Set<string>();
    if (mapMode === "Reciente") {
      // Resaltar los 3 posts más recientes
      const sortedByDate = [...filteredPosts].sort(
        (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
      sortedByDate.slice(0, 3).forEach((post) => highlightedPosts.add(post.id));
    } else if (mapMode === "Cerca de mí") {
      // Resaltar los 3 posts más cercanos
      if (userLocationState) {
        const sortedByDistance = [...filteredPosts].sort((a, b) => {
          const distanceA = haversineDistance(
            userLocationState.latitude,
            userLocationState.longitude,
            a.latitude,
            a.longitude
          );
          const distanceB = haversineDistance(
            userLocationState.latitude,
            userLocationState.longitude,
            b.latitude,
            b.longitude
          );
          return distanceA - distanceB;
        });
        sortedByDistance
          .filter((post) => {
            const distance = haversineDistance(
              userLocationState.latitude,
              userLocationState.longitude,
              post.latitude,
              post.longitude
            );
            return distance <= 50; // Solo resaltar posts a menos de 50 km
          })
          .slice(0, 3)
          .forEach((post) => highlightedPosts.add(post.id));
      }
    } else if (mapMode === "Popular") {
      // Resaltar los 3 posts con más likes que tengan >0 likes
      const sortedByLikes = [...filteredPosts]
        .filter((post) => (post.likes?.length ?? 0) > 0) // Filtrar posts con más de 0 likes
        .sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0));
      sortedByLikes.slice(0, 3).forEach((post) => highlightedPosts.add(post.id));
    }

    // Agregar marcadores para los posts filtrados
    filteredPosts.forEach((post) => {
      const isHighlighted = highlightedPosts.has(post.id);

      const popup = new mapboxgl.Popup().setHTML(`
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
      `);

      const marker = new mapboxgl.Marker({
        color: isHighlighted ? "#f97316" : "#3b82f6", // Naranja para destacados, azul para el resto
      })
        .setLngLat([post.longitude, post.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push({ marker, postId: post.id });
    });

    // Centrar el mapa si hay posts
    if (filteredPosts.length > 0) {
      const avgLng = filteredPosts.reduce((sum, p) => sum + p.longitude, 0) / filteredPosts.length;
      const avgLat = filteredPosts.reduce((sum, p) => sum + p.latitude, 0) / filteredPosts.length;
      mapRef.current.flyTo({ center: [avgLng, avgLat], zoom: 9 });
    }
  }, [postLocations, mapMode, userLocationState]);

  const handleSimilarPostClick = (postId: string) => {
    setSimilarPosts(null); // Cerrar el listado de posts similares

    // Cerrar todos los popups abiertos
    markersRef.current.forEach(({ marker }) => marker.getPopup()?.remove());

    // Buscar el marcador correspondiente al post seleccionado
    const markerData = markersRef.current.find((m) => m.postId === postId);
    if (markerData) {
      markerData.marker.togglePopup(); // Abrir el popup del marcador seleccionado
    }
  };

  useEffect(() => {
    (window as any).showSimilarPosts = (postId: string) => {
      const post = postLocations.find((p) => p.id === postId);
      if (post) {
        const similar = findSimilarPosts(post);
        setSimilarPosts(similar);
      }
    };
  }, [postLocations]);

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
          <h3 style={{color: "#333"}}>Posts similares</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {similarPosts.map((post) => (
              <li
                key={post.id}
                onClick={() => handleSimilarPostClick(post.id)}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9",
                  color: "#333",
                  cursor: "pointer",
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
