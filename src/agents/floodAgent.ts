import type { Alert, Severity } from "./types";
import type { WatchPoint } from "./watchlist";
import { FLOOD_WATCHLIST } from "./watchlist";

const BASE_URL = "https://flood-api.open-meteo.com/v1/flood";

interface FloodDaily {
  time: string[];
  river_discharge: number[];
  river_discharge_mean: number[];
}

interface FloodResult {
  latitude: number;
  longitude: number;
  daily: FloodDaily;
}

/** Discharge-vs-baseline anomaly ratio -> severity band. */
function severityForAnomaly(ratio: number): Severity {
  if (ratio >= 2.5) return "critical";
  if (ratio >= 1.5) return "high";
  if (ratio >= 1.2) return "medium";
  return "low";
}

/** Fetches flood risk for arbitrary points — returns every point, all severities included. */
export async function fetchFloodRiskForPoints(points: WatchPoint[]): Promise<Alert[]> {
  if (points.length === 0) return [];

  const lats = points.map((p) => p.lat).join(",");
  const lons = points.map((p) => p.lon).join(",");
  const url = `${BASE_URL}?latitude=${lats}&longitude=${lons}&daily=river_discharge,river_discharge_mean&past_days=7&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo flood API responded with ${res.status}`);
  }
  const data = await res.json();
  const results: FloodResult[] = Array.isArray(data) ? data : [data];

  const alerts: Alert[] = [];

  results.forEach((result, i) => {
    const point = points[i];
    if (!point || !result.daily?.river_discharge?.length) return;

    const lastIdx = result.daily.river_discharge.length - 1;
    const discharge = result.daily.river_discharge[lastIdx];
    const mean = result.daily.river_discharge_mean[lastIdx];
    if (discharge == null || mean == null || mean === 0) return;

    const ratio = discharge / mean;
    const severity = severityForAnomaly(ratio);

    alerts.push({
      id: `flood-${point.name}`,
      hazard: "flood",
      severity,
      title: `Elevated River Discharge`,
      location: point.name,
      lat: point.lat,
      lon: point.lon,
      reasoning: [
        `River discharge ${discharge.toFixed(0)} m³/s`,
        `${(ratio * 100).toFixed(0)}% of the 30-day mean (${mean.toFixed(0)} m³/s)`,
      ],
      trend: {
        label: "River discharge",
        unit: "m³/s",
        points: result.daily.time.map((t, idx) => ({
          t,
          value: result.daily.river_discharge[idx],
        })),
      },
      triggeredAt: new Date().toISOString(),
      source: "Open-Meteo Flood API",
    });
  });

  return alerts;
}

/** Watchlist-driven feed for the alert dashboard — active (non-low) alerts only. */
export async function fetchFloodAlerts(): Promise<Alert[]> {
  const risks = await fetchFloodRiskForPoints(FLOOD_WATCHLIST);
  return risks.filter((a) => a.severity !== "low");
}
