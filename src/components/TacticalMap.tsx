import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { Alert } from "../agents/types";
import { SEVERITY_COLOR } from "../agents/types";

const RADIUS_BY_SEVERITY: Record<Alert["severity"], number> = {
  low: 5,
  medium: 7,
  high: 9,
  critical: 12,
};

interface TacticalMapProps {
  alerts: Alert[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TacticalMap({ alerts, selectedId, onSelect }: TacticalMapProps) {
  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={2}
      className="w-full h-full"
      style={{ background: "#050505" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {alerts.map((alert) => (
        <CircleMarker
          key={alert.id}
          center={[alert.lat, alert.lon]}
          radius={alert.id === selectedId ? RADIUS_BY_SEVERITY[alert.severity] + 3 : RADIUS_BY_SEVERITY[alert.severity]}
          pathOptions={{
            color: SEVERITY_COLOR[alert.severity],
            fillColor: SEVERITY_COLOR[alert.severity],
            fillOpacity: alert.id === selectedId ? 0.9 : 0.6,
            weight: alert.id === selectedId ? 2 : 1,
          }}
          eventHandlers={{ click: () => onSelect(alert.id) }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            <span className="text-xs font-semibold">{alert.title}</span>
            <br />
            <span className="text-xs">{alert.location}</span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
