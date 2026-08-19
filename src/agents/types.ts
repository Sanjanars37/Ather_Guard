export type Hazard = "earthquake" | "flood" | "wildfire" | "relief";
export type Severity = "low" | "medium" | "high" | "critical";

export interface TrendPoint {
  t: string;
  value: number;
}

export interface Trend {
  label: string;
  unit: string;
  points: TrendPoint[];
}

export interface Alert {
  id: string;
  hazard: Hazard;
  severity: Severity;
  title: string;
  location: string;
  lat: number;
  lon: number;
  /** Literal data points that triggered this alert (explainable-AI reasoning). */
  reasoning: string[];
  /** Longer narrative, e.g. Gemini-generated relief recommendation. */
  detail?: string;
  trend?: Trend;
  triggeredAt: string;
  source: string;
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0,
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  low: "#3b82f6",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};
