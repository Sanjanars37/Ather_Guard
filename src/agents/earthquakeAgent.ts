import type { Alert, Severity } from "./types";

const FEED_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    tsunami: number;
    url: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

interface UsgsResponse {
  features: UsgsFeature[];
}

function severityForMagnitude(mag: number): Severity {
  if (mag >= 6.0) return "critical";
  if (mag >= 5.0) return "high";
  if (mag >= 4.0) return "medium";
  return "low";
}

export async function fetchEarthquakeAlerts(): Promise<Alert[]> {
  const res = await fetch(FEED_URL);
  if (!res.ok) {
    throw new Error(`USGS feed responded with ${res.status}`);
  }
  const data: UsgsResponse = await res.json();

  return data.features
    .filter((f) => typeof f.properties.mag === "number")
    .map((f) => {
      const mag = f.properties.mag as number;
      const [lon, lat, depth] = f.geometry.coordinates;
      const severity = severityForMagnitude(mag);
      const reasoning = [
        `Magnitude ${mag.toFixed(1)}`,
        `Depth ${depth.toFixed(1)} km`,
      ];
      if (f.properties.tsunami === 1) {
        reasoning.push("Tsunami advisory issued by USGS");
      }

      const alert: Alert = {
        id: `earthquake-${f.id}`,
        hazard: "earthquake",
        severity,
        title: `M${mag.toFixed(1)} Earthquake`,
        location: f.properties.place ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        lat,
        lon,
        reasoning,
        triggeredAt: new Date(f.properties.time).toISOString(),
        source: "USGS",
      };
      return alert;
    })
    .filter((a) => a.severity !== "low");
}
