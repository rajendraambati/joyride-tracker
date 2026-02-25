import { useRef, useCallback, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyB7XRegw6kpVTOPwiasXBhdoX0VaHmBRcE";

// Bangalore center
const DEFAULT_CENTER = { lat: 12.9416, lng: 77.6200 };

interface BusMarker {
  id: string;
  position: { lat: number; lng: number };
  label?: string;
  color?: string;
}

interface MapProps {
  height?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: BusMarker[];
  routePath?: { lat: number; lng: number }[];
  showTraffic?: boolean;
  className?: string;
}

export default function BusMap({
  height = "320px",
  center = DEFAULT_CENTER,
  zoom = 13,
  markers = [],
  routePath,
  className = "",
}: MapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  if (loadError) {
    return (
      <div className={`rounded-xl bg-destructive/10 flex items-center justify-center text-destructive text-sm ${className}`} style={{ height }}>
        Failed to load Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`rounded-xl bg-muted flex items-center justify-center text-muted-foreground ${className}`} style={{ height }}>
        <div className="animate-pulse text-sm">Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height, borderRadius: "0.75rem" }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "simplified" }] },
        ],
      }}
    >
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={m.position}
          label={m.label ? { text: m.label, color: "#fff", fontWeight: "bold", fontSize: "11px" } : undefined}
          icon={
            m.color
              ? {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: m.color,
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                  scale: 12,
                }
              : undefined
          }
        />
      ))}

      {routePath && routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{
            strokeColor: "#2563eb",
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      )}
    </GoogleMap>
  );
}
