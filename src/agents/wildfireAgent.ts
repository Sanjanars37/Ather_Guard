import type { Alert, Severity } from "./types";
import type { WatchPoint } from "./watchlist";
import { WILDFIRE_WATCHLIST } from "./watchlist";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

interface WeatherHourly {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  wind_speed_10m: number[];
}

interface WeatherResult {
  latitude: number;
  longitude: number;
  hourly: WeatherHourly;
}

/**
 * Simplified fire-weather risk heuristic (0-100) built from real live
 * temperature/humidity/wind data. This is NOT the official Fosberg Fire
 * Weather Index — it's an honest approximation, weighted toward dryness
 * (low humidity) as the dominant driver of fire spread risk.
 */
function fireRiskIndex(tempC: number, humidityPct: number, windKmh: number): number {
  const drynessFactor = clamp(100 - humidityPct, 0, 100);
  const windFactor = clamp(windKmh * 2, 0, 100);
  const tempFactor = clamp((tempC - 15) * 3, 0, 100);
  return 0.4 * drynessFactor + 0.35 * windFactor + 0.25 * tempFactor;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function severityForRiskIndex(index: number): Severity {
  if (index >= 70) return "critical";
  if (index >= 50) return "high";
  if (index >= 30) return "medium";
  return "low";
}

/** Fetches fire-weather risk for arbitrary points — returns every point, all severities included. */
export async function fetchWildfireRiskForPoints(points: WatchPoint[]): Promise<Alert[]> {
  if (points.length === 0) return [];

  const lats = points.map((p) => p.lat).join(",");
  const lons = points.map((p) => p.lon).join(",");
  const url = `${BASE_URL}?latitude=${lats}&longitude=${lons}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&past_days=1&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo weather API responded with ${res.status}`);
  }
  const data = await res.json();
  const results: WeatherResult[] = Array.isArray(data) ? data : [data];

  const alerts: Alert[] = [];

  results.forEach((result, i) => {
    const point = points[i];
    if (!point || !result.hourly?.temperature_2m?.length) return;

    const { time, temperature_2m, relative_humidity_2m, wind_speed_10m } = result.hourly;
    const riskSeries = temperature_2m.map((t, idx) =>
      fireRiskIndex(t, relative_humidity_2m[idx], wind_speed_10m[idx])
    );

    const lastIdx = riskSeries.length - 1;
    const currentRisk = riskSeries[lastIdx];
    const severity = severityForRiskIndex(currentRisk);

    alerts.push({
      id: `wildfire-${point.name}`,
      hazard: "wildfire",
      severity,
      title: "Elevated Fire Weather Risk",
      location: point.name,
      lat: point.lat,
      lon: point.lon,
      reasoning: [
        `${temperature_2m[lastIdx].toFixed(0)}°C, ${relative_humidity_2m[lastIdx].toFixed(0)}% humidity`,
        `Wind ${wind_speed_10m[lastIdx].toFixed(0)} km/h`,
        `Fire-weather risk index ${currentRisk.toFixed(0)}/100`,
      ],
      trend: {
        label: "Fire-weather risk index",
        unit: "/100",
        points: time.map((t, idx) => ({ t, value: Math.round(riskSeries[idx]) })),
      },
      triggeredAt: new Date().toISOString(),
      source: "Open-Meteo Weather API",
    });
  });

  return alerts;
}

/** Watchlist-driven feed for the alert dashboard — active (non-low) alerts only. */
export async function fetchWildfireAlerts(): Promise<Alert[]> {
  const risks = await fetchWildfireRiskForPoints(WILDFIRE_WATCHLIST);
  return risks.filter((a) => a.severity !== "low");
}
