"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

interface PostLocation {
  id: string;
  latitude: number;
  longitude: number;
  placeName?: string;
  address?: string;
}

interface MapboxMapaInteractivoProps {
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
    placeName?: string;
    address?: string;
  }) => void;
  postLocations?: PostLocation[];
}

const MapboxMapaInteractivo: React.FC<MapboxMapaInteractivoProps> = ({
  onLocationChange,
  postLocations = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Guardar handler como ref si cambia
  const onLocationChangeRef = useRef(onLocationChange);
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-5.9823, 37.3886],
      zoom: 10,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl as any,
      marker: false,
    });

    mapRef.current.addControl(geocoder);

    // Usuario busca un lugar
    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current!);
      }

      onLocationChangeRef.current?.({
        latitude: lat,
        longitude: lng,
        placeName: e.result.text,
        address: e.result.place_name,
      });

      mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
    });

    // Usuario hace click
    mapRef.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current!);
      }

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      const placeName = data.features[0]?.text || "Ubicación seleccionada";
      const address = data.features[0]?.place_name || "";

      onLocationChangeRef.current?.({
        latitude: lat,
        longitude: lng,
        placeName,
        address,
      });

      mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    postLocations.forEach((post) => {
      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([post.longitude, post.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${post.placeName || "Post"}</h3>`))
        .addTo(mapRef.current!);
    });
  }, [postLocations]);

  return (
    <div className="w-full">
      <div ref={mapContainerRef} style={{ width: "100%", height: "400px" }} />
    </div>
  );
};

export default MapboxMapaInteractivo;
