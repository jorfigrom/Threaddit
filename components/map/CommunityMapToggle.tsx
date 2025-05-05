"use client";

import { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";

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

const MapboxMapaInteractivo = dynamic(() => import("@/components/map/Mapbox"), {
  ssr: false,
});

const CommunityMapToggle = ({ postLocations }: { postLocations: PostLocation[] }) => {
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
      },
      (err) => console.error("Error obteniendo ubicación:", err)
    );
  }, []);

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowMap((prev) => !prev)}
        disabled={isPending}
        className="px-4 py-2 rounded-full text-sm font-medium transition border bg-primary text-white border-primary hover:opacity-90"
      >
        {showMap ? "Ocultar mapa" : "Ver mapa"}
      </button>

      {showMap && (
        <MapboxMapaInteractivo postLocations={postLocations} userLocation={userLocation} />
      )}
    </div>
  );
};

export default CommunityMapToggle;
