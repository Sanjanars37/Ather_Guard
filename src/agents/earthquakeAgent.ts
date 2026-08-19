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

export function severityForMagnitude(mag: number): Severity {
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

export interface RegionalSeismicActivity {
  radiusKm: number;
  count: number;
  maxMagnitude: number | null;
  severity: Severity;
  recentQuakes: { mag: number; place: string; time: string }[];
}

/**
 * There's no "seismic hazard score" API for an arbitrary point — this
 * reports actual recorded activity in the area over the last 30 days as
 * an honest proxy for regional risk, not a fabricated forecast.
 */
export async function fetchRegionalSeismicActivity(
  lat: number,
  lon: number,
  radiusKm = 300
): Promise<RegionalSeismicActivity> {
  const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url =
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}` +
    `&maxradiuskm=${radiusKm}&minmagnitude=2.5&starttime=${startTime}&orderby=magnitude`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`USGS query API responded with ${res.status}`);
  }
  const data: UsgsResponse = await res.json();

  const quakes = data.features
    .filter((f) => typeof f.properties.mag === "number")
    .map((f) => ({
      mag: f.properties.mag as number,
      place: f.properties.place ?? "Unknown location",
      time: new Date(f.properties.time).toISOString(),
    }));

  const maxMagnitude = quakes.length > 0 ? quakes[0].mag : null;

  return {
    radiusKm,
    count: quakes.length,
    maxMagnitude,
    severity: maxMagnitude != null ? severityForMagnitude(maxMagnitude) : "low",
    recentQuakes: quakes.slice(0, 5),
  };
}
