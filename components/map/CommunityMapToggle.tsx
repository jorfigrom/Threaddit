"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

interface PostLocation {
  id: string;
  latitude: number;
  longitude: number;
  placeName?: string;
  address?: string;
  imageThread?: string;
  authorBio?: string;
}

interface Props {
  postLocations: PostLocation[];
}

const MapboxMapaInteractivo = dynamic(() => import("@/components/map/Mapbox"), {
  ssr: false,
});

const CommunityMapToggle: React.FC<Props> = ({ postLocations }) => {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowMap((prev) => !prev)}
        className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition"
      >
        {showMap ? "Ocultar mapa" : "Ver mapa"}
      </button>

      {showMap && <MapboxMapaInteractivo postLocations={postLocations} />}
    </div>
  );
};

export default CommunityMapToggle;
