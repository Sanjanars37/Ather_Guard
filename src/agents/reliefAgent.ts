import type { Alert } from "./types";

interface ReliefResponse {
  summary: string;
  corridors: string[];
  shelters: string[];
}

/**
 * Unlike the other three agents, Relief/Logistics has no live public feed to
 * poll. It reasons over the other agents' current real alerts via Gemini
 * (proxied through /api/relief-recommendation so the key stays server-side)
 * and produces one aggregated recommendation, not a fabricated data feed.
 */
export async function fetchReliefAlerts(activeAlerts: Alert[]): Promise<Alert[]> {
  if (activeAlerts.length === 0) return [];

  const highSeverity = activeAlerts.filter(
    (a) => a.severity === "high" || a.severity === "critical"
  );
  if (highSeverity.length === 0) return [];

  const res = await fetch("/api/relief-recommendation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alerts: highSeverity.map((a) => ({
        hazard: a.hazard,
        severity: a.severity,
        location: a.location,
        reasoning: a.reasoning,
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Relief recommendation API responded with ${res.status}`);
  }
  const data: ReliefResponse = await res.json();

  const lat = highSeverity.reduce((sum, a) => sum + a.lat, 0) / highSeverity.length;
  const lon = highSeverity.reduce((sum, a) => sum + a.lon, 0) / highSeverity.length;

  const detailSections = [
    data.summary,
    data.corridors.length
      ? `Evacuation corridors:\n${data.corridors.map((c) => `- ${c}`).join("\n")}`
      : null,
    data.shelters.length
      ? `Shelter / resource allocation:\n${data.shelters.map((s) => `- ${s}`).join("\n")}`
      : null,
  ].filter((section): section is string => Boolean(section));

  return [
    {
      id: "relief-current",
      hazard: "relief",
      severity: highSeverity.some((a) => a.severity === "critical") ? "critical" : "high",
      title: "Relief & Logistics Recommendation",
      location: `${highSeverity.length} active high-severity hazard${highSeverity.length > 1 ? "s" : ""}`,
      lat,
      lon,
      reasoning: highSeverity.map((a) => `${a.hazard} — ${a.location} (${a.severity})`),
      detail: detailSections.join("\n\n"),
      triggeredAt: new Date().toISOString(),
      source: "Gemini reasoning over active agent alerts",
    },
  ];
}
