import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useMap, useMapEvents } from "react-leaflet/hooks";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const GEOAPIFY_KEY = "2c02f2a1336a49c193fb75f1ff86f803";
const DEFAULT_CENTER: [number, number] = [12.9416, 77.62];

export interface BusMarker {
  id: string;
  position: { lat: number; lng: number };
  label?: string;
  color?: string;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  steps: { instruction: string; distance: number; duration: number }[];
}

interface MapProps {
  height?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: BusMarker[];
  routePath?: { lat: number; lng: number }[];
  useRouting?: boolean;
  className?: string;
  onRouteInfo?: (info: RouteInfo) => void;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
}

function createIcon(color = "#2563eb", label?: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="12" fill="${color}" stroke="#fff" stroke-width="2"/>
    ${label ? `<text x="14" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold" font-family="sans-serif">${label}</text>` : ""}
  </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [28, 28], iconAnchor: [14, 14] });
}

function FitBounds({ markers, routePath }: { markers: BusMarker[]; routePath?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [
      ...markers.map((m) => [m.position.lat, m.position.lng] as [number, number]),
      ...(routePath ?? []),
    ];
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [30, 30] });
    }
  }, [markers, routePath, map]);
  return null;
}

function ClickHandler({ onClick }: { onClick: (latlng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function BusMap({
  height = "320px",
  center,
  zoom = 13,
  markers = [],
  routePath,
  useRouting = false,
  className = "",
  onRouteInfo,
  onMapClick,
}: MapProps) {
  const [routeLine, setRouteLine] = useState<[number, number][] | null>(null);
  const mapCenter: [number, number] = center ? [center.lat, center.lng] : DEFAULT_CENTER;

  const stableRouteKey = routePath
    ? routePath.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|")
    : "";

  useEffect(() => {
    if (!useRouting || !routePath || routePath.length < 2) {
      setRouteLine(null);
      return;
    }
    const waypoints = routePath.map((p) => `${p.lat},${p.lng}`).join("|");
    const url = `https://api.geoapify.com/v1/routing?waypoints=${encodeURIComponent(waypoints)}&mode=drive&apiKey=${GEOAPIFY_KEY}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const coords: [number, number][] = feature.geometry.coordinates
            .flat(feature.geometry.type === "MultiLineString" ? 1 : 0)
            .map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRouteLine(coords);
          if (onRouteInfo) {
            const props = feature.properties;
            const steps: RouteInfo["steps"] = [];
            if (props.legs) {
              for (const leg of props.legs) {
                for (const step of leg.steps ?? []) {
                  steps.push({ instruction: step.instruction?.text ?? "", distance: step.distance ?? 0, duration: step.time ?? 0 });
                }
              }
            }
            onRouteInfo({ distance: props.distance ?? 0, duration: props.time ?? 0, steps });
          }
        }
      })
      .catch(() => setRouteLine(null));
  }, [stableRouteKey, useRouting]);

  const displayPath: [number, number][] | undefined =
    useRouting && routeLine
      ? routeLine
      : routePath && routePath.length > 1
        ? routePath.map((p) => [p.lat, p.lng] as [number, number])
        : undefined;

  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{ height }}>
      <MapContainer center={mapCenter} zoom={zoom} style={{ width: "100%", height: "100%" }} scrollWheelZoom attributionControl={false}>
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`}
          attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a>'
        />
        <FitBounds markers={markers} routePath={displayPath} />
        {onMapClick && <ClickHandler onClick={onMapClick} />}
        {markers.map((m) => (
          <Marker key={m.id} position={[m.position.lat, m.position.lng]} icon={createIcon(m.color, m.label)} />
        ))}
        {displayPath && displayPath.length > 1 && (
          <Polyline positions={displayPath} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.8 }} />
        )}
      </MapContainer>
    </div>
  );
}
